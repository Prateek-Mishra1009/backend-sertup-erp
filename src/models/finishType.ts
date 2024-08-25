import { Schema, model } from "mongoose";

const finishTypeSchema = new Schema(
  {
    finish_type: {
      type: String,
      required: true
    },
    slug: { type: String, required: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const finishType = model("finishtype", finishTypeSchema);
     

export default finishType;
