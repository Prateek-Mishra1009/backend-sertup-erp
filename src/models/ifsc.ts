import { Schema, model } from "mongoose";

const ifscSchema = new Schema(
  {
    ifsc: {
      type: String,
      required: true,
      unique: true,
    },
    bank: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const IFSC = model("ifsc", ifscSchema);

export default IFSC;
