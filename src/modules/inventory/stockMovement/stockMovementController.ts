import { Request, Response, NextFunction } from "express";
import Inventory from "../../../models/inventory";
import Address from "../../../models/address";
import Company from "../../../models/company";
import message from "./stockMovementConstants";
import constants from "../../../utils/constants";
import Product from "../../../models/product";
import mongoose from "mongoose";
import InventoryHistory from "../../../models/inventoryHistory";
import sendMail from "../../../helpers/mail";
import { generateDocumentNumber } from "../../../helpers/helper";
import { error } from "console";
const excelJs = require("exceljs");
var fs = require("fs");

// const selectStock = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     await Company.findOne({ isCompanyErp: true, isDeleted: false })
//       .then((company_detail: any) => {
//         if (!company_detail) {
//           throw {
//             statusCode: constants.code.dataNotFound,
//             message: message.companyNotFound,
//           };
//         } else {
//           Address.find({ isDeleted: false, companyId: company_detail._id })
//             .then((address_detail: any) => {
//               if (!address_detail) {
//                 throw {
//                   statusCode: constants.code.dataNotFound,
//                   message: constants.message.addressNotLinked,
//                 };
//               } else if (address_detail.length < 2) {
//                 throw {
//                   statusCode: constants.code.dataNotFound,
//                   message: message.wareHouseNotFound,
//                 };
//               } else {
//                 Product.aggregate([
//                   {
//                     $match: {
//                       isDeleted: false,
//                       name: {
//                         $regex: "^" + req.query.search + ".*",
//                         $options: "i",
//                       },
//                     },
//                   },
//                   {
//                     $lookup: {
//                       from: "uoms",
//                       localField: "weight.unit",
//                       foreignField: "_id",
//                       as: "uom_detail",
//                     },
//                   },
//                   {
//                     $unwind: {
//                       path: "$uom_detail",
//                       preserveNullAndEmptyArrays: true,
//                     },
//                   },
//                   {
//                     $lookup: {
//                       from: "inventories",
//                       localField: "_id",
//                       foreignField: "productId",
//                       as: "inventory_detail",
//                     },
//                   },
//                   { $unwind: "$inventory_detail" },
//                   {
//                     $lookup: {
//                       from: "addresses",
//                       localField: "inventory_detail.locationId",
//                       foreignField: "_id",
//                       as: "warehouse_detail",
//                     },
//                   },

//                   // {
//                   //     $lookup: {
//                   //         from: "addresses",
//                   //         localField: company_detail._id,
//                   //         foreignField: "companyId",
//                   //         as: "all_addresses"
//                   //     }
//                   // },
//                   {
//                     $lookup: {
//                       from: "addresses",
//                       let: { companyId: company_detail._id },
//                       pipeline: [
//                         {
//                           $match: {
//                             $expr: { $eq: ["$$companyId", "$companyId"] },
//                             isDeleted: false,
//                           },
//                         },
//                       ],
//                       as: "all_addresses",
//                     },
//                   },

//                 //   {
//                 //     $project: {
//                 //       _id: 1,
//                 //       name: 1,
//                 //       unitPrice: 1,
//                 //       description: 1,
//                 //       sku: 1,
//                 //       uom: "$uom_detail.slug",
//                 //       uom_id: "$uom_detail._id",
//                 //       locationFrom: {
//                 //         $push: {
//                 //           $first: {
//                 //             $map: {
//                 //               input: "$warehouse_detail",
//                 //               as: "warehouse",
//                 //               in: {
//                 //                 name: "$$warehouse.slug",
//                 //                 id: "$$warehouse._id",
//                 //               },
//                 //             },
//                 //           },
//                 //         },
//                 //       },
//                 //       locationTo: {
//                 //         //   $push: {
//                 //         $push: {
//                 //           $map: {
//                 //             input: "$all_addresses",
//                 //             as: "addresses",
//                 //             in: {
//                 //               name: "$$addresses.slug",
//                 //               id: "$$addresses._id",
//                 //             },
//                 //           },
//                 //           //   },
//                 //         },
//                 //       },
//                 //     },
//                 //   },
//                 {
//                     $group: {
//                       _id: "$_id",
//                       name: { $first: "$name" },
//                       unitPrice: { $first: "$unitPrice" },
//                       description: {
//                         $first: "$description",
//                       },
//                       sku: { $first: "$sku" },
//                       uom: { $first: "$uom_detail.slug" },
//                       uom_id: { $first: "$uom_detail._id" },
//                       locationFrom: {
//                         $push: {
//                           $first: {
//                             $map: {
//                               input: "$warehouse_detail",
//                               as: "warehouse",
//                               in: {
//                                 name: "$$warehouse.slug",
//                                 id: "$$warehouse._id",
//                               },
//                             },
//                           },
//                         },
//                       },
//                       locationTo: {

//                             //   $push: {
//                                $push:{
//                                 $map: {
//                                     input: "$all_addresses",
//                                     as: "addresses",
//                                     in: {
//                                       name: "$$addresses.slug",
//                                       id: "$$addresses._id",
//                                     },
//                                }
//                                 //   },

