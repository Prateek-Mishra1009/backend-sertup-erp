import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import path from "path";
import { readFileSync } from "fs";
import constants from "../../../../utils/constants";
import Order from "../../../../models/order";
import {
  generateInvoiceNumber,
  generateOrderDocumentNumber,
  generateOrderId,
  getDateAfterPaymentTermDays,
  manageInventoryPurchaseOrder,
} from "../../../../helpers/helper";
import message from "./purchaseOrderConstant";
import Invoice from "../../../../models/invoice";
import createInvoice from "../../../../helpers/generateInvoice";
import sendMail from "../../../../helpers/mail";
import Payment from "../../../../models/payment";
import Product from "../../../../models/product";
import { getPurchaseOrderDetails, productDetailsOfOrder, updateOverAllStatusOfPurchaseOrder, updateOverAllStatusOfPurchaseReturn } from "./purchaseHelper"


const createPurchaseOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const orderNumber = await generateOrderId();
    await Payment.create({
      orderNumber: orderNumber,
      companyId: new mongoose.Types.ObjectId(req.body.soldBy),
      amount: req?.body?.amount,
      totalAmount: req?.body?.grandTotal,
      dueAmount: (req?.body?.grandTotal - req?.body?.amount) || req?.body?.grandTotal,
      paymentType: req?.body?.paymentType,
      paymentMode: req?.body?.paymentMode,
      paymentMethod: req?.body?.paymentMethod,
      totalPaid: req?.body?.paymentAmount || req?.body?.advanceToPay || 0,
      status: constants.paymentStatus.paid,
    }).then(async (createdPayment) => {
      if (!createdPayment) {
        throw {
          status: constants.status.statusFalse,
          userStatus: req?.status,
          message: message.paymentCreateFailed,
        };
      }
      await Order.create({
        orderType: constants.orderType.purchase,
        orderNumber: createdPayment?.orderNumber,
        soldBy: new mongoose.Types.ObjectId(req?.body?.soldBy),
        orderBy: new mongoose.Types.ObjectId(req?.body?.orderBy),
        comment: req?.body?.comment,
        supplierAddress: new mongoose.Types.ObjectId(req?.body?.supplierAddress),
        shippingAddress: new mongoose.Types.ObjectId(req?.body?.shippingAddress),
        extraCharge: req?.body?.extraCharge,
        goodStatus: req?.body?.goodStatus,
        status: req?.body?.status,
        subtotal: req?.body?.subtotal,
        taxes: req?.body?.taxes,
        grandTotal: req?.body?.grandTotal,
        advanceToPay: req?.body?.advanceToPay,
        orderDate: req?.body?.orderDate,
        userId: req?.id,
        isDeleted: false,
        advanceTopay: req?.body?.advanceToPay,
        "primaryDocumentDetails.documentNumber": await generateOrderDocumentNumber(constants.primaryDocumentType.purchase),
        "primaryDocumentDetails.documentDate": Date(),
        "primaryDocumentDetails.customerId": req?.body?.primaryDocumentDetails.customerId,
        "primaryDocumentDetails.additionalDetails": req?.body?.primaryDocumentDetails.additionalDetails,
        "primaryDocumentDetails.contactPerson": req?.body?.primaryDocumentDetails.contactPerson,
        "primaryDocumentDetails.paymentTerm": req?.body?.primaryDocumentDetails.paymentTerm,
        items: Array.isArray(req?.body?.items) && req?.body?.items.length > 0 && req?.body?.items.map((item: any) => ({ ...item, orderNumber: orderNumber, totalAmount: item.totalAmount })),
      })
        .then(async (createdOrderDetails) => {
          if (!createdOrderDetails) {
            throw {
              status: constants.status.statusFalse,
              userStatus: req?.status,
              message: message.orderCreationError,
            };
          }
          await Invoice.create({
            orderNumber: createdOrderDetails?.orderNumber,
            invoiceNumber: await generateInvoiceNumber(),
            createdBy: req?.id,
            updatedBy: req?.id,
            isDeleted: false,
            soldBy: new mongoose.Types.ObjectId(req?.body?.soldBy),
            orderBy: new mongoose.Types.ObjectId(req?.body?.orderBy),
            shippingAddress: new mongoose.Types.ObjectId(createdOrderDetails?.shippingAddress),
            supplierAddress: new mongoose.Types.ObjectId(createdOrderDetails?.supplierAddress),
            signature: req.file.path,
            totalItem: Array(req?.body?.items).length,
            subTotal: req?.body?.subtotal,
            taxAmount: req?.body?.taxes,
            taxableAmount: req?.body?.taxes,
            items: Array.isArray(req?.body?.items) && req?.body?.items.length > 0 && req?.body?.items.map((item: any) => ({
              ...item, orderNumber: createdOrderDetails?.orderNumber, sellerId: new mongoose.Types.ObjectId(req.body.soldBy),
              "quantity.uom": item.unit, totalAmount: item.totalAmount
            })),
          })
            .then(async (invoiceDetails) => {
              if (!invoiceDetails) {
                throw {
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: message.orderCreationError,
                };
              }
              await createInvoice(req.hostname, "public/templates/purchase_order.html", await productDetailsOfOrder(createdOrderDetails?.orderNumber)).then(async (purchase_order_pdf_url) => {
                if (!purchase_order_pdf_url) {
                  throw {
                    statusCode: constants.code.dataNotFound,
                    message: message.purchaseOrderPdfFailed,
                  };
                }
                const fileName = purchase_order_pdf_url.split("files/")[1];
                const pdfPath = path.join(process.cwd(), "public", "files", fileName);
                const pdfData = readFileSync(pdfPath);

                const payload = {
                  to: `akankshapatel315@gmail.com`, title: constants.emailTitle.purchaseOrder,
                  data: { work: `work granted` },
                  attachments: [{
                    filename: "purchase_order.pdf", // Name the PDF file as you want it to appear in the email
                    content: pdfData,
                    contentType: "application/pdf",
                  }],
                };
                await sendMail(payload);
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  message: constants.message.success,
                  userStatus: req.status,
                });
              })
                .catch((err) => {
                  res.status(constants.code.preconditionFailed).json({
                    status: constants.status.statusFalse,
                    userStatus: req.status,
                    message: err,
                  });
                });
            })
        }).catch((err) => {
          console.log('error :>> ', err);
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err,
          });
        });
    }).catch((error) => {
      res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: error,
      });
    });
  }
  catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};



const updatePurchaseOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    await Order.findOne({ orderNumber: req?.body?.orderNumber })
      .then(async (orderDetails) => {
        if (!orderDetails) {
          throw {
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: message.noOrderFound,
          };
        }
        await Order.findOneAndUpdate(
          { orderNumber: orderDetails?.orderNumber },
          {
            orderType: constants.orderType.purchase,
            soldBy: new mongoose.Types.ObjectId(req?.body?.soldBy),
            orderBy: new mongoose.Types.ObjectId(req?.body?.orderBy),
            shippingAddress: req?.body?.shippingAddress,
            billingAddress: req?.body?.billingAddress,
            comment: req?.body?.comment,
            extraCharge: req?.body?.extraCharge,
            goodStatus: req?.body?.goodStatus,
            status: req?.body?.status,
            subtotal: req?.body?.subtotal,
            taxes: req?.body?.taxes,
            grandTotal: req?.body?.grandTotal,
            orderDate: req?.body?.orderDate,
            userId: req?.id,
            isDeleted: req?.body?.isDeleted,
            "primaryDocumentDetails.documentNumber": req?.body?.primaryDocumentDetails?.documentNumber,
            "primaryDocumentDetails.customerId": req?.body?.primaryDocumentDetails?.customerId,
            "primaryDocumentDetails.documentDate": req?.body?.primaryDocumentDetails?.documentDate,
            "primaryDocumentDetails.additionalDetails": req?.body?.primaryDocumentDetails?.additionalDetails,
            "primaryDocumentDetails.contactPerson": req?.body?.primaryDocumentDetails.contactPerson,
            "primaryDocumentDetails.paymentTerm": req?.body?.primaryDocumentDetails.paymentTerm,
            items: req?.body?.items && req?.body?.items.length > 0 && req?.body?.items.map((item: any) => ({ ...item, orderNumber: req?.body?.orderNumber, totalAmount: item.totalAmount }))
          },
          { new: true }
        )
          .then(async (createdOrderDetails) => {
            if (!createdOrderDetails) {
              throw {
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: message.orderCreationError,
              };
            }
            await Invoice.create({
              orderNumber: createdOrderDetails?.orderNumber,
              createdBy: req.id,
              updatedBy: req.id,
              isDeleted: false,
            })
              .then(async (invoiceDetails) => {
                if (!invoiceDetails) {
                  throw {
                    status: constants.status.statusFalse,
                    userStatus: req.status,
                    message: message.orderCreationError,
                  };
                }
                await createInvoice(req.hostname, "public/templates/purchase_order.html", await productDetailsOfOrder(createdOrderDetails?.orderNumber))
                  .then(async (purchase_order_pdf_url) => {
                    if (!purchase_order_pdf_url) {
                      throw {
                        statusCode: constants.code.dataNotFound,
                        message: message.orderCreationError,
                      };
                    }
                    const fileName = purchase_order_pdf_url.split("files/")[1];
                    const pdfPath = path.join(process.cwd(), "public", "files", fileName);
                    const pdfData = readFileSync(pdfPath);

                    const payload = {
                      to: `akankshapatel315@gmail.com`, title: constants.emailTitle.purchaseOrder,
                      data: { work: `work granted` },
                      attachments: [{
                        filename: "purchase_order.pdf", // Name the PDF file as you want it to appear in the email
                        content: pdfData,
                        contentType: "application/pdf",
                      }]
                    };
                    await sendMail(payload);
                    res.status(constants.code.success).json({
                      status: constants.status.statusTrue,
                      message: constants.message.success,
                      userStatus: req.status,
                    });
                  })
                  .catch((err) => {
                    res.status(constants.code.preconditionFailed).json({
                      status: constants.status.statusFalse,
                      userStatus: req.status,
                      message: err,
                    });
                  });
              })
              .catch((err) => {
                res.status(constants.code.preconditionFailed).json({
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: err,
                });
              });
          })
          .catch((err) => {
            res.status(constants.code.preconditionFailed).json({
              status: constants.status.statusFalse,
              userStatus: req.status,
              message: err,
            });
          });
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




const createOrderFromMessages = async (req: any, res: Response, next: NextFunction) => {
  try {
    Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.body.productId) } },
      {
        $project: {
          productId: "$_id",
          sku: 1,
          name: 1,
          productCode: 1,
          categoryId: 1,
          gst: "$GST",
          hsn: "$HSN",
          noOfPacks: { $divide: [req.body.refillQuantity, "$weight.quantityInPack"] },
          totalQuantity: { $round: [{ $multiply: [{ $divide: [req.body.refillQuantity, "$weight.quantityInPack"] }, "$weight.quantityInPack"] }, 0] },
          taxableAmount: { $round: [{ $divide: [{ $multiply: [{ $multiply: [req.body.refillQuantity, "$price.unitPrice"] }, "$GST"] }, 100] }, 0] },
          totalAmount: { $round: [{ $multiply: [req.body.refillQuantity, "$price.unitPrice"] }, 0] },
          sellingPrice: "$price.sellingPrice",
          packSize: "$weight.value",
          packQuantity: "$weight.quantityInPack",
          unit: "$weight.unit",
          deliveryDate: new Date(),
          _id: 0,
        },
      },
    ])
      .then(async (productDetails) => {
        if (!productDetails) {
          throw {
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: message.statusUpdateError,
          };
        }
        res.status(constants.code.success).json({
          status: constants.status.statusTrue,
          userStatus: req.status,
          message: message.productDetails,
          data: productDetails,
        });
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





const createPurchaseReturn = async (req: any, res: Response, next: NextFunction) => {
  try {
    const purchaseOrderDetails = await getPurchaseOrderDetails(req.body.orderNumber, req);
    const productDetails = await productDetailsOfOrder(req.body.orderNumber);
    if (!productDetails || !purchaseOrderDetails) {
      throw {
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: `${req.body.orderNumber} ${message.purchaseOrderNumberNotFound}`,
      };
    }
    const orderId = await generateOrderId();
    await Order.create({
      orderType: constants.orderType.purchaseReturn,
      orderNumber: orderId,
      soldBy: new mongoose.Types.ObjectId(productDetails.soldBy),
      orderBy: new mongoose.Types.ObjectId(productDetails.orderBy),
      comment: req?.body?.comment,
      supplierAddress: new mongoose.Types.ObjectId(purchaseOrderDetails?.supplierAddress),
      shippingAddress: new mongoose.Types.ObjectId(purchaseOrderDetails?.shippingAddress),
      extraCharge: req?.body?.extraCharge,
      goodStatus: req?.body?.goodStatus,
      status: constants.orderStatus.pending,
      subtotal: req?.body?.subtotal,
      taxes: req?.body?.taxes,
      grandTotal: req?.body?.grandTotal,
      advanceToPay: req?.body?.advanceToPay,
      orderDate: req?.body?.orderDate,
      userId: req?.id,
      "primaryDocumentDetails.documentNumber": await generateOrderDocumentNumber(constants.primaryDocumentType.purchaseReturn),
      "primaryDocumentDetails.customerId": "CUST-123",
      "primaryDocumentDetails.documentDate": new Date(),
      "primaryDocumentDetails.additionalDetails": req?.body?.additionalDetails,
      "primaryDocumentDetails.contactPerson": "Manu bhaker",
      "primaryDocumentDetails.paymentTerm": req?.body?.primaryDocumentDetails.paymentTerm,
      "primaryDocumentDetails.orderNumber": purchaseOrderDetails?.primaryDocumentDetails?.documentNumber,
      "primaryDocumentDetails.orderDate": purchaseOrderDetails?.primaryDocumentDetails?.documentDate,
      items: Array.isArray(req?.body?.items) && req?.body?.items.length > 0 && req?.body?.items.map((item: any) => ({ ...item, orderId: orderId, totalAmount: item.totalAmount }))
    })
      .then(async (createdPurchaseReturnOrderDetails) => {
        if (!createdPurchaseReturnOrderDetails) {
          throw {
            status: constants.status.statusFalse,
            userStatus: req?.status,
            message: message.orderCreationError,
          };
        }
        await createInvoice(req.hostname, "public/templates/purchase_return.html", await productDetailsOfOrder(orderId)).then(async (purchase_return_url) => {

          if (!purchase_return_url) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: message.purchaseOrderPdfFailed,
            };
          }
          const fileName = purchase_return_url.split("files/")[1];
          const pdfPath = path.join(process.cwd(), "public", "files", fileName);
          const pdfData = readFileSync(pdfPath);

          const payload = {
            to: `akankshapatel315@gmail.com`,
            title: constants.emailTitle.purchaseOrder,
            data: { work: `work granted` },
            attachments: [
              {
                filename: "purchase_return.pdf", // Name the PDF file as you want it to appear in the email
                content: pdfData,
                contentType: "application/pdf",
              },
            ],
          };
          await sendMail(payload);
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.productDetails,
            data: purchase_return_url,
          });

        }).catch((error) => {
          res.status(constants.code.preconditionFailed).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: error,
          });
        })

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




const getPurchaseOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const purchaseOrderDetails = await getPurchaseOrderDetails(req.body.orderNumber, req);
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



const generatePurchaseOrderInvoice = async (req: any, res: Response, next: NextFunction) => {
  try {
    await Invoice.findOne({ orderNumber: req.body.orderNumber }).then(
      async (invoiceDetails) => {
        if (!invoiceDetails) {
          Invoice.create({
            orderNumber: req.body.orderNumber,
            createdBy: req.id,
            updatedBy: req.id,
            isDeleted: false,
          })
            .then(async (invoiceData: any) => {
              if (invoiceData) {
                await Invoice.findOneAndUpdate(
                  { orderNumber: invoiceData.orderNumber },
                  { fileUrl: await createInvoice(req.hostname, "public/templates/purchase_order.html", await productDetailsOfOrder(req.body.orderId)) },
                  { new: true })
                  .then((invoiceDetails) => {
                    if (!invoiceDetails) {
                      throw {
                        status: constants.status.statusFalse,
                        userStatus: req.status,
                        message: message.orderCreationError,
                      };
                    }
                    res.status(constants.code.success).json({
                      status: constants.status.statusTrue,
                      userStatus: req.status,
                      message: message.purchasePdf,
                      data: invoiceDetails,
                    });
                  })
                  .catch((error) => {
                    res.status(constants.code.preconditionFailed).json({
                      status: constants.status.statusFalse,
                      userStatus: req.status,
                      message: error,
                    });
                  });
              } else {
                throw {
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: message.purchaseOrderPdfFailed,
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
        } else {
          const invoiceData: any = await Invoice.findOne({
            orderNumber: req.body.orderNumber,
          });
          await Invoice.findOneAndUpdate(
            { orderNumber: req.body.orderNumber },
            { fileUrl: await createInvoice(req.hostname, "public/templates/purchase_order.html", await productDetailsOfOrder(req.body.orderId)) },
            { new: true })
            .then((invoiceDetails) => {
              if (!invoiceDetails) {
                throw {
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: message.invoiceNotFound,
                };
              }
              res.status(constants.code.preconditionFailed).json({
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: message.purchasePdf,
                data: invoiceDetails,
              });
            })
            .catch((error) => {
              res.status(constants.code.preconditionFailed).json({
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: error,
              });
            });
        }
      }
    );
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};



const updateStatusOfPurchaseOrder = async (req: any, res: any) => {
  try {
    const items = req.body.items;

    await Payment.find().sort({ createdAt: -1 }).then((paymentDetails: any) => {
      if (paymentDetails[0]?.dueAmount > 0 && items.some((item: any) => item.status === constants.orderStatus.completed)) {
        throw {
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: "can not complete the order because due amount is pending to pay",
        };
      }
    })

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      await Order.findOne({ orderNumber: req.body.orderNumber, "items._id": item.itemId }).then(async (orderDetails: any) => {
        if (item.deliveredPacks > orderDetails?.items.find((ele: any) => ele._id.equals(item.itemId)).noOfPacks) {
          index++
        }
        else {
          await Order.findOneAndUpdate(
            { orderNumber: req.body.orderNumber, "items._id": item.itemId },
            { $set: { "items.$.status.orderStatus": item.status }, $inc: { "items.$.deliveredPacks": item.deliveredPacks } },
            { new: true }
          )
            .then(async (orderDetails: any) => {
              if (!orderDetails) {
                throw {
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: message.noOrderFound,
                };
              }
              else {
                orderDetails.items = orderDetails?.items.find((ele: any) => ele._id.equals(item.itemId))
                if (item.status === constants.orderStatus.delivered) {
                  let inventoryHistoryDataStatus: any = [];
                  for (let index = 0; index < orderDetails.items.length; index++) {
                    const product: any = orderDetails.items[index];

                    const productDetails = {
                      batchNumber: product.batchNo,
                      location_id: orderDetails.shippingAddress,
                      msl: 0,
                      numberOfunits: product.noOfPacks,
                      operationType: constants.operationType.add,
                      product_id: product.productId,
                      uom: new mongoose.Types.ObjectId(item.unit),
                    };
                    const inventoryHistoryData = await manageInventoryPurchaseOrder(productDetails, req);
                    inventoryHistoryDataStatus.push(inventoryHistoryData ? true : false);
                  }
                  if (inventoryHistoryDataStatus.some((ele: boolean) => !ele)) {
                    throw {
                      status: constants.status.statusFalse,
                      userStatus: req.status,
                      message: `${message.purchaseOrderStatusUpdateFailed} ${orderDetails.items[
                        inventoryHistoryDataStatus.findIndex((ele: boolean) => !ele)
                      ].product_id
                        }`,
                    };
                  }
                } else if (item.status === constants.orderStatus.partiallyDelivered) {
                  let inventoryHistoryDataStatus: any = [];
                  for (let index = 0; index < orderDetails.items.length; index++) {
                    const product: any = orderDetails.items[index];
                    const productDetails = {
                      batchNumber: product.batchNo,
                      location_id: orderDetails.shippingAddress,
                      msl: 0,
                      numberOfunits: product.deliveredPacks,
                      operationType: constants.operationType.add,
                      product_id: product.productId,
                      uom: new mongoose.Types.ObjectId(item.unit),
                    };
                    const inventoryHistoryData = await manageInventoryPurchaseOrder(
                      productDetails,
                      req
                    );
                    inventoryHistoryDataStatus.push(inventoryHistoryData ? true : false);
                  }
                  if (inventoryHistoryDataStatus.some((ele: boolean) => !ele)) {
                    throw {
                      status: constants.status.statusFalse,
                      userStatus: req.status,
                      message: `${message.purchaseOrderStatusUpdateFailed} ${orderDetails.items[
                        inventoryHistoryDataStatus.findIndex((ele: boolean) => !ele)
                      ].product_id
                        }`,
                    };
                  }
                }
              }
            })
            .catch((error: any) => {
              res.status(constants.code.preconditionFailed).json({
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: error,
              });
            });
        }
        updateOverAllStatusOfPurchaseOrder(req, res);
      }).catch((error) => {
        res.status(constants.code.preconditionFailed).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: error,
        })
      })
    }



  } catch (error: any) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};



const updateStatusOfPurchaseReturnOrder = async (req: any, res: any) => {
  try {
    await Order.findOne({ orderNumber: req.body.orderId })
      .then(async (orderDetails: any) => {
        if (!orderDetails) {
          throw {
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: message.noOrderFound,
          };
        } else {
          if (req.body.status === constants.orderStatus.shipped) {
            let inventoryHistoryDataStatus: any = [];
            for (let index = 0; index < orderDetails.items.length; index++) {
              const product: any = orderDetails.items[index];

              const productDetails = {
                batchNumber: product.batchNo,
                location_id: orderDetails.shippingAddress,
                msl: 0,
                numberOfunits: product.noOfPacks,
                operationType: constants.operationType.remove,
                product_id: product.productId,
                uom: new mongoose.Types.ObjectId(req.body.unit),
              };
              const inventoryHistoryData = await manageInventoryPurchaseOrder(productDetails, req);
              inventoryHistoryDataStatus.push(inventoryHistoryData ? true : false);
            }
            if (inventoryHistoryDataStatus.some((ele: boolean) => !ele)) {
              throw {
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: `${message.purchaseOrderStatusUpdateFailed} ${orderDetails.items[
                  inventoryHistoryDataStatus.findIndex((ele: boolean) => !ele)
                ].product_id
                  }`,
              };
            }
          } else if (
            req.body.status === constants.orderStatus.partialllyShipped
          ) {
            let inventoryHistoryDataStatus: any = [];
            for (let index = 0; index < orderDetails.items.length; index++) {
              const product: any = orderDetails.items[index];
              const productDetails = {
                batchNumber: product.batchNo,
                location_id: orderDetails.shippingAddress,
                msl: 0,
                numberOfunits: product.noOfPacks,
                operationType: constants.operationType.remove,
                product_id: product.productId,
                uom: new mongoose.Types.ObjectId(req.body.unit),
              };
              const inventoryHistoryData = await manageInventoryPurchaseOrder(
                productDetails,
                req
              );
              inventoryHistoryDataStatus.push(
                inventoryHistoryData ? true : false
              );
            }
            if (inventoryHistoryDataStatus.some((ele: boolean) => !ele)) {
              throw {
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: `${message.purchaseOrderStatusUpdateFailed} ${orderDetails.items[
                  inventoryHistoryDataStatus.findIndex((ele: boolean) => !ele)
                ].product_id
                  }`,
              };
            }
          }
        }
        updateOverAllStatusOfPurchaseReturn(req, res);
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



export default {
  createPurchaseOrder,
  updatePurchaseOrder,
  generatePurchaseOrderInvoice,
  updateStatusOfPurchaseOrder,
  createOrderFromMessages,
  createPurchaseReturn,
  getPurchaseOrder,
  updateStatusOfPurchaseReturnOrder
};
