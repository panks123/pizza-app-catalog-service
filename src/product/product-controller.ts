import { ProductService } from "./product-service";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class ProductController {
    constructor(private productService: ProductService) {
        this.create = this.create.bind(this);
    }
    create(req: Request, res: Response, next: NextFunction) {
        const validationRes = validationResult(req);
        if (!validationRes.isEmpty()) {
            return next(
                createHttpError(400, validationRes.array()[0].msg as string),
            );
        }
    }
}
