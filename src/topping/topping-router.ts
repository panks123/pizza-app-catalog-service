import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import toppingValidator from "./topping-validator";
import { asyncWrapper } from "../common/utils/wrapper";
import { ToppingController } from "./topping-controller";
import { ToppingService } from "./topping-service";
import { S3Storage } from "../common/services/S3Storage";
import logger from "../config/logger";

const router = express.Router();

const toppingService = new ToppingService();
const toppingController = new ToppingController(
    new S3Storage(),
    toppingService,
    logger,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, // 500 kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            return next(createHttpError(400, "File size exceeds"));
        },
    }),
    toppingValidator,
    asyncWrapper(toppingController.create),
);

export default router;
