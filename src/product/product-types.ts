import mongoose from "mongoose";

export type PriceConfiguration = {
    [key: string]: {
        priceType: "base" | "aditional";
        availableOptions: string[];
    };
};
export type Attribute = {
    name: string;
    value?: unknown;
};
export interface Product {
    _id?: mongoose.Types.ObjectId;
    name: string;
    description: string;
    image: string;
    priceConfiguration: PriceConfiguration;
    attributes: Attribute[];
    tenantId: string;
    categoryId: string;
    isPublish: boolean;
}

export interface ProductFilters {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
}

export interface ToppingFilters {
    tenantId?: string;
}
