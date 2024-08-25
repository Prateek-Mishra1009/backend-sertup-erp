import { Schema, model } from "mongoose";
import constants from "../utils/constants";

const hsnSchema = new Schema(
  {
    hsn: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    gst:{
      type: Number,
      required:true,
      enum: [
        constants.gstPercentage.none,
        constants.gstPercentage.fivePercent,
        constants.gstPercentage.twelvePercent,
        constants.gstPercentage.eighteenPercent,
        constants.gstPercentage.twentyEightPercent,
      ],
    },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const HSN = model("hsn", hsnSchema);
     

export default HSN;
