import { NextFunction, Response } from "express";
import constants from "../../utils/constants";
import Company from "../../models/company";
import mongoose from "mongoose";
import Inventory from "../../models/inventory";
import Address from "../../models/address";
import Message from "../../models/message";
import message from "../common/commmonConstants";
import Product from "../../models/product"
import Messages from "../../models/message";
import Order from "../../models/order";

function companyMatchCondition(requestType: string) {
  if (requestType.toLowerCase() === constants.companyType.supplier.toLowerCase()) {
    return {
      $in: [
        constants.companyType.supplier,
        constants.companyType.both],
    };
  } else if (requestType.toLowerCase() === constants.companyType.buyer.toLowerCase()) {
    return {
      $in: [
        constants.companyType.buyer,
        constants.companyType.both]
    };
  } else if((requestType.toLowerCase() === constants.companyType.both.toLowerCase())) {
    return {
      $in: [
        constants.companyType.supplier,
        constants.companyType.buyer,
        constants.companyType.both,
      ],
    };
  }
  else
  {
    return "request type no match"
  }
}

const companyList = async (req: any, res: Response, next: NextFunction) => {
  try {
    await Company.aggregate([
      {
        $match: { buyerAndSupplier: await companyMatchCondition(req.body.requestType) },
      },
      {
        $lookup: {
          from: "addresses",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$type", constants.addressTypes.work] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                address: 1,
                _id: 0,
                companyId: 1,
                email: 1,
              },
            },
          ],
          as: "companyDetail",
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "companyDetail.address.city",
          foreignField: "_id",
          as: "cityDetail",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "companyDetail.address.country",
          foreignField: "_id",
          as: "countryDetail",
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "companyDetail.address.state",
          foreignField: "_id",
          as: "stateDetail",
        },
      },
      { $unwind: "$stateDetail" },
      { $unwind: "$countryDetail" },
      { $unwind: "$cityDetail" },
      {
        $project: {
          _id: 1,
          name: 1,
          buyerAndSupplier: 1,
          countryId: "$countryDetail._id",
          countryName: "$countryDetail.name",
          cityName: "$cityDetail.name",
          cityId: "$cityDetail.id",
          stateName: "$stateDetail.name",
          stateId: "$stateDetail._id",
          createdAt: 1,
        },
      },
    ])
      .then((companyList) => {
        if (!companyList) {
          throw {
            status: false,
            message: "some error occured while fetching company list",
          };
        }
        res.status(constants.code.success).json({
          status: constants.status.statusTrue,
          userStatus: req.status,
          data: companyList,
        });
      })
      .catch((err) => {
        res.status(constants.code.badRequest).json({
          status: false,
          userStatus: req.statusCode,
          message: err,
        });
      });
  } catch (error) {
    res.status(constants.code.badRequest).json({
      status: false,
      userStatus: req.statusCode,
      message: error,
    });
  }
};

const companySearch = async (req: any, res: Response, next: NextFunction) => {
  try {
    const regex = new RegExp("^" + req.body.search + ".*", "i");
    await Company.aggregate([
      {
        $match: {
          $and: [
            { name: regex },
            { buyerAndSupplier: await companyMatchCondition(req.body.requestType) },
          ]
        }
      }
    ])
      .then((productList) => {
        if (!productList) {
          throw {
            status: false,
            message: "some error occured while fetching company list",
          };
        }
        res.status(constants.code.success).json({
          status: constants.status.statusTrue,
          userStatus: req.status,
          data: productList,
        });
      })
      .catch((err) => {
        res.status(constants.code.badRequest).json({
          status: false,
          userStatus: req.statusCode,
          message: err,
        });
      });
  } catch (error) {
    res.status(constants.code.badRequest).json({
      status: false,
      userStatus: req.statusCode,
      message: error,
    });
  }
};

