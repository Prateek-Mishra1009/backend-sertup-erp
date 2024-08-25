import { Schema, model } from "mongoose";
import constants from "../utils/constants";

const uomSchema = new Schema(
  {
    uom_type: {
      type: String,
      required: true,
      enum:[constants.massUnit.l,constants.massUnit.pack,constants.massUnit.Number,constants.massUnit.kg],
      unique: true,
    },
    slug: { type: String, required: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const UOM = model("uom", uomSchema);
     

export default UOM;
