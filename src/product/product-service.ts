import { paginationLabels } from "../config/pagination";
import productModel from "./product-model";
import ProductModel from "./product-model";
import { PaginateQuery, Product, ProductFilters } from "./product-types";

export class ProductService {
    async create(product: Product) {
        return (await ProductModel.create(product)) as Product;
    }

    async getProductById(productId: string) {
        return (await ProductModel.findOne({ _id: productId })) as Product;
    }

    async updateProduct(productId: string, productData: Product) {
        return (await ProductModel.findOneAndUpdate(
            { _id: productId },
            {
                $set: productData,
            },
            { new: true },
        )) as Product;
    }

    async getAll(
        q: string,
        filters: ProductFilters,
        paginateQuery: PaginateQuery,
    ) {
        const searchQueryRegxp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegxp,
        };

        const aggregate = ProductModel.aggregate([{ $match: matchQuery }]);

        return productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }
}