//                         }
//                       },
//                     },
//                   },
//                 ])
//                   .then((product_detail: any) => {
//                     if (!product_detail) {
//                       throw {
//                         statusCode: constants.code.dataNotFound,
//                         message: message.productNotFound,
//                       };
//                     } else {
//                       res.status(constants.code.success).json({
//                         statusCode: constants.code.success,
//                         userStatus: req.status,
//                         data: product_detail,
//                       });
//                     }
//                   })
//                   .catch((err) => {
//                     //product_error
//                     res.status(err.statusCode).json({
//                       statusCode: err.statusCode,
//                       message: err.message,
//                     });
//                   });
//               }
//             })
//             .catch((err) => {
//               res.status(err.statusCode).json({
//                 statusCode: err.statusCode,
//                 message: err.message,
//               });
//             });
//         }
//       })
//       .catch((err) => {
//         //company detail error
//         res.status(err.statusCode).json({
//           statusCode: err.statusCode,
//           message: err.message,
//         });
//       });
//   } catch (error: any) {
//     res.status(constants.code.internalServerError).json({
//       statusCode: error.statusCode,
//       message: error,
//     });
//   }
// };

const selectStock = async (req: any, res: Response, next: NextFunction) => {
  try {
    Inventory.aggregate([
      {
        $match: {
          locationId: new mongoose.Types.ObjectId(req.body.locationId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "products",
          let: { productId: "$productId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] },
                $or: [
                  {
                    name: {
                      $regex: "^" + req.query.search + ".*",

                      $options: "i",
                    },
                  },
                ],
                isDeleted: false,
              },
            },
          ],
          as: "product_detail",
        },
      },
      {
        $unwind: "$product_detail",
      },
      {
        $lookup: {
          from: "brands",
          localField: "product_detail.brandId",
          foreignField: "_id",
          as: "brand_detail",
        },
      },
      {
        $unwind: "$brand_detail",
      },
      {
        $lookup: {
          from: "uoms",
          localField: "product_detail.weight.unit",
          foreignField: "_id",
          as: "uom_detail",
        },
      },
      {
        $unwind: "$uom_detail",
      },
      {
        $project: {
          _id: "$product_detail._id",
          sku: "$product_detail.sku",
          price: "$product_detail.unitPrice",
          name: "$product_detail.name",
          description: "$product_detail.description",
          uom_id: "$uom_detail._id",
          uom_name: "$uom_detail.slug",
          brand_name:"$brand_detail.name"
        },
      },
    ])
      .then((data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            data: data,
          });
        }
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: err.message,
        });
      });
  } catch (error) {
    res.status(constants.code.dataNotFound).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

// const stockTransfer = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     const products = req.body.products;
//     let transaction_id = await generateDocumentNumber();

//     if (req.body.sourceLocation === req.body.destinationLocation) {
//       throw {
//         statusCode: constants.code.badRequest,
//         message: message.sameWareHouse,
//       };
//     }

//     const companyData: any = await Company.findOne({
//       isDeleted: false,
//       isCompanyErp: true,
//     });
//     if (!companyData) {
//       throw {
//         statusCode: constants.code.badRequest,
//         message: message.updateSelfAddress,
//       };
//     }
//     for (let i = 0; i < products.length; i++) {
//       try {
//         const existingInventoryDetail = await Inventory.findOne({
//           locationId: new mongoose.Types.ObjectId(req.body.sourceLocation),
//           productId: new mongoose.Types.ObjectId(products[i].product_id),
//           isDeleted: false,
//         }).exec();

//         if (!existingInventoryDetail) {
//           throw new Error(constants.message.dataNotFound);
//         }

//         const updatedStockQuantity =
//           existingInventoryDetail.quantity - Number(products[i].quantity);

//         if (existingInventoryDetail.quantity < Number(products[i].quantity)) {
//           throw {
//             statusCode: constants.code.dataNotFound,
//             message: message.insufficientStock + ` for product number ${i+1}`,
//           };
//         }

//         if (Number(updatedStockQuantity) < existingInventoryDetail?.msl) {
//           //     const payload = {
//           //         //to: ['sanghee2343@gmail.com'],
//           //         to:companyData?.companyEmail?.value,
//           //         title: constants?.emailTitle?.reachedMsl,
//           //         body:message.mslReached,
//           //         data: {
//           //         companyName: 'company_detail?.name,',
//           //         email: 'company_detail?.companyEmail?.value,',
//           //         data:`${product_detail.name},`
//           //       },
//           //  };
//           // await sendMail(payload);
//         }

//         const updated_stockData = await Inventory.findOneAndUpdate(
//           {
//             locationId: req.body.sourceLocation,
//             productId: products[i].product_id,
//             isDeleted: false,
//           },
//           {
//             $set: {
//               quantity: updatedStockQuantity,
//               isDeleted: false,
//             },
//           }
//         ).exec();

//         if (!updated_stockData) {
//           throw new Error(message.stockOriginUpdateFailed);
//         }

//         // const transfferedStock = await Inventory.findOneAndUpdate(
//         //     {
//         //         locationId: req.body.destinationLocation,
//         //         productId: products[i].product_id,
//         //         isDeleted: false,
//         //     },
//         //     {
//         //         $set: {
//         //             company_Id:companyData?._id,
//         //             locationId: req.body.destinationLocation,
//         //             productId: products[i].product_id,
//         //             quantity: products[i].quantity,
//         //         },
//         //     },
//         //     { new: true, upsert: true }
//         // ).exec();
//         await Inventory.findOne({
//           locationId: req.body.destinationLocation,
//           productId: products[i].product_id,
//           isDeleted: false,
//         }).then(async (destinationWarehouseDetail) => {
//           await Inventory.findOneAndUpdate(
//             {
//               locationId: req.body.destinationLocation,
//               productId: products[i].product_id,
//               isDeleted: false,
//             },
//             {
//               $set: {
//                 company_Id: companyData?._id,
//                 locationId: req.body.destinationLocation,
//                 productId: products[i].product_id,
//                 quantity: destinationWarehouseDetail
//                   ? Number(destinationWarehouseDetail.quantity) +
//                     Number(products[i].quantity)
//                   : Number(products[i].quantity),
//               },
//             },
//             { new: true, upsert: true }
//           )
//             .then(async (transfferedStock) => {
//               if (!transfferedStock) {
//                 throw new Error(message.stockDestinationUpdateFailed);
//               } else {
//                 await InventoryHistory.findOneAndUpdate(
//                   {
//                     transaction_id: transaction_id,
//                     isDeleted: false,
//                   },
//                   {
//                     $push: {
//                       product: {
//                         product_id: products[i].product_id,
//                         quantity: {
//                           previous: Number(existingInventoryDetail.quantity),
//                           changed: Number(products[i].quantity),
//                           new: Number(updatedStockQuantity),
//                         },
//                         msl: {
//                           previous: existingInventoryDetail.msl,
//                           changed: transfferedStock.msl,
//                           new: Number(existingInventoryDetail.msl),
//                         },
//                         price: Number(products[i].price),
//                       },
//                     },
//                     type: constants.historyType.StockTransfer,
//                     sourceLocation: req.body.sourceLocation,
//                     destinationLocation: req.body.destinationLocation,
//                     createdBy: req.id,
//                   },
//                   { new: true, upsert: true }
//                 )
//                   .then((createdHistory) => {
//                     if (!createdHistory) {
//                       throw {
//                         statusCode: constants.code.dataNotFound,
//                         message: constants.message.dataNotFound,
//                       };
//                     } else {
//                       if (i === products.length - 1 && createdHistory) {
//                         res.status(constants.code.success).json({
//                           status: constants.status.statusTrue,
//                           userStatus: req.status,
//                           message: message.stockTransfferSuccess,
//                         });
//                       }
//                     }
//                   })
//                   .catch((err: any) => {
//                     res
//                       .status(
//                         err?.statusCode
//                           ? err?.statusCode
//                           : constants.code.badRequest
//                       )
//                       .json({
//                         status: constants.status.statusFalse,
//                         userStatus: req.status,
//                         message: err.message,
//                       });
//                   });
//               }
//             })
//             .catch((err: any) => {
//               res
//                 .status(
//                   err?.statusCode ? err?.statusCode : constants.code.badRequest
//                 )
//                 .json({
//                   status: constants.status.statusFalse,
//                   userStatus: req.status,
//                   message: err.message,
//                 });
//             });
//         });

//         // if (!transfferedStock) {
//         //     throw new Error(message.stockDestinationUpdateFailed);
//         // }

//         // const createdHistory = await InventoryHistory.findOneAndUpdate(
//         //     {
//         //         transaction_id: transaction_id,
//         //         isDeleted: false,
//         //     },
//         //     {
//         //         $push: {
//         //             product: {
//         //                 product_id: products[i].product_id,
//         //                 quantity: {
//         //                     previous: Number(existingInventoryDetail.quantity),
//         //                     changed: Number(products[i].quantity),
//         //                     new: Number(updatedStockQuantity),
//         //                 },
//         //                 msl: {
//         //                     previous: existingInventoryDetail.msl,
//         //                     changed: transfferedStock.msl,
//         //                     new: Number(existingInventoryDetail.msl),
//         //                 },
//         //                 price: Number(products[i].price),
//         //             },
//         //         },
//         //         type: constants.historyType.StockTransfer,
//         //         sourceLocation: req.body.sourceLocation,
//         //         destinationLocation: req.body.destinationLocation,
//         //         createdBy: req.id,
//         //     },
//         //     { new: true, upsert: true }
//         // ).exec();

//         // if (i === products.length - 1 && createdHistory) {
//         //     res.status(constants.code.success).json({
//         //         status: constants.status.statusTrue,
//         //         userStatus: req.status,
//         //         message: message.stockTransfferSuccess,
//         //     });
//         // }
//       } catch (err: any) {
//         // console.log("err", err)
//         res.status(err.statusCode || constants.code.preconditionFailed).json({
//           status: constants.status.statusFalse,
//           userStatus: req.status,
//           message: err.message || err,
//         });
//         break;
//       }
//     }
//   } catch (error: any) {
//     // console.log(error, "err1");
//     res.status(constants.code.preconditionFailed).json({
//       status: constants.status.statusFalse,
//       userStatus: req.status,
//       message: error.message ? error.message : error,
//     });
//   }
// };

// const stockTransfer = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     const products = req.body.products;
//     let transaction_id = await generateDocumentNumber();

//     if (req.body.sourceLocation === req.body.destinationLocation) {
//       throw {
//         statusCode: constants.code.badRequest,
//         message: message.sameWareHouse,
//       };
//     }

//     const companyData: any = await Company.findOne({
//       isDeleted: false,
//       isCompanyErp: true,
//     });
//     if (!companyData) {
//       throw {
//         statusCode: constants.code.badRequest,
//         message: message.updateSelfAddress,
//       };
//     }

//     let existingInventoryDetail: any = 0;
//     let updatedStockQuantity: any = 0;

//     //loop for checking stock quantity;
//     for (let i = 0; i < products.length; i++) {
//        existingInventoryDetail = await Inventory.findOne({
//         locationId: new mongoose.Types.ObjectId(req.body.sourceLocation),
//         productId: new mongoose.Types.ObjectId(products[i].product_id),
//         isDeleted: false,
//       }).exec();

//       if (!existingInventoryDetail) {
//         throw new Error(constants.message.dataNotFound);
//       }

     

//       if (existingInventoryDetail.quantity < Number(products[i].quantity)) {
//         throw {
//           statusCode: constants.code.dataNotFound,
//           message: message.insufficientStock + ` of product number ${i}`,
//         };
//       }

//        updatedStockQuantity =
//       existingInventoryDetail.quantity - Number(products[i].quantity);

//       if (Number(updatedStockQuantity) < existingInventoryDetail?.msl) {
//         //     const payload = {
//         //         //to: ['sanghee2343@gmail.com'],
//         //         to:companyData?.companyEmail?.value,
//         //         title: constants?.emailTitle?.reachedMsl,
//         //         body:message.mslReached,
//         //         data: {
//         //         companyName: 'company_detail?.name,',
//         //         email: 'company_detail?.companyEmail?.value,',
//         //         data:`${product_detail.name},`
//         //       },
//         //  };
//         // await sendMail(payload);
//       }
//     }

//     //loop for transferring stock;
//     for (let i = 0; i < products.length; i++) {
//       try {
//         // const existingInventoryDetail = await Inventory.findOne({
//         //   locationId: new mongoose.Types.ObjectId(req.body.sourceLocation),
//         //   productId: new mongoose.Types.ObjectId(products[i].product_id),
//         //   isDeleted: false,
//         // }).exec();

//         // if (!existingInventoryDetail) {
//         //   throw new Error(constants.message.dataNotFound);
//         // }

//         // const updatedStockQuantity =
//         //   existingInventoryDetail.quantity - Number(products[i].quantity);

//         // if (existingInventoryDetail.quantity < Number(products[i].quantity)) {
//         //   throw {
//         //     statusCode: constants.code.dataNotFound,
//         //     message: message.insufficientStock +`of ${products[i].name}`,
//         //   };
//         // }

//         // if (Number(updatedStockQuantity) < existingInventoryDetail?.msl) {
//         //   //     const payload = {
//         //   //         //to: ['sanghee2343@gmail.com'],
//         //   //         to:companyData?.companyEmail?.value,
//         //   //         title: constants?.emailTitle?.reachedMsl,
//         //   //         body:message.mslReached,
//         //   //         data: {
//         //   //         companyName: 'company_detail?.name,',
//         //   //         email: 'company_detail?.companyEmail?.value,',
//         //   //         data:`${product_detail.name},`
//         //   //       },
//         //   //  };
//         //   // await sendMail(payload);
//         // }

//         // const updated_stockData = await Inventory.findOneAndUpdate(
//         //   {
//         //     locationId: req.body.sourceLocation,
//         //     productId: products[i].product_id,
//         //     isDeleted: false,
//         //   },
//         //   {
//         //     $set: {
//         //       quantity: updatedStockQuantity,
//         //       isDeleted: false,
//         //     },
//         //   }
//         // ).exec();

//         if (!updated_stockData) {
//           throw new Error(message.stockOriginUpdateFailed);
//         }

//         // const transfferedStock = await Inventory.findOneAndUpdate(
//         //     {
//         //         locationId: req.body.destinationLocation,
//         //         productId: products[i].product_id,
//         //         isDeleted: false,
//         //     },
//         //     {
//         //         $set: {
//         //             company_Id:companyData?._id,
//         //             locationId: req.body.destinationLocation,
//         //             productId: products[i].product_id,
//         //             quantity: products[i].quantity,
//         //         },
//         //     },
//         //     { new: true, upsert: true }
//         // ).exec();
//         await Inventory.findOne({
//           locationId: req.body.destinationLocation,
//           productId: products[i].product_id,
//           isDeleted: false,
//         }).then(async (destinationWarehouseDetail) => {
//           await Inventory.findOneAndUpdate(
//             {
//               locationId: req.body.destinationLocation,
//               productId: products[i].product_id,
//               isDeleted: false,
//             },
//             {
//               $set: {
//                 company_Id: companyData?._id,
//                 locationId: req.body.destinationLocation,
//                 productId: products[i].product_id,
//                 quantity: destinationWarehouseDetail
//                   ? Number(destinationWarehouseDetail?.quantity) +
//                     Number(products[i].quantity)
//                   : Number(products[i].quantity),
//               },
//             },
//             { new: true, upsert: true }
//           )
//             .then(async (transfferedStock) => {
//               if (!transfferedStock) {
//                 throw new Error(message.stockDestinationUpdateFailed);
//               } else {
//                 await InventoryHistory.findOneAndUpdate(
//                   {
//                     transaction_id: transaction_id,
//                     isDeleted: false,
//                   },
//                   {
//                     $push: {
//                       product: {
//                         product_id: products[i].product_id,
//                         quantity: {
//                           previous: Number(existingInventoryDetail.quantity),
//                           changed: Number(products[i].quantity),
//                           new: Number(updatedStockQuantity),
//                         },
//                         msl: {
//                           previous: existingInventoryDetail.msl,
//                           changed: transfferedStock.msl,
//                           new: Number(existingInventoryDetail.msl),
//                         },
//                         price: Number(products[i].price),
//                       },
//                     },
//                     type: constants.historyType.StockTransfer,
//                     sourceLocation: req.body.sourceLocation,
//                     destinationLocation: req.body.destinationLocation,
//                     createdBy: req.id,
//                   },
//                   { new: true, upsert: true }
//                 )
//                   .then((createdHistory) => {
//                     if (!createdHistory) {
//                       throw {
//                         statusCode: constants.code.dataNotFound,
//                         message: constants.message.dataNotFound,
//                       };
//                     } else {
//                       if (i === products.length - 1 && createdHistory) {
//                         res.status(constants.code.success).json({
//                           status: constants.status.statusTrue,
//                           userStatus: req.status,
//                           message: message.stockTransfferSuccess,
//                         });
//                       }
//                     }
//                   })
//                   .catch((err: any) => {
//                     res
//                       .status(
//                         err?.statusCode
//                           ? err?.statusCode
//                           : constants.code.badRequest
//                       )
//                       .json({
//                         status: constants.status.statusFalse,
//                         userStatus: req.status,
//                         message: err.message,
//                       });
//                   });
//               }
//             })
//             .catch((err: any) => {
//               res
//                 .status(
//                   err?.statusCode ? err?.statusCode : constants.code.badRequest
//                 )
//                 .json({
//                   status: constants.status.statusFalse,
//                   userStatus: req.status,
//                   message: err.message,
//                 });
//             });
//         });

//         // if (!transfferedStock) {
//         //     throw new Error(message.stockDestinationUpdateFailed);
//         // }

//         // const createdHistory = await InventoryHistory.findOneAndUpdate(
//         //     {
//         //         transaction_id: transaction_id,
//         //         isDeleted: false,
//         //     },
//         //     {
//         //         $push: {
//         //             product: {
//         //                 product_id: products[i].product_id,
//         //                 quantity: {
//         //                     previous: Number(existingInventoryDetail.quantity),
//         //                     changed: Number(products[i].quantity),
//         //                     new: Number(updatedStockQuantity),
//         //                 },
//         //                 msl: {
//         //                     previous: existingInventoryDetail.msl,
//         //                     changed: transfferedStock.msl,
//         //                     new: Number(existingInventoryDetail.msl),
//         //                 },
//         //                 price: Number(products[i].price),
//         //             },
//         //         },
//         //         type: constants.historyType.StockTransfer,
//         //         sourceLocation: req.body.sourceLocation,
//         //         destinationLocation: req.body.destinationLocation,
//         //         createdBy: req.id,
//         //     },
//         //     { new: true, upsert: true }
//         // ).exec();

//         // if (i === products.length - 1 && createdHistory) {
//         //     res.status(constants.code.success).json({
//         //         status: constants.status.statusTrue,
//         //         userStatus: req.status,
//         //         message: message.stockTransfferSuccess,
//         //     });
//         // }
//       } catch (err: any) {
//         // console.log("err", err)
//         res.status(err.statusCode || constants.code.preconditionFailed).json({
//           status: constants.status.statusFalse,
//           userStatus: req.status,
//           message: err.message || err,
//         });
//         break;
//       }
//     }
//   } catch (error: any) {
//     // console.log(error, "err1");
//     res.status(constants.code.preconditionFailed).json({
//       status: constants.status.statusFalse,
//       userStatus: req.status,
//       message: error.message ? error.message : error,
//     });
//   }
// };

const stockHistory = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    if (Number(req.query.limit) !== 0) {
      InventoryHistory.aggregate([
        {
          $match: {
            isDeleted: false,
            type: constants.historyType.StockTransfer,
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "sourceLocation",
            foreignField: "_id",
            as: "source_addressDetail",
          },
        },
        { $unwind: "$source_addressDetail" },
        {
          $lookup: {
            from: "addresses",
            localField: "destinationLocation",
            foreignField: "_id",
            as: "destination_addressDetail",
          },
        },
        {
          $unwind: {
            path: "$destination_addressDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "user_detail",
          },
        },
        { $unwind: "$user_detail" },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "products",
            localField: "product.product_id",
            foreignField: "_id",
            as: "product_detail",
          },
        },
        { $unwind: "$product_detail" },
        {
          $group: {
            _id: "$_id",
            transaction_id: { $first: "$transaction_id" },
            type: { $first: "$type" },
            source_addressDetail: { $first: "$source_addressDetail" },
            destination_addressDetail: { $first: "$destination_addressDetail" },
            user_detail: { $first: "$user_detail" },
            products: {
              $push: {
                product_detail: "$product_detail",
                quantity: "$product.quantity",
                msl: "$product.msl",
                price: "$product.price",
                currency: "$product.currency",
              },
            },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            productCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            transaction_id: 1,
            type: 1,
            from_store_id: "$source_addressDetail._id",
            from_store_slug: "$source_addressDetail.slug",
            to_store_id: "$destination_addressDetail._id",
            to_store_slug: "$destination_addressDetail.slug",
            user_fname: "$user_detail.fname",
            user_lname: "$user_detail.lname",
            products: 1,
            updatedAt: 1,
            total_items_transffered: "$productCount",
          },
        },
        { $sort: { createdAt: sort } },
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { $addFields: { page: page } },
              {
                $addFields: {
                  totalPages: { $ceil: { $divide: ["$total", limit] } },
                },
              },
              {
                $addFields: {
                  hasPrevPage: {
                    $cond: { if: { $gt: [page, 1] }, then: true, else: false },
                  },
                },
              },
              {
                $addFields: {
                  prevPage: {
                    $cond: {
                      if: { $gt: [page, 1] },
                      then: page - 1,
                      else: null,
                    },
                  },
                },
              },
              {
                $addFields: {
                  hasNextPage: {
                    $cond: {
                      if: {
                        $lt: [page, { $ceil: { $divide: ["$total", limit] } }],
                      },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
              {
                $addFields: {
                  nextPage: {
                    $cond: {
                      if: {
                        $lt: [page, { $ceil: { $divide: ["$total", limit] } }],
                      },
                      then: page + 1,
                      else: null,
                    },
                  },
                },
              },
            ],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ])
        .then((inventory_histories) => {
          if (!inventory_histories) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.status.statusTrue,
              userStatus: req.status,
              message: constants.message.success,
              data: inventory_histories,
            });
          }
        })
        .catch((err: any) => {
          res.status(err.statusCode).json({
            statusCode: constants.status.statusFalse,
            userStatus: req.status,
            message: err.message,
          });
        });
    } else {
      InventoryHistory.aggregate([
        {
          $match: {
            isDeleted: false,
            type: constants.historyType.StockTransfer,
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "sourceLocation",
            foreignField: "_id",
            as: "source_addressDetail",
          },
        },
        { $unwind: "$source_addressDetail" },
        {
          $lookup: {
            from: "addresses",
            localField: "destinationLocation",
            foreignField: "_id",
            as: "destination_addressDetail",
          },
        },
        {
          $unwind: {
            path: "$destination_addressDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "user_detail",
          },
        },
        { $unwind: "$user_detail" },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "products",
            localField: "product.product_id",
            foreignField: "_id",
            as: "product_detail",
          },
        },
        { $unwind: "$product_detail" },
        {
          $group: {
            _id: "$transaction_id",
            transaction_id: { $first: "$transaction_id" },
            type: { $first: "$type" },
            source_addressDetail: { $first: "$source_addressDetail" },
            destination_addressDetail: { $first: "$destination_addressDetail" },
            user_detail: { $first: "$user_detail" },
            products: {
              $push: {
                product_detail: "$product_detail",
                quantity: "$product.quantity",
                msl: "$product.msl",
                price: "$product.price",
                currency: "$product.currency",
              },
            },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            productCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            transaction_id: 1,
            type: 1,
            from_store_id: "$source_addressDetail._id",
            from_store_slug: "$source_addressDetail.slug",
            to_store_id: "$destination_addressDetail._id",
            to_store_slug: "$destination_addressDetail.slug",
            user_fname: "$user_detail.fname",
            user_lname: "$user_detail.lname",
            products: 1,
            updatedAt: 1,
            total_items_transffered: "$productCount",
          },
        },
        {
          $sort: { createdAt: sort },
        },
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { $addFields: { page: Number(page) } },
              {
                $addFields: { totalPages: { $sum: [Number(page), Number(1)] } },
              },
              { $addFields: { hasPrevPage: false } },
              { $addFields: { prevPage: null } },
              { $addFields: { hasNextPage: false } },
              { $addFields: { nextPage: null } },
            ],
            data: [],
          },
        },
      ])
        .then((inventory_histories) => {
          if (!inventory_histories) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.status.statusTrue,
              userStatus: req.status,
              message: constants.message.success,
              data: inventory_histories,
            });
          }
        })
        .catch((err: any) => {
          res.status(err.statusCode).json({
            statusCode: constants.status.statusFalse,
            userStatus: req.status,
            message: err.message,
          });
        });
    }
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      statusCode: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

