import { PaginateQuery } from "../common/types";
import { paginationLabels } from "../config/pagination";
import productModel from "./product-model";
import ProductModel from "./product-model";
import { Product, ProductFilters } from "./product-types";

export class ProductService {
    async create(product: Product) {
        return (await ProductModel.create(product)) as Product;
    }

    async getProductById(productId: string) {
        // return (await ProductModel.findOne({ _id: productId })) as Product;
        return ProductModel.findById(productId)
            .populate("categoryId", "-__v") // Populate category details, exclude __v
            .lean({ virtuals: true }); // Return product or null if not found
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

        // return productModel.aggregatePaginate(aggregate, {
        //     ...paginateQuery,
        //     customLabels: paginationLabels,
        // });
        const products = await productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });

        // Populate the category details for each product
        const populateOP = (await productModel.populate(products.data, {
            path: "categoryId",
            select: "-__v", // Exclude the __v field from category
        })) as unknown as Product[];

        const finalProducts = populateOP.map((product: Product) => {
            return {
                ...product,
                category: product.categoryId,
            };
        });

        return { ...products, data: finalProducts };
    }

    async deleteOne(productId: string) {
        return await ProductModel.deleteOne({ _id: productId });
    }
}
