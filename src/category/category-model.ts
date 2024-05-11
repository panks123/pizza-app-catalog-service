import mongoose from "mongoose";

interface PriceConfigureation {
    [key: string]: {
        priceType: "base" | "additional";
        availableOptions: string[];
    };
}

interface Attribute {
    name: string;
    widgetType: "switch" | "radio";
    defaultValue: string;
    availableOptions: string[];
}

export interface Category {
    name: string;
    priceConfigureation: PriceConfigureation;
    attributes: Attribute[];
}

const priceConfigureationSchema = new mongoose.Schema<PriceConfigureation>({
    priceType: {
        type: String,
        enum: ["base", "additional"],
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
});

const attributeSchema = new mongoose.Schema<Attribute>({
    name: {
        type: String,
        required: true,
    },
    widgetType: {
        type: String,
        enum: ["switch", "radio"],
        required: true,
    },
    defaultValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    availableOptions: {
        type: [String],
        required: true,
    },
});

const categorySchema = new mongoose.Schema<Category>({
    name: {
        type: String,
        required: true,
    },
    priceConfigureation: {
        type: priceConfigureationSchema,
        required: true,
    },
    attributes: {
        type: [attributeSchema],
        required: true,
    },
});

export default mongoose.model("Category", categorySchema);
