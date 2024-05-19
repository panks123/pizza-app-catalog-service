import mongoose, { AggregatePaginateModel } from "mongoose";
import { Topping } from "./topping-types";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const toppingSchema = new mongoose.Schema<Topping>({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    tenantId: {
        type: String,
        required: true,
    },
});

toppingSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model<Topping, AggregatePaginateModel<Topping>>(
    "Topping",
    toppingSchema,
);
