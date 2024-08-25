import { Schema, model } from "mongoose";
import constants from "../utils/constants";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String
    },
    productCode:{
      type: String
    },
    Type:{type:String,enum:[constants.productType.Paint,constants.productType.Powder,constants.productType.Putty,constants.productType.Sheet],required:true},
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
       required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
       required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      enum:[null,Schema.Types.ObjectId],
      ref: "SubCategory",
      // required: true,
    },
    productStandard:{
      type: String,
      enum:[constants.productStandard.standard,constants.productStandard.nonStandard],required:true
    },
    // margin:{type:Number,required:true,default:0},
    subChildCategoryId: {
      type: Schema.Types.ObjectId,
      enum:[null,Schema.Types.ObjectId],
      ref: "SubChildCategory",
      // required: true,
    },
    sku: {
      type: String,
       required: true,
    },
    colorId: {
      type: Schema.Types.ObjectId,
      enum:[null,Schema.Types.ObjectId],
      ref: "Color",
      // required: true,
    },
    paintType: {
      type: Schema.Types.ObjectId,
      ref: "painttype",
    },
    finish: {
      type: Schema.Types.ObjectId,
      ref: "finishtype",
    },
   price:{
    sellingPrice: {
      type: Number,
      required: true,
    },
    costPrice: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
   },
    currency: {
      type: String,
      required: true,
      default: "₹",
    },
    GST: {
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
    HSN: {
      type: Schema.Types.ObjectId,
      ref: "HSN",
       required: true,
    },
    weight: {
      value: {
        type: Number,
        required: true,
      },
      quantityInPack: { type: Number, required: true, default: 0 },
      unit: {
        type: Schema.Types.ObjectId,
        ref: "uom",
      },
    },
    manufacturer:{type:String,required:true,default:constants.manufactureType.supplier},
    base_paint_one: {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "product",
      },
      weight: {
        value: {
          type: Number,
        },
        unit: {
          type: Schema.Types.ObjectId,
          ref: "uom",
        },
      },
    },
    base_paint_two: {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "product",
      },
      weight: {
        value: {
          type: Number,

        },
        unit: {
          type: Schema.Types.ObjectId,
          ref: "uom",
        },
      },
    },
    tinters: [
      {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "product",
      },
      weight: {
        value: {
          type: Number,

        },
        unit: {
          type: Schema.Types.ObjectId,
          ref: "uom",
        },
      },
    }
  ],
    soldBy: {type:Schema.Types.ObjectId, ref: "User",required:true},
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

productSchema.method("getProductDetail", async function getAuthDetail() {
  return {
    name: this.name,
    sku: this.sku,
    productCode: this.productCode,
    weight:this.weight
  };
});

const Product = model("product", productSchema);

export default Product;