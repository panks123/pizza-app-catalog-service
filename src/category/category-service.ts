import CategoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new CategoryModel(category);
        return newCategory.save();
    }

    async getAll() {
        return await CategoryModel.find();
    }

    async getOne(categoryId: string) {
        return await CategoryModel.findOne({ _id: categoryId });
    }

    async deleteOne(categoryId: string) {
        return await CategoryModel.deleteOne({ _id: categoryId });
    }

    async update(categoryId: string, categoryData: Category) {
        return (await CategoryModel.findOneAndUpdate(
            { _id: categoryId },
            { $set: categoryData },
            { new: true },
        )) as Category;
    }
}
