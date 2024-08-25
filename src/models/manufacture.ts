import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime } from "../helpers/helper";

const manufactureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: { type: String, required: true },
    address: {
      type: String,
      required: true,
    },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

manufactureSchema.method(
  "getManufactureDetail",
  async function getManufactureDetail() {
    return {
      _id: this._id,
      name: this.name,
      address: this.address,
      createdAt: await unixTime(this.createdAt),
    };
  }
);

const Manufacture = model("manufacture", manufactureSchema);

export default Manufacture;
