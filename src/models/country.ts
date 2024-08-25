import { Schema, model } from "mongoose";

const countrySchema = new Schema(
  {
    dial_code: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      required: true,
    },
    flag_icon: {
      type: String,
      required: true,
    },
    iso_code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    currency_code: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    continent: {
      type: String,
      required: true,
    },
    timeZone: {
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

const Country = model("country", countrySchema);

export default Country;
