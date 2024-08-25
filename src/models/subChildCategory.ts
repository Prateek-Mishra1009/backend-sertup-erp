import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime } from "../helpers/helper";

const subChildCategorySchema = new Schema(
  {
    subCategoryId: { type: Schema.Types.ObjectId, ref: "SubCategory" },
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

subChildCategorySchema.method(
  "getSubChildCategoryDetail",
  async function getSubChildCategoryDetail() {
    return {
      _id: this._id,
      subCategoryId: this.subCategoryId,
      name: this.name,
      createdAt: await unixTime(this.createdAt),
    };
  }
);

const SubChildCategory = model("subchildcategory", subChildCategorySchema);

export default SubChildCategory;