export const createStockAlert = async (productId: any, quantity: Number) => {
  try {
    const companyDetail: any = await Company.findOne({
      isCompanyErp: true,
      isDeleted: false,
    });

    const addressDetail: any = await Address.findOne({
      companyId: companyDetail._id,
      type: constants.addressTypes.work,
      constraint: constants.constraint.primary,
    });
    Product.findOne(
      { productId: new mongoose.Types.ObjectId(productId), isDeleted: false },
      { weight: 1, sku: 1 }
    )
      .then(async (productDetail) => {
        if (productDetail) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.productNotFound,
          };
        } else {
          let refillQuantity: any = 0;
          await Inventory.findOne({
            productId: new mongoose.Types.ObjectId(productId),
            locationId: addressDetail._id,
            isDeleted: false,
          })
            .then(async (inventoryData: any) => {
              if (!inventoryData) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  message: message.inventoryNotExist,
                };
              } else {
                if (inventoryData.totalWeight.totalActualQuantity < quantity) {
                  refillQuantity = Number(quantity) - Number(inventoryData.totalWeight.totalActualQuantity)
                  Messages.findOne({
                    productId: productId,
                    isDeleted: false,
                  })
                    .then((alertExists: any) => {
                      if (alertExists) {
                        refillQuantity = Number(
                          alertExists.refillQuantity + refillQuantity
                        );
                      }
                       Messages.findOneAndUpdate(
                        {
                          productId: productId,
                          isDeleted: false,
                        },
                        {
                          quantity: Number(refillQuantity),
                        },
                        { new: true }
                      )
                        .then((data: any) => {
                          if (!data) {
                            throw {
                              statusCode: constants.code.dataNotFound,
                              status: constants.status.statusFalse,
                              message: message.alertFailed,
                            };
                          } else {
                            return {
                              statusCode: constants.code.success,
                              status: constants.status.statusTrue,
                              message: message.alertSuccess,
                            };
                          }
                        })
                        .catch((err: any) => {
                          return {
                            statusCode: constants.code.dataNotFound,
                            status: constants.status.statusTrue,
                            message: constants.message.failed,
                          };
                        });
                    })
                    .catch((err: any) => {
                      return {
                        statusCode: constants.code.dataNotFound,
                        status: constants.status.statusFalse,
                        message: message.alertFailed,
                      };
                    });
                }
              }
            })
        }
      })
  }
  catch (error) {
    return ({
      statusCode: constants.code.internalServerError,
      status: constants.status.statusFalse,
      message: error
    })


  }
}


const productList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const regex = new RegExp("^" + req.body.search + ".*", "i");
    await Product.aggregate([
      { $match: { name: regex } },
      { $project: { _id: 1, name: 1 } },
    ])
      .then((productList) => {
        if (!productList) {
          throw {
            status: false,
            message: "some error occured while fetching product list",
          };
        }
        res.status(constants.code.success).json({
          status: constants.status.statusTrue,
          userStatus: req.status,
          data: productList,
        });
      })
      .catch((err) => {
        res.status(constants.code.badRequest).json({
          status: false,
          userStatus: req.statusCode,
          message: err,
        });
      });
  } catch (error) {
    res.status(constants.code.badRequest).json({
      status: false,
      userStatus: req.statusCode,
      message: error,
    });
  }
};

const selectedProductDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    Product.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.body.productId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "uoms",
          let: { unitId: "$weight.unit" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$unitId"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                uom_type: 1,
                _id: 0,
              },
            },
          ],
          as: "uomDetail",
        },
      },
      { $unwind: "$uomDetail" },
      {
        $project: {
          productId: "$_id",
          name: 1,
          description: 1,
          productCode: 1,
          Type: 1,
          gst: 1,
          sku: 1,
          GST: 1,
          sellingPrice: "$price.sellingPrice",
          costPrice: "$price.costPrice",
          unitPrice: "$price.unitPrice",
          packSize: "$weight.value",
          quantityInPack: "$weight.quantityInPack",
          unit: "$weight.unit",
          uom: "$uomDetail.uom_type",
          _id: 0,
        },
      },
    ])
      .then((data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        }
        res.status(constants.code.success).json({
          status: constants.status.statusTrue,
          userStatus: req.status,
          data: data,
        });
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

const companyOtherAddressesList = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    Company.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new mongoose.Types.ObjectId(req.body.companyId),
        },
      },
      {
        $project: {
          companyId: "$_id",
          email: 1,
          phone: 1,
          _id: 0,
        },
      },
      {
        $lookup: {
          from: "addresses",
          let: { companyId: "$companyId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$companyId", "$$companyId"] },
                    { $eq: ["$isDeleted", false] },
                    { $eq: ["$type", constants.addressTypes.warehouse] },
                  ],
                },
              },
            },
            {
              $project: {
                address: 1,
                _id: 1,
              },
            },
          ],
          as: "companyDetail",
        },
      },
      { $unwind: "$companyDetail" },
      {
        $lookup: {
          from: "cities",
          localField: "companyDetail.address.city",
          foreignField: "_id",
          as: "cityDetail",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "companyDetail.address.country",
          foreignField: "_id",
          as: "countryDetail",
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "companyDetail.address.state",
          foreignField: "_id",
          as: "stateDetail",
        },
      },
      { $unwind: "$stateDetail" },
      { $unwind: "$countryDetail" },
      { $unwind: "$cityDetail" },
      {
        $project: {
          addressId: "$companyDetail._id",
          _id: 1,
          name: 1,
          buyerAndSupplier: 1,
          createdAt: 1,
          countryName: "$countryDetail.name",
          cityName: "$cityDetail.name",
          stateName: "$stateDetail.name",
          phone: "$companyDetail.phone",
          email: "$companyDetail.email",
          "address.countryId": "$countryDetail._id",
          "address.cityId": "$cityDetail._id",
          "address.stateId": "$stateDetail._id",
          "address.line_one": "$companyDetail.address.line_one",
          "address.line_two": "$companyDetail.address.line_two",
          "address.pin_code": "$companyDetail.address.pin_code",
        },
      },
    ])
      .then((data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        }
        res.status(constants.code.success).json({
          status: constants.status.statusTrue,
          userStatus: req.status,
          data: data,
        });
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



const orderList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    let matchCondition = {
      isDeleted: false,
      orderType: (req.body.requestType),
    };

  
    if (Number(req.query.limit) !== 0) {
      Order.aggregate([
        { $match: matchCondition },
      
        {
          $lookup: {
            from: "addresses",
            localField: "supplierAddress",
            foreignField: "_id",
            as: "supplierAddress",
          },
        },
        {
          $unwind: {
            path: "$supplierAddress",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "supplierAddress.companyId",
            foreignField: "_id",
            as: "company",
          },
        },
        {
          $unwind: {
            path: "$company",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id", 
            localField: "createdBy",
            as: "user_detail",
          },
        },
        {
          $unwind: {
            path: "$user_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
           "primaryDocumentDetails.documentNumber": 1,
            orderDate: 1,
            companyName: "$company.name",
            grandTotal: 1,
            orderType: 1,
            status: 1,
            createdAt: { $toLong: "$createdAt" },
            userName: { $concat: [ "$user_detail.first_name", " ", "$user_detail.last_name" ] },
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
                $addFields: {
                  totalPages: {
                    $ceil: { $divide: ["$total", limit] },
                  },
                },
              },
              {
                $addFields: {
                  hasPrevPage: {
                    $cond: {
                      if: {
                        $lt: [{ $subtract: [page, Number(1)] }, Number(0)],
                      },
                      then: false,
                      else: true,
                    },
                  },
                },
              },
              {
                $addFields: {
                  prevPage: {
                    $cond: {
                      if: {
                        $lt: [{ $subtract: [page, Number(1)] }, Number(0)],
                      },
                      then: null,
                      else: { $subtract: [page, Number(1)] },
                    },
                  },
                },
              },
              {
                $addFields: {
                  hasNextPage: {
                    $cond: {
                      if: {
                        $gt: [
                          {
                            $subtract: [
                              {
                                $ceil: { $divide: ["$total", limit] },
                              },
                              Number(1),
                            ],
                          },
                          "$page",
                        ],
                      },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
              { $addFields: { nextPage: { $sum: [page, Number(1)] } } },
            ],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ])
        .then((orderList) => {
          if (!orderList) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.status.statusTrue,
              userStatus: req.status,
              data: orderList,
            });
          }
        })
        .catch((err) => {
          console.log("err", err);
          
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.msg,
          });
        });
    } else {
      Order.aggregate([
        { $match: matchCondition },
        {
          $lookup: {
            from: "addresses",
            localField: "supplierAddress",
            foreignField: "_id",
            as: "supplierAddress",
          },
        },
        {
          $unwind: {
            path: "$supplierAddress",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "supplierAddress.companyId",
            foreignField: "_id",
            as: "company",
          },
        },
        {
          $unwind: {
            path: "$company",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id", 
            localField: "createdBy",
            as: "user_detail",
          },
        },
        {
          $unwind: {
            path: "$user_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
           "primaryDocumentDetails.documentNumber": 1,
            orderDate: 1,
            companyName: "$company.name",
            grandTotal: 1,
            orderType: 1,
            status: 1,
            createdAt: { $toLong: "$createdAt" },
            userName: { $concat: [ "$user_detail.first_name", " ", "$user_detail.last_name" ] },
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
                $addFields: {
                  totalPages: {
                    $ceil: { $divide: ["$total", limit] },
                  },
                },
              },
              {
                $addFields: {
                  hasPrevPage: {
                    $cond: {
                      if: {
                        $lt: [{ $subtract: [page, Number(1)] }, Number(0)],
                      },
                      then: false,
                      else: true,
                    },
                  },
                },
              },
              {
                $addFields: {
                  prevPage: {
                    $cond: {
                      if: {
                        $lt: [{ $subtract: [page, Number(1)] }, Number(0)],
                      },
                      then: null,
                      else: { $subtract: [page, Number(1)] },
                    },
                  },
                },
              },
              {
                $addFields: {
                  hasNextPage: {
                    $cond: {
                      if: {
                        $gt: [
                          {
                            $subtract: [
                              {
                                $ceil: { $divide: ["$total", limit] },
                              },
                              Number(1),
                            ],
                          },
                          "$page",
                        ],
                      },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
              { $addFields: { nextPage: { $sum: [page, Number(1)] } } },
            ],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ])
        .then((orderList) => {
          if (!orderList) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.status.statusTrue,
              userStatus: req.status,
              data: orderList,
            });
          }
        })
        .catch((err) => {         
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.msg,
          });
        });
    }
  } catch (error) { 
    res.status(constants.code.badRequest).json({
      status: false,
      userStatus: req.statusCode,
      message: error,
    });
  }
};


export default {
  companyList,
  productList,
  selectedProductDetails,
  companyOtherAddressesList,
  createStockAlert,
  companySearch,
  orderList
};
