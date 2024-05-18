import { FileData, FileStorage } from "../types/storage";
import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import config from "config";
import createHttpError from "http-errors";

export class S3Storage implements FileStorage {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: config.get("s3.region"),
            credentials: {
                accessKeyId: config.get("s3.accessKeyId"),
                secretAccessKey: config.get("s3.secretAccessKey"),
            },
        });
    }

    async upload(data: FileData): Promise<void> {
        const objectParams = {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            Bucket: config.get("s3.bucket"),
            Key: data.filename,
            Body: data.fileData,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new PutObjectCommand(objectParams));
    }

    async delete(filename: string): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: filename,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new DeleteObjectCommand(objectParams));
    }

    getObjectUri(filename: string): string {
        // https://pizza-app-project.s3.ap-southeast-2.amazonaws.com/90720f2c-c936-42d9-b549-8f9650e1480c
        const bucket = config.get("s3.bucket");
        const region = config.get("s3.region");
        if (typeof bucket === "string" && typeof region === "string")
            return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;

        const error = createHttpError(500, "Invalid s3 configuration");
        throw error;
    }
}
