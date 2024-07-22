import { PaginateQuery } from "../common/types";
import { paginationLabels } from "../config/pagination";
import { ToppingFilters } from "../product/product-types";
import ToppingModel from "./topping-model";
import { Topping } from "./topping-types";

export class ToppingService {
    async create(topping: Topping) {
        return await ToppingModel.create(topping);
    }

    async getAll(paginateQuery: PaginateQuery, filters: ToppingFilters) {
        const matchQuery = {
            ...filters,
        };

        const aggregate = ToppingModel.aggregate([{ $match: matchQuery }]);

        return ToppingModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }
}
