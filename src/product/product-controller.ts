import { ProductService } from "./product-service";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Attribute, PriceConfiguration, Product } from "./product-types";
import { Logger } from "winston";
import { FileStorage } from "../common/types/storage";
import { v4 as uuid4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";

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

        res.json({ id: productId });
    };
}
