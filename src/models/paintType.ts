import { Schema, model } from "mongoose";

const paintTypeSchema = new Schema(
  {
    paint_type: {
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

const paintType = model("painttype", paintTypeSchema);
     

export default paintType;
