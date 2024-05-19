import { PaginateQuery } from "../common/types";
import { paginationLabels } from "../config/pagination";
import ToppingModel from "./topping-model";
import { Topping } from "./topping-types";

export class ToppingService {
    async create(topping: Topping) {
        return await ToppingModel.create(topping);
    }

    async getAll(paginateQuery: PaginateQuery) {
        const aggregate = ToppingModel.aggregate();

        return ToppingModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }
}
