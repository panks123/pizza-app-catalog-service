import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import { CategoryService } from "./category-service";
import logger from "../config/logger";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Category" });
});

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);
router.post("/", categoryValidator, categoryController.create);
export default router;
