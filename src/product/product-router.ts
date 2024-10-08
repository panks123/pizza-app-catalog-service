import express from "express";
import { ProductController } from "./product-controller";
import productValidator from "./product-validator";
import { ProductService } from "./product-service";
import logger from "../config/logger";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import fileUpload from "express-fileupload";
import { S3Storage } from "../common/services/S3Storage";
import createHttpError from "http-errors";
import updateProductValidator from "./update-product-validator";
import { createProducerBroker } from "../common/factories/broker-factory";

const router = express.Router();

const productService = new ProductService();
const s3Storage = new S3Storage();
const broker = createProducerBroker();
const productController = new ProductController(
    productService,
    s3Storage,
    broker,
    logger,
);

// router.get("/", asyncWrapper(productController.getAll));

// router.get("/:categoryId", asyncWrapper(productController.getOne));

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: {
            fileSize: 500 * 1024, // 500kb
        },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            next(createHttpError(400, "File size exceeds the limit"));
        },
    }),
    productValidator,
    asyncWrapper(productController.create),
);

router.put(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: {
            fileSize: 500 * 1024, // 500kb
        },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            next(createHttpError(400, "File size exceeds the limit"));
        },
    }),
    updateProductValidator,
    asyncWrapper(productController.update),
);

router.get("/", asyncWrapper(productController.getAll));

router.get("/:productId", asyncWrapper(productController.getOne));

router.delete(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    asyncWrapper(productController.deleteOne),
);

export default router;
