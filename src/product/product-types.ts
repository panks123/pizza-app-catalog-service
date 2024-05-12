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
    name: string;
    description: string;
    image: string;
    priceConfiguration: PriceConfiguration;
    attributes: Attribute[];
    tenantId: string;
    categoryId: string;
    isPublish: boolean;
}
