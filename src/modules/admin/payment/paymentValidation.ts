import { getMessage } from "../../../helpers/helper";
import validator from "../../../helpers/validator";
import constants from "../../../utils/constants";
import { Response, NextFunction } from "express";

const createPayment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationRule = {
      orderNumber: "required|string",
      invoiceNumber: "required|string|size:24",
      paymentMode: `required|string|in:${constants.paymentMode.prepaid},${constants.paymentMode.postPaid}`,
      paymentDate: "required|string",
      totalAmount: "required|numeric",
      paymentAmount: "required|numeric",
      totalPaid: "required|numeric",
      dueAmount: "required|numeric",
      lastPaidAmount: "required|numeric",
      status: `required|string|in:${constants.paymentStatus.pending},${constants.paymentStatus.paid},${constants.paymentStatus.partiallyPaid}`,
      advanceToPay: {
        amount: "numeric",
        paid: "required|boolean",
      },
    };

    const msg = {};

    await validator(
      req.body,
      validationRule,
      msg,
      async (err: any, status: boolean) => {
        if (!status) {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: await getMessage(err),
          });
        } else {
          next();
        }
      }
    );
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};
export default { createPayment };