const downloadStockHistoryExcel = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    InventoryHistory.aggregate([
      {
        $match: {
          type: constants.historyType.StockTransfer,
          isDeleted: false,
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "addresses",
          localField: "sourceLocation",
          foreignField: "_id",
          as: "source_addressDetail",
        },
      },
      { $unwind: "$source_addressDetail" },
      {
        $lookup: {
          from: "addresses",
          localField: "destinationLocation",
          foreignField: "_id",
          as: "destination_addressDetail",
        },
      },
      { $unwind: "$destination_addressDetail" },
      {
        $lookup: {
          from: "products",
          localField: "product.product_id",
          foreignField: "_id",
          as: "product_detail",
        },
      },
      { $unwind: "$product_detail" },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "user_detail",
        },
      },
      { $unwind: "$user_detail" },
      {
        $project: {
          // "source_addressDetail._id": 1,
          // "destination_addressDetail._id": 1,
          "source_addressDetail.slug": 1,
          "destination_addressDetail.slug": 1,
          createdAt: 1,
          transaction_id: 1,
          "product.product_id": 1,
          "product.msl": 1,
          "product.quantity.changed": 1,
          "product_detail.name": 1,
          "product_detail.sku": 1,
          "user_detail.fname": 1,
          "user_detail.lname": 1,
          "user_detail._id": 1,
        },
      },
    ])
      .then(async (stock_list) => {
        if (!stock_list) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        } else {
          let workbook = new excelJs.Workbook();

          const sheet = workbook.addWorksheet("Sheet1");
          sheet.columns = [
            {
              header: "Document_Number",
              key: "Document_Number",
              width: "25",
              headerStyle: {
                font: { bold: true },
                color: "red",
              },
            },
            {
              header: "From_Store",
              key: "From_Store",
              width: "50",
              headerStyle: {
                font: { bold: true },
              },
            },
            {
              header: "To_Store",
              key: "To_Store",
              width: "50",
              headerStyle: {
                font: { bold: true },
              },
            },
            {
              header: "Product_Name",
              key: "Product_Name",
              width: "40",
              headerStyle: {
                font: { bold: true },
              },
            },
            {
              header: "Transffered_Quantity",
              key: "Transffered_Quantity",
              width: "25",
              headerStyle: {
                font: { bold: true },
              },
            },
            {
              header: "Transffered_On",
              key: "Transffered_On",
              width: "25",
              headerStyle: {
                font: { bold: true },
              },
            },
            {
              header: "Transffered_By",
              key: "Transffered_By",
              width: "25",
              headerStyle: {
                font: { bold: true },
              },
            },
          ];

          sheet.getRow(1).eachCell((cell: any) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
          });
          await Promise.all(
            stock_list.map((data, index) => {
              sheet.addRow({
                Document_Number: data.transaction_id,
                From_Store: data.source_addressDetail.slug,
                To_Store: data.destination_addressDetail.slug,
                Product_Name: data.product_detail.name,
                Transffered_Quantity: data.product.quantity.changed,
                Transffered_On: data.createdAt,
                Transffered_By:
                  data.user_detail.fname + " " + data.user_detail.lname,
              });
            })
          );

          const buffer = await workbook.xlsx.writeBuffer();
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            'attachment;filename="Stock Transfer Details.xlsx"'
          );
          if (buffer) {
            res.status(200).send(buffer);
          }
        }
      })
      .catch((err) => {
        res.status(req.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: err.message,
        });
      });
  } catch (error) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      error: error,
    });
  }
};

