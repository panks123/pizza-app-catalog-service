import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuid4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { CreateRequestBody, Topping } from "./topping-types";
import { Logger } from "winston";

export class ToppingController {
    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService,
        private logger: Logger,
    ) {}

    create = async (
        req: Request<object, object, CreateRequestBody>,
        res: Response,
        next: NextFunction,
    ) => {
        const validationRes = validationResult(req);

        if (!validationRes.isEmpty()) {
            return next(
                createHttpError(400, validationRes.array()[0].msg as string),
            );
        }

        try {
            const image = req.files!.image as UploadedFile;
            const imageName = uuid4();
            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });

            const topping = await this.toppingService.create({
                ...req.body,
                image: imageName,
                tenantId: req.body.tenantId,
            } as Topping);

            this.logger.info("Topping created", { id: topping._id });
            res.json({ id: topping._id });
        } catch (err) {
            return next(err);
        }
    };
}
