import mongoose, { Schema, model } from "mongoose";

const inventorySchema = new Schema(
  {
    company_Id: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    msl:{type:Number,required:true,default:0},
    batch:[{
      batchNumber:{type: String,required:true },
      packSize:{type: Number ,required:true},
      quantityInPack:{type:Number,required:true},
      numberOfunits:{type:Number,required:true},  
       weight: {
        batchQuantity: {
          type:Number,
          required: true,
        },
        productQuantity: {
          type:Number,
          required: true,
        },
        unit: {
          type: Schema.Types.ObjectId,
          ref: "uom",
        },
      },
      updatedBy:{type:Schema.Types.ObjectId,required:true},
      updatedAt:{type:Date,required:true},
    }],
    totalWeight:{
      totalBatchQuantity: {
            type:Number,
            required: true,
          },
      totalActualQuantity: {
        type:Number,
        required: true,
      },
      totalPacks:{
        type: Number,
        required: true,
      },
      unit: {
        type: Schema.Types.ObjectId,
        ref: "uom",
      },
    },
    reservedUnit:{
      batchNumber:{type:String},
      value:{type:Number,default:0},
    },
  sold: { type: Number, required: true, default: 0 },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
},
  { timestamps: true }
);

const Inventory = model("inventory", inventorySchema);

export default Inventory;