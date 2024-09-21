import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuid4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { CreateRequestBody, Topping, ToppingEvents } from "./topping-types";
import { Logger } from "winston";
import { ToppingFilters } from "../product/product-types";
import { MessageProducerBroker } from "../common/types/broker";
import { KafkaTopics, Roles } from "../common/constants";
import { AuthRequest } from "../common/types";

export class ToppingController {
    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService,
        private broker: MessageProducerBroker,
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
            // Send tooping to kafka
            await this.broker.sendMessage(
                KafkaTopics.TOPPING,
                JSON.stringify({
                    event_type: ToppingEvents.TOPPING_CREATE,
                    data: {
                        id: topping._id,
                        price: topping.price,
                        tenantId: topping.tenantId,
                    },
                }),
            );

            res.json({ id: topping._id });
        } catch (err) {
            return next(err);
        }
    };

    update = async (
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

        const { toppingId } = req.params as { toppingId: string };
        const toppingDetails =
            await this.toppingService.getToppingById(toppingId);
        if (!toppingDetails) {
            return next(createHttpError(404, "Topping not found"));
        }
        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenantId = (req as AuthRequest).auth.tenant;
            if (toppingDetails.tenantId !== tenantId) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this topping",
                    ),
                );
            }
        }

        let imageName: string | undefined;
        const oldImage = toppingDetails.image;
        if (req.files?.image) {
            const image = req.files.image as UploadedFile;
            imageName = uuid4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });

            await this.storage.delete(oldImage);
        }

        const updatedTopping = await this.toppingService.updateTopping(
            toppingId,
            {
                ...req.body,
                image: imageName ?? oldImage,
                tenantId: req.body.tenantId,
            },
        );

        this.logger.info("Topping updated", { toppingId });
        // Send topping to kafka
        await this.broker.sendMessage(
            KafkaTopics.TOPPING,
            JSON.stringify({
                event_type: ToppingEvents.TOPPING_UPDATE,
                data: {
                    id: updatedTopping._id,
                    price: updatedTopping.price,
                    tenantId: updatedTopping.tenantId,
                },
            }),
        );

        res.json({ id: toppingId });
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        const { page, limit, tenantId } = req.query;
        try {
            const filters: ToppingFilters = {};
            if (tenantId) filters.tenantId = tenantId as string;
            const toppings = await this.toppingService.getAll(
                {
                    page: page ? parseInt(page as string) : 1,
                    limit: limit ? parseInt(limit as string) : 10,
                },
                filters,
            );
            const finalToppings = (toppings.data as Topping[]).map(
                (topping) => ({
                    ...topping,
                    image: this.storage.getObjectUri(topping.image),
                }),
            );
            res.json({ ...toppings, data: finalToppings });
        } catch (err) {
            return next(err);
        }
    };

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;
        const topping = await this.toppingService.getToppingById(toppingId);

        if (!topping) {
            return next(createHttpError(404, "Topping not found"));
        }

        this.logger.info("Topping fetched", { toppingId });
        res.json(topping);
    };

    deleteOne = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;
        const topping = await this.toppingService.getToppingById(toppingId);
        if (!topping) {
            return next(createHttpError(404, "Topping not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenantId = (req as AuthRequest).auth.tenant;
            if (topping.tenantId !== tenantId) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed delete this topping",
                    ),
                );
            }
        }

        await this.toppingService.deleteOne(toppingId);
        const toppingImage = topping.image;
        // after topping deletion delete the image resource from s3
        this.logger.info("Topping deleted", { toppingId });
        await this.storage.delete(toppingImage);

        res.json({ toppingId, msg: "success" });
    };
}
