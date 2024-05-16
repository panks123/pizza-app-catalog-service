import ProductModel from "./product-model";
import { Product } from "./product-types";

export class ProductService {
    async create(product: Product) {
        return await ProductModel.create(product);
    }

    async getProductById(productId: string) {
        return await ProductModel.findOne({ _id: productId });
    }

    async updateProduct(productId: string, productData: Product) {
        return await ProductModel.findOneAndUpdate(
            { _id: productId },
            {
                $set: productData,
            },
            { new: true },
        );
    }
}
