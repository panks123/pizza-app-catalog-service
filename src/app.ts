import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import productRouter from "./product/product-router";
import cookieParser from "cookie-parser";
import toppingRouter from "./topping/topping-router";
import cors from "cors";
import config from "config";

const app = express();

const ALLOWED_DOMAINS = [
    String(config.get("frontend.clientUI")),
    String(config.get("frontend.adminUI")),
];

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(
    cors({
        origin: ALLOWED_DOMAINS,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello from catalog service" });
});

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);

app.use(globalErrorHandler);

export default app;
