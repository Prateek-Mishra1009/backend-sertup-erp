import { Schema, model } from "mongoose";

const messagesSchema = new Schema(
  {
    productId:{type:Schema.Types.ObjectId,ref:"Product"},
    refillQuantity:{type:Number,required:true,default:0},
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
},
{ timestamps: true }

);

const Messages = model("Messages", messagesSchema);

export default Messages;
