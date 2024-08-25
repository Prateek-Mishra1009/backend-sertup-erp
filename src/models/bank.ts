import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime } from "../helpers/helper";

const bankSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    bank_name: {
      type: String,
      required: true,
    },
    branch_name: {
      type: String,
      required: true,
    },
    ifsc: {
      type: String,
      required: true,
    },
    account_name: {
      type: String,
      required: true,
    },
    account_no: {
      value: { type: String, required: true },
      is_verified: { type: Boolean, required: true, default: false },
    },
    account_type: {
      type: String,
      required: true,
      enum: [
        constants.bankAccountTypes.saving,
        constants.bankAccountTypes.current,
      ],
    },
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

bankSchema.method("getBankDetail", async function getBankDetail() {
  return {
    _id: this._id,
    companyId:this.companyId,
    bank_name: this.bank_name,
    branch_name: this.branch_name,
    ifsc: this.ifsc,
    account_name:this.account_name,
    account_no: this.account_no,
    account_type: this.account_type,
    createdAt: await unixTime(this.createdAt),
  };
});

const Bank = model("bank", bankSchema);

export default Bank;
