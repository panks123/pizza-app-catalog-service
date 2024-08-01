import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Category name is required")
        .isString()
        .withMessage("Category name should be a string"),

    body("priceConfiguration")
        .exists()
        .withMessage("Price Configuration is required"),
    body("priceConfiguration.*.priceType")
        .exists()
        .withMessage("Price Type is required")
        .custom((value: "base" | "aditional") => {
            const validKeys = ["base", "aditional"];
            if (!validKeys.includes(value)) {
                throw new Error(
                    `${value} is invalid attribute for priceType field. Posiible values are: [${validKeys.join(
                        ",",
                    )}]`,
                );
            }
            return true;
        }),

    body("attributes").exists().withMessage("attributes field is required"),

    body("hasToppings")
        .optional()
        .isBoolean()
        .withMessage("hasToppings field should be a boolean")
        .default(false),
];