const stockTransferDetail = async (req: any, res: Response) => {
  try {
    InventoryHistory.aggregate([
      {
        $match: {
          isDeleted: false,
          type: constants.historyType.StockTransfer,
          _id: new mongoose.Types.ObjectId(req.params.transffer_id),
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "sourceLocation",
          foreignField: "_id",
          as: "source_addressDetail",
        },
      },
      { $unwind: "$source_addressDetail" },
      {
        $lookup: {
          from: "addresses",
          localField: "destinationLocation",
          foreignField: "_id",
          as: "destination_addressDetail",
        },
      },
      {
        $unwind: {
          path: "$destination_addressDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "user_detail",
        },
      },
      { $unwind: "$user_detail" },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "products",
          localField: "product.product_id",
          foreignField: "_id",
          as: "product_detail",
        },
      },
      { $unwind: "$product_detail" },
      {
        $lookup: {
          from: "uoms",
          localField: "product_detail.weight.unit",
          foreignField: "_id",
          as: "uomDetail",
        },
      },
      {
        $unwind: {
          path: "$uomDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          transaction_id: { $first: "$transaction_id" },
          type: { $first: "$type" },
          source_addressDetail: { $first: "$source_addressDetail" },
          destination_addressDetail: { $first: "$destination_addressDetail" },
          user_detail: { $first: "$user_detail" },
          uom_detail: { $first: "$uomDetail" },
          products: {
            $push: {
              product_detail: "$product_detail",
              quantity: "$product.quantity",
              msl: "$product.msl",
              price: "$product.price",
              currency: "$product.currency",
            },
          },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          productCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          products: {
            $map: {
              input: "$products",
              as: "productDescription",
              in: {
                _id: "$$productDescription.product_detail._id",
                name: "$$productDescription.product_detail.name",
                sku: "$$productDescription.product_detail.sku",
                from_store_id: "$source_addressDetail._id",
                from_store_slug: "$source_addressDetail.slug",
                to_store_id: "$destination_addressDetail._id",
                to_store_slug: "$destination_addressDetail.slug",
                unitPrice: "$$productDescription.product_detail.unitPrice",
                uom: "$uom_detail.slug",
                transfferedItems: "$$productDescription.quantity.changed",
              },
            },
          },
          userFname: "$user_detail.fname",
          userLname: "$user_detail.lname",
          createdAt: 1,
        },
      },
    ])
      .then((inventory_histories) => {
        if (!inventory_histories) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        } else {
          res.status(constants.code.success).json({
            statusCode: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.success,
            data: inventory_histories,
          });
        }
      })
      .catch((err: any) => {
        res.status(err.statusCode).json({
          statusCode: constants.status.statusFalse,
          userStatus: req.status,
          message: err.message,
        });
      });
  } catch (error) {
    res.status(constants.code.internalServerError).json({
      statusCode: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

export default {
  selectStock,
  // stockTransfer,
  stockHistory,
  downloadStockHistoryExcel,
  stockTransferDetail,
};

// const downloadStockHistoryExcel = async (req: any, res: Response, next: NextFunction) => {
//     try {
//         InventoryHistory.aggregate([{
//             $match: {
//                 type: constants.historyType.StockTransfer,
//                 isDeleted: false
//             },
//         },
//         { $unwind: "$product" },
//         {
//             $lookup: {
//                 from: "addresses",
//                 localField: "sourceLocation",
//                 foreignField: "_id",
//                 as: "source_addressDetail"
//             }
//         },
//         { $unwind: "$source_addressDetail" },
//         {
//             $lookup: {
//                 from: "addresses",
//                 localField: "destinationLocation",
//                 foreignField: "_id",
//                 as: "destination_addressDetail"
//             }
//         },
//         { $unwind: "$destination_addressDetail" },
//         {
//             $lookup: {
//                 from: "products",
//                 localField: "product.product_id",
//                 foreignField: "_id",
//                 as: "product_detail"
//             }
//         },
//         { $unwind: "$product_detail" },
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "createdBy",
//                 foreignField: "_id",
//                 as: "user_detail"
//             }
//         },
//         { $unwind: "$user_detail" },
//         {
//             $project: {
//                 "source_addressDetail.slug": 1,
//                 "destination_addressDetail.slug": 1,
//                 "createdAt": 1,
//                 "transaction_id": 1,
//                 "product.product_id": 1,
//                 "product.msl": 1,
//                 "product.quantity.changed": 1,
//                 "product_detail.name": 1,
//                 "product_detail.sku": 1,
//                 "user_detail.fname": 1,
//                 "user_detail.lname": 1,
//                 "user_detail._id": 1
//             }
//         },

//         ]).then(async (stock_list) => {
//             if (!stock_list) {
//                 throw {
//                     statusCode: constants.code.dataNotFound,
//                     message: constants.message.dataNotFound
//                 }
//             }
//             else {
//                 let workbook = new excelJs.Workbook();

//                 const sheet = workbook.addWorksheet('Sheet1');
//                 sheet.columns = [
//                     { header: "DOCUMENT_NUMBER", key: "Document_Number", width: 25 },
//                     { header: "FROM_STORE", key: "From_Store", width: 50 },
//                     { header: "TO_STORE", key: "To_Store", width: 50 },
//                     { header: "PRODUCT_NAME", key: "Product_Name", width: 40 },
//                     { header: "TRANSFERRED_QUANTITY", key: "Transffered_Quantity", width: 25 },
//                     { header: "TRANSFERRED_ON", key: "Transffered_On", width: 25 },
//                     { header: "TRANSFERRED_BY", key: "Transffered_By", width: 25 },
//                 ];

//                 // Apply styles to header row
//                 sheet.getRow(1).eachCell((cell: any) => {
//                     cell.font = { bold: true };
//                     cell.alignment = { horizontal: 'center' };
//                 });

//                 await Promise.all(stock_list.map((data, index) => {
//                     sheet.addRow({
//                         Document_Number: data.transaction_id,
//                         From_Store: data.source_addressDetail.slug,
//                         To_Store: data.destination_addressDetail.slug,
//                         Product_Name: data.product_detail.name,
//                         Transffered_Quantity: data.product.quantity.changed,
//                         Transffered_On: data.createdAt,
//                         Transffered_By: data.user_detail.fname + ' ' + data.user_detail.lname
//                     });
//                 }));

//                 const buffer = await workbook.xlsx.writeBuffer();
//                 res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//                 res.setHeader('Content-Disposition', 'attachment;filename="Stock Transfer Details.xlsx"');
//                 if (buffer) {
//                     res.status(200).send(buffer);
//                 }
//             }
//         }).catch((err) => {
//             res.status(req.statusCode).json({
//                 status: constants.status.statusFalse,
//                 userStatus: req.status,
//                 message: err.message,
//             });

//         });
//     } catch (error) {
//         res.status(constants.code.internalServerError).json({
//             status: constants.status.statusFalse,
//             userStatus: req.status,
//             error: error
//         });
//     }
// };
