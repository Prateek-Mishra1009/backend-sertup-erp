import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime } from "../helpers/helper";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: { type: String, required: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

brandSchema.method("getBrandDetail", async function getBrandDetail() {
  return {
    _id: this._id,
    name: this.name,
    createdAt: await unixTime(this.createdAt),
  };
});

const Brand = model("brand", brandSchema);

export default Brand;
