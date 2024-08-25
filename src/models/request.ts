import { Schema, model } from "mongoose";
import constants from "../utils/constants";

const requestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId:{type:String,ref:"Company",required:true},
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    status: {
      type: Number,
      required: true,
      default: constants.requestStatus.pending,
      enum: [
        constants.requestStatus.pending,
        constants.requestStatus.approved,
        constants.requestStatus.rejected,
      ],
    },
    reason: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Request = model("request", requestSchema);

export default Request;