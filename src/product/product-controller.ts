import { ProductService } from "./product-service";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Attribute, PriceConfiguration, Product } from "./product-types";
import { Logger } from "winston";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
    ) {}
    create = async (req: Request, res: Response, next: NextFunction) => {
        const validationRes = validationResult(req);
        if (!validationRes.isEmpty()) {
            return next(
                createHttpError(400, validationRes.array()[0].msg as string),
            );
        }
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body as Product;

        const product: Product = {
            name,
            description,
            image: "image.jpg",
            priceConfiguration: JSON.parse(
                priceConfiguration as unknown as string,
            ) as PriceConfiguration,
            attributes: JSON.parse(
                attributes as unknown as string,
            ) as Attribute[],
            tenantId,
            categoryId,
            isPublish,
        };

        const newProduct = await this.productService.create(product);

        this.logger.info("Created product", { id: newProduct._id });
        res.json({ id: newProduct._id });
    };
}
