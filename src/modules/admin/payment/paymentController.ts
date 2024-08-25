import { NextFunction, Response } from "express";
import constants from "../../../utils/constants";
import Payment from "../../../models/payment";
import message from "./paymentConstant";
import { getDateAfterPaymentTermDays } from "../../../helpers/helper";

const createPayment = async (req: any, res: Response, next: NextFunction) => {
  try {
    await Payment.create({
      orderNumber: req?.body?.orderNumer,
      invoiceNumber: req?.body?.invoiceNumber,
      paymentMode: req?.body?.paymentMode,
      paymentDate: req?.body?.paymentDate,
      totalAmount: req?.body?.totalAmount,
      paymentAmount: req?.body?.paymentAmount,
      totalPaid: req?.body?.totalPaid,
      dueAmount: req?.body?.dueAmount,
      lastPaidAmount: req?.body?.lastPaidAmount,
      "advanceToPay.amount": req?.body?.amount,
      "advanceToPay.paid": req?.body?.paid,
      status: req?.body?.status,
      finalPaymentDate: await getDateAfterPaymentTermDays(req.body.paymentTerm),
    })
      .then((createdPayment) => {
        if (!createdPayment) {
          throw {
            status: constants.status.statusFalse,
            userStatus: req?.status,
            message: message.paymentCreateFailed,
          };
        }
      })
      .catch((error) => {
        res.status(constants.code.preconditionFailed).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: error,
        });
      });
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

export default { createPayment };
