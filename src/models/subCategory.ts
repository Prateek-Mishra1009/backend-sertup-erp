import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime } from "../helpers/helper";

const subCategorySchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
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

subCategorySchema.method(
  "getSubCategoryDetail",
  async function getSubCategoryDetail() {
    return {
      _id: this._id,
      categoryId: this.categoryId,
      name: this.name,
      createdAt: await unixTime(this.createdAt),
    };
  }
);

const SubCategory = model("subcategory", subCategorySchema);

export default SubCategory;
