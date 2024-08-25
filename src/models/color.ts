import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime } from "../helpers/helper";

const colorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code:{
      type:String,
    },
    // ral_code: { type: String },
    // hex_code: { type: String },
    // type:{type:String,enum:[constants.colorType.classic,
    // constants.colorType.design,constants.colorType.effect,
    // constants.colorType.other]},
    // other_code:{type:String},
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Color = model("color", colorSchema);

export default Color;
