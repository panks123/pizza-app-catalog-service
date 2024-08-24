import { ProductService } from "./product-service";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import {
    Attribute,
    PriceConfiguration,
    Product,
    ProductFilters,
} from "./product-types";
import { Logger } from "winston";
import { FileStorage } from "../common/types/storage";
import { v4 as uuid4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import mongoose from "mongoose";

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: FileStorage,
        private logger: Logger,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const validationRes = validationResult(req);
        if (!validationRes.isEmpty()) {
            return next(
                createHttpError(400, validationRes.array()[0].msg as string),
            );
        }

        const image = req.files!.image as UploadedFile;
        const imageName = uuid4();
        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer,
        });
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
            image: imageName,
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

    update = async (req: Request, res: Response, next: NextFunction) => {
        const validationRes = validationResult(req);
        if (!validationRes.isEmpty()) {
            return next(
                createHttpError(400, validationRes.array()[0].msg as string),
            );
        }

        const { productId } = req.params;
        const productDetails =
            await this.productService.getProductById(productId);
        if (!productDetails) {
            return next(createHttpError(404, "Product not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenantId = (req as AuthRequest).auth.tenant;
            if (productDetails.tenantId !== tenantId) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product",
                    ),
                );
            }
        }

        let imageName: string | undefined;
        const oldImage = productDetails.image;
        if (req.files?.image) {
            const image = req.files.image as UploadedFile;
            imageName = uuid4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });

            await this.storage.delete(oldImage);
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

        const product = {
            name,
            description,
            image: (imageName ?? oldImage)!,
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

        await this.productService.updateProduct(productId, product);
        this.logger.info("Product was updated", { productId });
        res.json({ id: productId });
    };

    getAll = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublish, page, limit } = req.query;
        const filters: ProductFilters = {};
        if (isPublish === "true") filters.isPublish = true;

        if (tenantId) filters.tenantId = tenantId as string;

        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId as string))
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );

        const products = await this.productService.getAll(
            (q as string)?.trim(),
            filters,
            {
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
            },
        );

        const finalProducts = products.data.map((product: Product) => ({
            ...product,
            image: this.storage.getObjectUri(product.image),
        }));

        const result = { ...products, data: finalProducts };

        this.logger.info("All products were successfully fetched!");
        res.json(result);
    };

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params;
        const product = await this.productService.getProductById(productId);

        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }

        this.logger.info("Product fetched", { productId });
        res.json(product);
    };

    deleteOne = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params;
        const product = await this.productService.getProductById(productId);

        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenantId = (req as AuthRequest).auth.tenant;
            if (product.tenantId !== tenantId) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed delete this product",
                    ),
                );
            }
        }

        await this.productService.deleteOne(productId);
        const productImage = product.image;
        // after product deletion delete the image resource from s3
        this.logger.info("Product deleted", { productId });
        await this.storage.delete(productImage);

        res.json({ productId, msg: "success" });
    };
}
