import { Response, NextFunction } from "express";
import constants from "../../../../utils/constants";
import Quotation from "../../../../models/quotation";
import Order from "../../../../models/order";
import message from "./salesConstant";
import mongoose from "mongoose";
import {
  createRequest,
  generateDocumentNumber,
  generateInvoiceNumber,
  generateOrderDocumentNumber,
  generateOrderId,
  getDateAfterPaymentTermDays,
} from "../../../../helpers/helper";

import Payment from "../../../../models/payment";
import Address from "../../../../models/address";
import { createStockAlert } from "../../../common/commonController";
import Product from "../../../../models/product";
import createInvoice from "../../../../helpers/generateInvoice";
import path from "path";
import { readFileSync } from "fs";
import sendMail from "../../../../helpers/mail";
import Company from "../../../../models/company";
import {
  checkStock,
  getSalesOrderDetails,
  productDetailsOfOrder,
  sendForApproval,
} from "./salesHelper";
import User from "../../../../models/user";
import Request from "../../../../models/request";
import { error } from "console";
import Invoice from "../../../../models/invoice";

const createSalesOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetching shipping company ID based on shipping address
    const shippingCompanyId: any = await Address.findOne(
      {
        _id: new mongoose.Types.ObjectId(req.body.shippingAddress),
        isDeleted: false,
      },
      { companyId: 1 }
    ).lean();

    if (!shippingCompanyId) {
      throw {
        statusCode: constants.code.preconditionFailed,
        message: message.shippingAddressMissing,
      };
    }

    // Fetching primary details of the shipping company
    const shippingPrimaryDetails = await Company.findOne(
      {
        _id: shippingCompanyId.companyId,
        isDeleted: false,
      },
      { creditLimit: 1, reference_id: 1, contactPerson: 1 }
    ).lean();

    if (!shippingPrimaryDetails) {
      throw {
        statusCode: constants.code.preconditionFailed,
        message: message.shippingAddressMissing,
      };
    }

    // Generate a new order ID
    const orderId = await generateOrderId();
    //create payment Schema
   await Payment.create({
      orderNumber: orderId,
      companyId: shippingCompanyId.companyId,
      amount: req.body.advanceTopay ? Number(req.body.advanceTopay) : 0,
      dueAmount:
        Number(req.body.grandTotal) -
        Number(req.body.advanceTopay ? req.body.advanceTopay : 0),
      paymentType: constants.paymentType.credit,
      paymentDate: new Date(),
      paymentMode: req.body.advanceTopay
        ? constants.paymentMode.prepaid
        : constants.paymentMode.postPaid,
      paymentMethod:req.body.paymentMethod,
    }).then(async (paymentDetail) => {
      if(!paymentDetail){
        throw{
          statusCode:constants.code.dataNotFound,
          message:message.paymentFailed
        }
      }
        // Create the sales order
        const orderData: any = await Order.create({
          orderNumber: orderId,
          orderType: constants.orderType.sales,
          primaryDocumentDetails: {
            documentDate: req.body.primaryDocumentDetails.documentDate,
            documentNumber: generateDocumentNumber(),
            deliveryDate: req.body.primaryDocumentDetails.deliveryDate,
            paymentTerm: req.body.primaryDocumentDetails.paymentTerm,
            customerId: shippingPrimaryDetails.reference_id,
            contactPerson: req.body.contactPerson
              ? req.body.contactPerson
              : shippingPrimaryDetails?.contactPerson?.name,
            transportTerm: req.body.transportTerm,
          },
          extraCharge: req.body.extraCharge,
          status: constants.orderStatus.pending,
          orderDate: new Date(),
          shippingAddress: new mongoose.Types.ObjectId(
            req.body.shippingAddress
          ),
          supplierAddress: new mongoose.Types.ObjectId(
            req.body.supplierAddress
          ),
          items: req.body.items.map((item: any) => ({
            ...item,
            orderId: orderId,
            createdBy: req.id,
          })),
          subtotal: req.body.items.reduce(
            (acc: any, item: any) => acc + item.taxableAmount,
            0
          ),
          taxes: req.body.items.reduce(
            (acc: any, item: any) => acc + item.taxAmount,
            0
          ),
          grandTotal: req.body.items.reduce(
            (acc: any, item: any) => acc + item.taxAmount + item.taxableAmount,
            0
          ),
          advanceTopay: req.body.advanceTopay ? req.body.advanceTopay : 0,
          isDeleted: false,
        });

        if (!orderData) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: message.orderFailed,
          };
        }

        // Check if the order needs approval
        const requiredApproval = await sendForApproval(req.body.items);
        if (requiredApproval) {
          const superAdminDetail = await User.findOne({
            role: constants.accountLevel.superAdmin,
            isDeleted: false,
          });

          if (!superAdminDetail) {
            throw new Error("Super Admin not found or is inactive");
          }

          const sentForApproval = await Request.create({
            userId: superAdminDetail._id,
            orderId: orderData._id,
            companyId: shippingCompanyId._id,
            status: constants.requestStatus.pending,
          });
        }

        await checkStock(req.body.items);

        await Invoice.create({
          invoiceType: constants.invoiceTypes.salesOrder,
          InvoiceId: await generateInvoiceNumber(),
          orderNumber: orderData.orderNumber,
          invoiceDate: Date.now(),
          companyId: shippingPrimaryDetails._id,
          supplierAddress: orderData.supplierAddress,
          shippingAddress: orderData.shippingAddress,
          items: orderData.items,
          terms:req.body?.terms?req.body?.terms:'',
          signature:req.file.path,
          totalItem: orderData.items.length,
          subTotal: orderData.items.reduce(
            (acc: number, item: any) => acc + item.taxableAmount,
            0
          ),
          total: orderData.items.reduce(
            (acc: number, item: any) =>
              acc + item.taxableAmount + item.taxAmount,
            0
          ),
          taxableAmount: orderData.items.reduce(
            (acc: number, item: any) => acc + item.taxableAmount,
            0
          ),
          taxAmount: orderData.items.reduce(
            (acc: number, item: any) => acc + item.taxAmount,
            0
          ),
          currency: "₹",
          createdBy: req.id,
        })
          .then(async (invoiceData: any) => {
            if (!invoiceData) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: message.invoiceFailed,
              };
            } else {
              const orderDetailPipeline = await productDetailsOfOrder(
                orderData?.orderNumber
              );
              const salesOrderPdfUrl = await createInvoice(
                req.hostname,
                "public/templates/sales_order.html",
                orderDetailPipeline
              );

            if (!salesOrderPdfUrl) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: message.pdfFailed,
              };
            } else {
              await Invoice.findOneAndUpdate(
                {
                  _id: invoiceData._id,
                  isDeleted: false,
                },
                {
                  file: salesOrderPdfUrl,
                }
              )
              // Send the generated PDF via email
              const fileName = salesOrderPdfUrl.split("files/")[1];
              const pdfPath = path.join(process.cwd(), "public", "files", fileName);
              const pdfData = readFileSync(pdfPath);
              const payload = {
                to: `kinjalleua8@gmail.com`,
                title: constants.emailTitle.salesOrder,
                data: "",
                attachments: [
                  {
                    filename: "sales_order_invoice.pdf",
                    content: pdfData,
                    contentType: "application/pdf",
                  },
                ],
              };

                await sendMail(payload);

                // Respond with success
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  message: message.orderSuccess,
                  userStatus: req.status,
                });
              }
            }
          })
          .catch((err) => {
            res.status(err.statusCode || constants.code.dataNotFound).json({
              statusCode: constants.code.dataNotFound,
              userStatus: req.status,
              message: message.invoiceFailed,
            });
          });
      })
      .catch((err) => {
        res.status(err.statusCode || constants.code.dataNotFound).json({
          statusCode: constants.code.dataNotFound,
          userStatus: req.status,
          message: err.message ? err.message : err,
        });
      });
  } catch (error: any) {
    // Handle errors by sending an error response
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error.message || error,
    });
  }
};

const getSalesOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const purchaseOrderDetails = await getSalesOrderDetails(
      req.body.orderNumber,
      req
    );
    if (!purchaseOrderDetails) {
      throw {
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: `${req.body.orderNumber} ${message.purchaseOrderNumberNotFound}`,
      };
    }
    res.status(constants.code.success).json({
      status: constants.status.statusTrue,
      userStatus: req.status,
      message: message.purchaseOrderGet,
      data: purchaseOrderDetails,
    });
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

const salesReturn = async (req: any, res: Response, next: NextFunction) => {
  try {
  } catch (error) {
    res.status(constants.code.badRequest).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

export default { createSalesOrder, salesReturn, getSalesOrder };
