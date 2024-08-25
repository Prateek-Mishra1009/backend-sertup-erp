import { Response, NextFunction } from "express";
import validator from "../../../../helpers/validator";
import constants from "../../../../utils/constants";
import { getMessage } from "../../../../helpers/helper";

const createOrUpdateOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {

  try {
    const validationRule = {
      soldBy: "required|string|size:24",
      orderBy: "required|string|size:24",
      orderNumber: "string",
      shippingAddress: "required|string|size:24",
      supplierAddress: "required|string|size:24",
      subtotal: "required|numeric",
      taxes: "required|numeric",
      grandTotal: "required|numeric",
      paymentTerm: `required|string|in:${constants.paymentTerm.Net30},${constants.paymentTerm.Net60},${constants.paymentTerm.Net60}`,
      status: `required|string|in:${constants.orderStatus.pending},${constants.orderStatus.draft},${constants.orderStatus.shipped},${constants.orderStatus.partiallyDelivered},${constants.orderStatus.partialllyShipped},${constants.orderStatus.delivered},${constants.orderStatus.completed}`,
      orderDate: "required|string",
      isDeleted: "required|boolean",
      comment: "string",
      primaryDocumentDetails: {
        documentNumber: "string",
        customerId: "required|string",
        documentDate: "string",
        additionalDetails: "string",
      },
      "items.*.productId": "required|string|size:24",
      "items.*.packSize": "required|numeric",
      "items.*.packQuantity": "required|numeric",
      "items.*.noOfPacks": "required|numeric",
      "items.*.batchNo": "required|string",
      "items.*.totalQuantity": "required|numeric",
      "items.*.sellingPrice": "required|numeric",
      "items.*.taxableAmount": "required|numeric",
      "items.*.totalAmount": "required|numeric",
      "items.*.gst": `required|numeric|in:${constants.gstPercentage.none},${constants.gstPercentage.fivePercent},${constants.gstPercentage.twelvePercent},${constants.gstPercentage.eighteenPercent},${constants.gstPercentage.twentyEightPercent},`,
      "items.*.deliveryDate": "required|string",
      "items.*.unit": "required|string|size:24",
      "items.*.hsn": "required|string|size:24",
      "items.*.status.status": `required|string|in:${constants.orderStatus.pending},${constants.orderStatus.draft},${constants.orderStatus.shipped},${constants.orderStatus.partiallyDelivered},${constants.orderStatus.partialllyShipped},${constants.orderStatus.delivered},${constants.orderStatus.completed}`,
      "items.*.status.reason": "required|string",
      "items.*.status.comment": "required|string",
      "extraCharge.*.description": "required|string",
      "extraCharge.*.total": "required|numeric",
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

const generatePurchaseOrderInvoice = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationRule = {
      orderId: "required|string",
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

const updateStatusOfPurchaseOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('req.body :>> ', req.body);
    const validationRule = {
      orderNumber: "required|string",
      status: `required|string|in:${constants.orderStatus.pending},${constants.orderStatus.draft},${constants.orderStatus.delivered}${constants.orderStatus.partiallyDelivered}`
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
export default {
  createOrUpdateOrder,
  generatePurchaseOrderInvoice,
  updateStatusOfPurchaseOrder,
};
