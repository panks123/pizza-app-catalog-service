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

const router = express.Router();

const productService = new ProductService();
const productController = new ProductController(productService, logger);

// router.get("/", asyncWrapper(productController.getAll));

// router.get("/:categoryId", asyncWrapper(productController.getOne));

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload(),
    productValidator,
    asyncWrapper(productController.create),
);

export default router;
