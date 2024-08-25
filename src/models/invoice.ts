import { Schema, model } from "mongoose";
import constants from "../utils/constants";

const itemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    orderNumber: { type: String, required: true },
    unit: { type: Schema.Types.ObjectId, ref: "uom" },
    hsn: { type: Schema.Types.ObjectId, ref: "hsn" },
    noOfPacks: { type: Number },
    batchNo: { type: String },
    sellingPrice: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    taxableAmount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    deliveryDate: { type: Date },
    date: { type: Date, default: new Date() },
    reason: { type: String },
    comment: { type: String },
    returnQuantity: { type: Number, default: 0 },
    deliveredPacks: { type: Number, default: 0 },
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
    },
    status: {
      orderStatus: {
        type: String,
        enum: [
          constants.orderStatus.pending,
          constants.orderStatus.draft,
          constants.orderStatus.partialllyShipped,
          constants.orderStatus.shipped,
          constants.orderStatus.partiallyDelivered,
          constants.orderStatus.delivered,
          constants.orderStatus.completed,
        ],
        default: constants.orderStatus.pending,
      },
    },
  },
  {
    timestamps: true,
  }
);

const invoiceSchema = new Schema(
  {
    invoiceType: {
      type: String,
      require: true,
      enum: [
        constants.invoiceTypes.purchaseOrder,
        constants.invoiceTypes.salesOrder,
        constants.invoiceTypes.salesQuotation,
        constants.invoiceTypes.salesProformaInvoice,
        constants.invoiceTypes.eInvoice,
        constants.invoiceTypes.eWayInvoice,
        constants.invoiceTypes.deliveryChallan,
        constants.invoiceTypes.creditNote,
      ],
    },
    InvoiceId: { type: String },
    orderNumber: { type: String, ref: "Order",required:true },
    invoiceDate: { type: Date, required: true, default: new Date() },
    soldBy: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: "Company",
    },
    orderBy: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: "Company",
    },
    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    supplierAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    signature:{type:String},
    items: [itemSchema],
    totalItem: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    subTotal: { type: Number, required: true, default: 0 },
    // discount: { type: Number, required: true, default: 0 },
    taxableAmount: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "₹" },
    file: { type: String },
    fileUrl: { type: String },
    terms:{type:String},
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)
const Invoice = model("invoice", invoiceSchema);

export default Invoice;
