import mongoose, { Schema, model } from "mongoose";
import constants from "../utils/constants";
 
const paymentSchema = new Schema(
    {
        orderNumber: { type: String, required: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company" },
        amount: { type: Number, required: true ,default:0}, // in particular transaction
        totalAmount: {type: Number, required: true,default:0},
        dueAmount: { type: Number, required: true, default: 0 },
        paymentType:{type:String,enum:[constants.paymentType.credit,constants.paymentType.debit],default:constants.paymentType.credit},
        paymentMode:{
            type: String,required:true,
            enum: [
                constants.paymentMode.prepaid,
                constants.paymentMode.postPaid
            ],
            default:constants.paymentMode.prepaid
        },
        paymentMethod:{
            cash:{
                amount:{type:Number}
            },
            cheque:{
                chequeDetails:{
                    chequeNumber: { type: Number,length:6},
                    payeeName:{ type: String},
                    chequeDate:{ type: Date},
                    chequeAmount:{type: Number},
                    accountNumber:{ type: String}
                }
            },
            upi:{
                vpa:{type: String},
            },
            bankTransffer:{
                internetBanking:{
                    accountNumber:{type: Number},
                    ifscCode:{type: String},
                    bankName:{type: String},
                    amount:{type: Number},
                    benificiaryName:{type: String}
                  }
            }
        },
        status: { type: String, enum: [constants.paymentStatus.paid, constants.paymentStatus.partiallyPaid, constants.paymentStatus.pending] },
        isDeleted: { type: Boolean, required: true, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
// Create the User model from the schema
const Payment = model("payment", paymentSchema);
export default Payment;