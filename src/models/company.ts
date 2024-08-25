import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime } from "../helpers/helper";

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    reference_id: {
            type: String,
            // required: true,
          },
          slug: { type: String},
    companyType: {
            type: String,
            required: true,
            default: constants.companyCategory.company
          },
    companyEmail: {
      value: { type: String},
      is_verified: { type: Boolean, default: false },
    },
    companyPhone: {
      value: { type: String,required: true },
      is_verified: { type: Boolean, required: true, default: false },
    },

    foundingYear: { type: String },
    contactPerson: { 
      name: {type:String},
      phone:{type:String},
      email:{type:String}
  },
    salesPerson:{ type:Schema.Types.ObjectId },
    industry: { type: String },
    userId: { type: Schema.Types.ObjectId },
    tags: { type: Array },
    logo: { type: String },
    logoUrl: { type: String },
    buyerAndSupplier: { type: String, required: true,  enum: [
      constants.companyType.both,
      constants.companyType.buyer,
      constants.companyType.supplier
    ]
    },
    gst: {
      value: { type: String },
      is_verified: { type: Boolean, default: false },
    },
    pan:{
      value:{ type: String },
      is_verified: { type: Boolean, default: false },
    },
    creditLimit:{
      value: { type: Number},
      validity:{type:Number},
    },
    isCompanyErp: { type: Boolean, required: true, default: false },
    about: { type: String },
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);


companySchema.method("getCompanyDetail", async function getAuthDetail() {
  return {
    _id:this._id,
    companyEmail: this.companyEmail?.value,
    companyPhone: this.companyPhone?.value,
    name:this.name
  };
});

const Company = model("company", companySchema);

export default Company;

// import { Schema, model } from "mongoose";
// import constants from "../utils/constants";
// import { unixTime } from "../helpers/helper";
 
// const companySchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     companyType: {
//       type: String,
//       required: true,
//       // default: constants.compantType.company
//     },
//     gstType:{
//       type: String,
//     },
//     reference_id: {
//       type: String,
//       // required: true,
//     },
//     // slug: { type: String, required: true },
//     companyEmail: {
//       value: { type: String, required: true },
//       is_verified: { type: Boolean, default: false },
//     },
//     companyPhone: {
//       value: { type: String, required: true },
//       is_verified: { type: Boolean, required: true, default: false },
//     },
 
//     foundingYear: { type: String },
//     contactPersonOne: {
//       name: { type: String },
//       phone: { type: String },
//       email: { type: String }
//     },
//     contactPersonTwo: {
//       name: { type: String },
//       phone: { type: String },
//       email: { type: String }
//     },
//     salesPerson: { type: Schema.Types.ObjectId },
//     industry: { type: String },
//     userId: { type: Schema.Types.ObjectId },
//     tags: { type: Array },
//     logo: { type: String },
//     logoUrl: { type: String },
//     buyerAndSupplier: {
//       type: String, required: true, enum: [
//         constants.companyType.both,
//         constants.companyType.buyer,
//         constants.companyType.supplier
//       ]
//     },
//     gst: {
//       value: { type: String },
//       is_verified: { type: Boolean, default: false },
//     },
//     pan:{
//       value:{ type: String },
//       is_verified: { type: Boolean, default: false },
//     },
//     creditLimit:{
//       value: { type: Number},
//       validity:{type:Number},
//     },
//     isCompanyErp: { type: Boolean, required: true, default: false },
//     about: { type: String },
//     status: { type: Boolean, required: true, default: true },
//     isDeleted: { type: Boolean, required: true, default: false },
//     createdBy: { type: Schema.Types.ObjectId, ref: "User" },
//     updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
//     deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );
 
 
// companySchema.method("getCompanyDetail", async function getAuthDetail() {
//   return {
//     _id: this._id,
//     companyEmail: this.companyEmail?.value,
//     companyPhone: this.companyPhone?.value,
//     name: this.name
//   };
// });
 
// const Company = model("company", companySchema);
 
// export default Company;