import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getOne = this.getOne.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const validationRes = validationResult(req);
        if (!validationRes.isEmpty()) {
            return next(
                createHttpError(400, validationRes.array()[0].msg as string),
            );
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info("Created category", { id: category._id });

        res.json({ id: category._id });
    }

    async getAll(req: Request, res: Response) {
        const categories = await this.categoryService.getAll();
        this.logger.info(`Getting categories list`);
        res.json(categories);
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params;
        const category = await this.categoryService.getOne(categoryId);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.info(`Getting category`, { id: category._id });
        res.json(category);
    }
}
