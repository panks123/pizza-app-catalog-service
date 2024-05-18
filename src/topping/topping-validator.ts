import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Topping name is required")
        .isString()
        .withMessage("Topping name should be string"),

    body("price").exists().withMessage("Topping price is required"),

    body("image").custom((value, { req }) => {
        if (!req.files) throw new Error("Topping image is required");
        return true;
    }),
    body("tenantId").exists().withMessage("Tenant Id is required"),
];
