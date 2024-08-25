
import { Schema, model } from "mongoose";
import constants from "../utils/constants";

const itemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: "uom",
    },
    noOfPacks: { type: Number },
    // batchNo: { type: String },
    sellingPrice: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    taxableAmount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, default: 0 },
    deliveryDate: { type: Date,required:true },
    gst: {
      type: Number,
      required: true,
      enum: [
        constants.gstPercentage.none,
        constants.gstPercentage.fivePercent,
        constants.gstPercentage.twelvePercent,
        constants.gstPercentage.eighteenPercent,
        constants.gstPercentage.twentyEightPercent,
      ],
     default: constants.gstPercentage.eighteenPercent,
    },
  },
  {
    timestamps: true,
  }
);

const quotationSchema = new Schema({
  documentNumber: { type: String, required: true },
  type: { type: String, required: true, enum: [constants.quotationType.purchase, constants.quotationType.sales],default:constants.quotationType.sales},
  billingAddressId: { type: Schema.Types.ObjectId, ref: "Address", required: true },
  shippingAddressId: { type: Schema.Types.ObjectId, ref: "Address", required: true },
  primaryDocumentDetails: {
    documentDate: { type: String },
    documentNumber: { type: String },
    deliveryDate: { type: Date },
    customerId: { type: String },
    additionalDetails: { type: String },
    contactPerson: { type: String },
    orderNumber: { type: String },
    orderDate: { type: Date },
    invoice: [
      {
        invoiceNumber: { type: String },
        invoiceDate: { type: Date },
      },
    ],
    paymentTerm: {
      type: String,
      enum: [
        constants.paymentTerm.Net30,
        constants.paymentTerm.Net60,
        constants.paymentTerm.Net90,
      ],
    },
  },
  orderNumber:{type:String},
  fileUrl:{type:String},
  url:{type:String},
  terms:{type:String},
  signature:{type:String},
  comment:{type:String},
  items:[itemSchema],
  paymentTerm: { type: String, enum: [constants.paymentTerm.Net30, constants.paymentTerm.Net60, constants.paymentTerm.Net90] },
  status: { type: String, enum: [constants.salesQuotationStatus.pending, constants.salesQuotationStatus.draft,constants.salesQuotationStatus.sent ], default: constants.salesQuotationStatus.pending },
  isDeleted: { type: Boolean, required: true, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Quotation = model("Quotation", quotationSchema);

export default Quotation;
