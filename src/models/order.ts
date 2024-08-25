import { Schema, model } from "mongoose";
import constants from "../utils/constants";

const itemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    orderNumber: { type: String, required: true },
    soldBy: { type: Schema.Types.ObjectId, ref: "company" },
    orderBy: { type: Schema.Types.ObjectId, ref: "company" },
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
    gst: { type: Number, required: true, enum: [constants.gstPercentage.none, constants.gstPercentage.fivePercent, constants.gstPercentage.twelvePercent, constants.gstPercentage.eighteenPercent, constants.gstPercentage.twentyEightPercent] },
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

export const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    orderDate: { type: Date, required: true, default: new Date() },
    comment: { type: String },
    subtotal: { type: Number  },
    taxes: { type: Number },
    grandTotal: { type: Number },
    advanceTopay: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "₹" },
    items: [itemSchema],
    shippingAddress: { type: Schema.Types.ObjectId, required: true, ref: "Address" },
    supplierAddress: { type: Schema.Types.ObjectId, required: true, ref: "Address" },
    orderType: { type: String, enum: [constants.orderType.purchase, constants.orderType.sales, constants.orderType.purchaseReturn, constants.orderType.salesReturn] },
    primaryDocumentDetails: {
      documentDate: { type: Date, default: Date() },
      documentNumber: { type: String },
      deliveryDate: { type: Date },
      customerId: { type: String },
      additionalDetails: { type: String },
      contactPerson: { type: String },
      orderNumber: { type: String },
      orderDate: { type: Date },
      invoice: [{ invoiceNumber: { type: String }, invoiceDate: { type: Date } }],
      paymentTerm: { type: String, enum: [constants.paymentTerm.Net30, constants.paymentTerm.Net60, constants.paymentTerm.Net90] }
    },
    extraCharge: [{ description: { type: String }, total: { type: Number, required: true, default: 0 } }],
    status: {
      type: String,
      required: true,
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

    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Order = model("order", orderSchema);

export default Order;
