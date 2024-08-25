import { Request, Response, NextFunction } from "express";
import constants from "../../utils/constants";
import message from "./inventoryConstant";
import User from "../../models/user";
import mongoose from "mongoose";
import Product from "../../models/product";
import Address from "../../models/address";
import Inventory from "../../models/inventory";
import Company from "../../models/company";
import InventoryHistory from "../../models/inventoryHistory";
import {
  generateDocumentNumber,

} from "../../helpers/helper";
import sendMail from "../../helpers/mail";
import { createProducts } from "./inventoryHelper";

const inventoryList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    const companyData: any = await Company.findOne({
      isCompanyErp: true,
      isDeleted: false,
    });
    let createdBy = companyData._id;

    if (Number(req.query.limit) !== 0) {
      Product.aggregate([
        {
          $match: {
            soldBy: new mongoose.Types.ObjectId(createdBy),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "inventories",
            foreignField: "productId",
            localField: "_id",
            as: "inventory_detail",
          },
        },
        {
          $unwind: {
            path: "$inventory_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup:{
            from: "uoms",
            localField:"weight.unit",
            foreignField:"_id",
            as:"uom_detail"
          }
        },
        {
          $unwind: {
            path: "$uom_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            quantity: {
              $sum: "$inventory_detail.totalWeight.totalActualQuantity",
            },
            sold: { $sum: "$inventory_detail.sold" },
            createdAt: { $first: { $toLong: "$createdAt" } },
            productName: { $first: "$name" },
            uom:{$first:"$uom_detail.slug"},
            sku: { $first: "$sku" },
            msl: { $first: { $ifNull: ["$inventory_detail.msl", 0] } },
          },
        },
        {
          $match: {
            $or: [
              {
                productName: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                productNumber: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
            ],
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
        .then((data) => {
          if (!data[0].data.length) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.productListSuccess,
              metadata: data[0].metadata,
              data: data[0].data,
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
    } else {
      Product.aggregate([
        {
          $match: {
            soldBy: new mongoose.Types.ObjectId(createdBy),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "inventories",
            foreignField: "productId",
            localField: "_id",
            as: "inventory_detail",
          },
        },
        {
          $unwind: {
            path: "$inventory_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup:{
            from: "uoms",
            localField:"weight.unit",
            foreignField:"_id",
            as:"uom_detail"
          }
        },
       { 
        $match:{
        isDeleted:false
       }
      },
        {
          $unwind: {
            path: "$uom_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            quantity: {
              $sum: "$inventory_detail.totalWeight.totalActualQuantity",
            },
            sold: { $sum: "$inventory_detail.sold" },
            createdAt: { $first: { $toLong: "$createdAt" } },
            productName: { $first: "$name" },
            uom:{$first:"$uom_detail.slug"},
            sku: { $first: "$sku" },
            msl: { $first: { $ifNull: ["$inventory_detail.msl.value", 0] } },
          },
        },
        {
          $match: {
            $or: [
              {
                productName: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                productNumber: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
            ],
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
        .then((data) => {
          if (!data[0].data.length) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: constants.message.success,
              metadata: data[0].metadata,
              data: data[0].data,
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
  } catch (err) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

  const detail = async (req: any, res: Response, next: NextFunction) => {
    try {
      const companyData: any = await Company.findOne({
        isCompanyErp: true,
        isDeleted: false,
      });
      let createdBy = companyData._id;

      Product.findOne({
        _id: new mongoose.Types.ObjectId(req.params.product_id),
        //status: true,
        soldBy: new mongoose.Types.ObjectId(createdBy),
        isDeleted: false,
      })
        .then(async (data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            Product.aggregate([
              {
                $match: {
                  _id: new mongoose.Types.ObjectId(req.params.product_id),
                  soldBy: new mongoose.Types.ObjectId(createdBy),
                  isDeleted: false,
                  //status:true
                },
              },
              {
                $lookup: {
                  from: "comments",
                  let: { productID: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$productId", "$$productID"] },
                        isDeleted: false,
                      },
                    },
                    {
                      $unwind: "$comments",
                    },
                    {
                      $lookup: {
                        from: "users",
                        let: { userID: "$comments.createdBy" },
                        pipeline: [
                          {
                            $match: {
                              $expr: { $eq: ["$_id", "$$userID"] },
                            },
                          },
                          {
                            $project: { _id: 1, fname: 1, lname: 1 },
                          },
                        ],
                        as: "commentUser",
                      },
                    },
                    {
                      $unwind: {
                        path: "$commentUser",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                    {
                      $group: {
                        _id: "$_id",
                        comments: {
                          $push: {
                            _id: "$comments._id",
                            comment: "$comments.comment",
                            fname: "$commentUser.fname",
                            lname: "$commentUser.lname",
                            createdAt: "$comments.createdAt",
                            isDeleted: "$comments.isDeleted",
                          },
                        },
                      },
                    },
                  ],
                  as: "commentsDetail",
                },
              },
              {
                $unwind: {
                  path: "$commentsDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "brands",
                  let: { brandID: "$brandId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$brandID"] },
                        isDeleted: false,
                      },
                    },
                  ],
                  as: "brandDetail",
                },
              },
              {
                $unwind: {
                  path: "$brandDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "categories",
                  let: { categoryID: "$categoryId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$categoryID"] },
                        isDeleted: false,
                      },
                    },
                  ],
                  as: "categoryDetail",
                },
              },
              {
                $unwind: {
                  path: "$categoryDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "subcategories",
                  let: { subcategoryID: "$subCategoryId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$subcategoryID"] },
                        isDeleted: false,
                      },
                    },
                  ],
                  as: "subcategoryDetail",
                },
              },
              {
                $unwind: {
                  path: "$subcategoryDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "subchildcategories",
                  let: { subchildcategoryID: "$subChildCategoryId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$subchildcategoryID"],
                        },
                        isDeleted: false,
                      },
                    },
                  ],
                  as: "subchildcategoryDetail",
                },
              },
              {
                $unwind: {
                  path: "$subchildcategoryDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "colors",
                  let: { colorID: "$colorId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$colorID"],
                        },
                        isDeleted: false,
                      },
                    },
                  ],
                  as: "colorDetail",
                },
              },
              {
                $unwind: {
                  path: "$colorDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "painttypes",

                  let: { paintTypeID: "$paintType" },

                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$paintTypeID"] },
                        isDeleted: false,
                      },
                    },
                  ],

                  as: "paintTypeDetail",
                },
              },

              {
                $unwind: {
                  path: "$paintTypeDetail",

                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $lookup: {
                  from: "finishtypes",

                  let: { finishTypeID: "$finish" },

                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$finishTypeID"] },
                        isDeleted: false,
                      },
                    },
                  ],

                  as: "finishTypeDetail",
                },
              },

              {
                $unwind: {
                  path: "$finishTypeDetail",

                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "uoms",

                  let: { uomID: "$weight.unit" },

                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$uomID"] },
                        isDeleted: false,
                      },
                    },
                  ],

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
                $lookup: {
                  from: "products",
                  localField: "base_paint_one.productId",
                  foreignField: "_id",
                  as: "basePaintOneDetail",
                },
              },
              {
                $unwind: {
                  path: "$basePaintOneDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "uoms",

                  localField: "base_paint_one.weight.unit",

                  foreignField: "_id",

                  as: "uombasePaintOneDetail",
                },
              },
              {
                $unwind: {
                  path: "$uombasePaintOneDetail",

                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "base_paint_two.productId",
                  foreignField: "_id",
                  as: "basePaintTwoDetail",
                },
              },
              {
                $unwind: {
                  path: "$basePaintTwoDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "uoms",

                  localField: "base_paint_two.weight.unit",

                  foreignField: "_id",

                  as: "uombasePaintTwoDetail",
                },
              },
              {
                $unwind: {
                  path: "$uombasePaintTwoDetail",

                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "tinters.productId",
                  foreignField: "_id",
                  as: "tintersDetail",
                },
              },
              {
                $lookup: {
                  from: "uoms",
                  localField: "tinters.weight.unit",
                  foreignField: "_id",
                  as: "uomTintersDetail",
                },
              },
              {
                $lookup: {
                  from: "hsns",
                  foreignField: "_id",
                  localField: "HSN",
                  as: "hsn_detail",
                },
              },
              { $unwind: "$hsn_detail" },
              {
                $lookup: {
                  from: "inventories",
                  let: {
                    productId: "$_id",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$productId", "$$productId"] },
                            { $eq: ["$isDeleted", false] },
                          ],
                        },
                      },
                    },
                    {
                      $lookup: {
                        from: "addresses",
                        foreignField: "_id",
                        localField: "locationId",
                        as: "address_detail",
                      },
                    },
                  ],
                  as: "inventory_detail",
                },
              },
              {
                $project: {
                  _id: 0,
                  product_id: "$_id",
                  manufacturer: "$manufacturer",
                  basic_details: {
                    hsn: "$hsn_detail.hsn",
                    name: "$name",
                    Type: "$Type",
                    brand: "$brandDetail.name",
                    color: "$colorDetail.name",
                    sku: "$sku",
                    category: "$categoryDetail.name",
                    pack_size: { $toDouble: "$weight.value" },
                    HSN: "$HSN",
                    productStandard:"$productStandard",
                    productCode: "$productCode",
                    pack_quantity: { $toDouble: "$weight.quantityInPack" },
                    uomID: "$uomDetail._id",
                    uom: "$uomDetail.uom_type",
                  },
                  other_details: {
                    paintTypeID: "$paintTypeDetail._id",
                    paintType: "$paintTypeDetail.paint_type",
                    finishTypeID: "$finishTypeDetail._id",
                    finishType: "$finishTypeDetail.finish_type",
                    subcategory: "$subcategoryDetail.name",
                    subchildategory: "$subchildcategoryDetail.name",
                    productType: "$Type",
                    description: "$description",
                  },
                  paint_formula: {
                    base_paint_one: {
                      name: "$basePaintOneDetail.name",
                      _id: "$basePaintOneDetail._id",
                      pack_size: {
                        uomId: "$uombasePaintOneDetail._id",
                        uomType: "$uombasePaintOneDetail.uom_type",
                        value: "$base_paint_one.weight.value",
                      },
                    },
                    base_paint_two: {
                      name: "$basePaintTwoDetail.name",
                      _id: "$basePaintTwoDetail._id",
                      pack_size: {
                        uomId: "$uombasePaintTwoDetail._id",
                        uomType: "$uombasePaintTwoDetail.uom_type",
                        value: "$base_paint_two.weight.value",
                      },
                    },
                    tinters: {
                      $map: {
                        input: "$tinters",
                        as: "tinter",
                        in: {
                          _id: "$$tinter._id",
                          name: { $arrayElemAt: ["$tintersDetail.name", 0] },
                          pack_size: {
                            uom_type: {
                              $arrayElemAt: ["$uomTintersDetail.uom_type", 0],
                            },
                            uomId: { $arrayElemAt: ["$uomTintersDetail._id", 0] },
                            weight: "$$tinter.weight.value",
                          },
                          productId: "$$tinter.productId",
                        },
                      },
                    },
                  },
                  price_details: {
                    mrp: "$mrp",
                    sellingPrice: "$price.sellingPrice",
                    costPrice: "$price.costPrice",
                    unitPrice: "$price.unitPrice",
                    sold: "$sold",
                    currency: "$currency",
                  },
                  commentsDetail: "$commentsDetail.comments",
                  QuantityToProduce: 1,
                  inventory_detail: {
                    $map: {
                      input: "$inventory_detail",
                      as: "inventory",
                      in: {
                        inventoryId: "$$inventory._id",
                        inventory_name: {
                          $arrayElemAt: ["$$inventory.address_detail.slug", 0],
                        },
                        inventory_constraint: {
                          $arrayElemAt: ["$$inventory.address_detail.constraint", 0],
                        },
                        address_id: {
                          $arrayElemAt: ["$$inventory.address_detail._id", 0],
                        },
                        product_id: "$$inventory.productId",
                        msl: "$$inventory.msl",
                        quantity: "$$inventory.totalWeight.totalActualQuantity",
                        uom: "$uomDetail.uom_type",
                      },
                    },
                  },
                  uomId: "$weight.unit",
                  uom_type: "$uomDetail.uom_type",
                },
              },
            ])
              .then((productData) => {
                if (!productData.length) {
                  throw {
                    statusCode: constants.code.dataNotFound,
                    message: message.noProductFound,
                  };
                } else {
                  res.status(constants.code.success).json({
                    status: constants.status.statusTrue,
                    userStatus: req.status,
                    data: productData[0],
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
          }
        })
        .catch((err) => {
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.msg,
          });
        });
    } catch (err) {
      res.status(constants.code.internalServerError).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err,
      });
    }
  };


const manageInventory = async (req: any, res: Response, next: NextFunction) => {
  try {
    const companyData = await Company.findOne({
      isCompanyErp: true,
      isDeleted: false,
    });
    
    if (!companyData) {
      return res.status(constants.code.dataNotFound).json({
        status: constants.status.statusFalse,
        message: message.companyNotFound,
      });
    }
    const createdBy = companyData._id;
    const productId = new mongoose.Types.ObjectId(req.body.product_id);
    const locationId = new mongoose.Types.ObjectId(req.body.location_id);

    const productDetail: any = await Product.findOne({
      _id: productId,
      soldBy: createdBy,
      isDeleted: false,
    });
    
    if (!productDetail) {
      return res.status(constants.code.dataNotFound).json({
        status: constants.status.statusFalse,
        message: constants.message.dataNotFound,
      });
    }

    const addressDetail: any = await Address.findOne({
      _id: locationId,
      companyId: createdBy,
      isDeleted: false,
    });
    
    if (!addressDetail) {
      return res.status(constants.code.dataNotFound).json({
        status: constants.status.statusFalse,
        message: constants.message.addressNotLinked,
      });
    }

    let existingBatchData: any = await Inventory.findOne({
      company_Id: createdBy,
      productId: productId,
      locationId: locationId,
      batch: { $elemMatch: { batchNumber: req.body?.batchNumber } },
      isDeleted: false,
    });

    let oldInventoryData: any = await Inventory.findOne({
      company_Id: createdBy,
      productId: productId,
      locationId: locationId,
      // batch: { $elemMatch: { batchNumber: req.body.batchNumber } },
      isDeleted: false,
    });

    let updateQuery: any = {};
    let updateOptions: any = { new: true, upsert: true };
    let selfproductbatchNumber:any=null;    
    //remove products  from inventory while creating product in self warehouse
      if (
      productDetail.manufacturer == constants.manufactureType.self &&
      req.body.operationType == constants.operationType.add
    ) {
      const createdSelfProduct: any = await createProducts(
        productDetail,
        Number(req.body.numberOfunits),
        locationId
      );

      if (!createdSelfProduct.status) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: createdSelfProduct.message,
        };
      }
      else{
        selfproductbatchNumber=createdSelfProduct?.outputBatchNumber;
      }
    }

    if (!oldInventoryData && !existingBatchData) {
      if (req.body.operationType == constants.operationType.remove) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.insufficientQuantity,
        };
      } else {
        updateQuery = {
          $push: {
            batch: {
              batchNumber:selfproductbatchNumber?selfproductbatchNumber: req.body.batchNumber,
              reservedUnit:{
                batchNumber:selfproductbatchNumber?selfproductbatchNumber:null,
              },
              packSize: productDetail?.weight?.value,
              quantityInPack: Number(productDetail?.weight?.quantityInPack),
              numberOfunits: Number(req.body.numberOfunits),
              weight: {
                batchQuantity:
                  Number(req.body.numberOfunits) *
                  Number(productDetail?.weight.value),
                productQuantity:
                  Number(productDetail.weight.quantityInPack) *
                  Number(req.body.numberOfunits),
                unit: new mongoose.Types.ObjectId(req.body.uom),
              },
              updatedBy: new mongoose.Types.ObjectId(req.id),
              updatedAt: Date.now(),
            },
          },
          $set: {
            msl: Number(req.body.msl),
            totalWeight: {
              totalBatchQuantity:
                Number(req.body.numberOfunits) *
                Number(productDetail.weight.value),
              totalActualQuantity:
                Number(productDetail.weight.quantityInPack) *
                req.body.numberOfunits,
              totalPacks: Number(req.body.numberOfunits),
              unit: new mongoose.Types.ObjectId(req.body.uom),
            },
          },
        };
      }
    } else if (oldInventoryData && !existingBatchData) {
      if (req.body.operationType == constants.operationType.remove) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.insufficientQuantity,
        };
      } else if (req.body.operationType == constants.operationType.add) {
        updateQuery = {
          $push: {
            batch: {
              batchNumber:selfproductbatchNumber?selfproductbatchNumber: req.body.batchNumber,
              packSize: productDetail.weight.value,
              quantityInPack: Number(productDetail?.weight?.quantityInPack),
              numberOfunits: Number(req.body.numberOfunits),
              weight: {
                batchQuantity:
                  req.body.numberOfunits * Number(productDetail?.weight.value),
                productQuantity:
                  Number(productDetail.weight.quantityInPack) *
                  req.body.numberOfunits,
                unit: req.body.uom,
              },

              updatedBy: new mongoose.Types.ObjectId(req.id),
              updatedAt: Date.now(),
            },
          },
          msl: Number(req.body.msl),
          totalWeight: {
            totalBatchQuantity:
              Number(oldInventoryData?.totalWeight.totalBatchQuantity) +
              Number(req.body.numberOfunits) *
                Number(productDetail.weight.value),
            totalActualQuantity:
              Number(oldInventoryData?.totalWeight.totalActualQuantity) +
              Number(productDetail.weight.quantityInPack) *
                req.body.numberOfunits,
            totalPacks:
              Number(oldInventoryData.totalWeight.totalPacks) +
              Number(req.body.numberOfunits),
            unit: req.body.uom,
          },
        };
      }
    } else {
      //find index of the batch from which you are adding or removing product .
      const getBatchIndex = (element:any) => {
        return element.batchNumber === req.body.batchNumber;
      };

      const batchIndex:any = existingBatchData.batch.findIndex(getBatchIndex);
 
      //update products for provided batch in request body

      if (req.body.operationType == constants.operationType.add) {
        updateQuery = {
          $set: {
            msl: Number(req.body.msl),
            "batch.$[elem].numberOfunits":
              Number(existingBatchData?.batch[batchIndex]?.numberOfunits) +
              Number(req.body.numberOfunits),
            "batch.$[elem].weight.batchQuantity":
              Number(existingBatchData?.batch[batchIndex]?.weight.batchQuantity) +
              Number(req.body.numberOfunits) *
                Number(productDetail?.weight.value),
            "batch.$[elem].weight.productQuantity":
              Number(existingBatchData?.batch[batchIndex]?.weight.productQuantity) +
              Number(productDetail.weight.quantityInPack) *
                req.body.numberOfunits,
            "batch.$[elem].updatedBy": new mongoose.Types.ObjectId(req.id),
            "batch.$[elem].updatedAt": Date.now(),
            totalWeight: {
              totalBatchQuantity:
                Number(oldInventoryData?.totalWeight.totalBatchQuantity) +
                Number(req.body.numberOfunits) *
                  Number(productDetail.weight.value),
              totalActualQuantity:
                Number(oldInventoryData?.totalWeight.totalActualQuantity) +
                Number(productDetail.weight.quantityInPack) *
                  Number(req.body.numberOfunits),
              totalPacks:
                Number(oldInventoryData.totalWeight.totalPacks) +
                Number(req.body.numberOfunits),
              unit: new mongoose.Types.ObjectId(req.body.unit),
            },
          },
        };
        updateOptions.arrayFilters = [
          { "elem.batchNumber": req.body.batchNumber },
        ];
      }
       else if (req.body.operationType == constants.operationType.remove) {
        //first of all check quantity and pack is available in inventory or not
        if (
          req.body.numberOfunits > oldInventoryData?.totalWeight?.totalPacks
        ) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: message.insufficientQuantity,
          };
        } else {
          updateQuery = {
            $set: {
              // productId: req.body.product_id,
              msl: Number(req.body.msl),
              // "batch.$[elem].packSize": new mongoose.Types.Decimal128(req.body.packSize),
              "batch.$[elem].weight.productQuantity":
                Number(existingBatchData?.batch[batchIndex]?.weight.productQuantity) -
                Number(productDetail.weight.quantityInPack) *
                  req.body.numberOfunits,
              "batch.$[elem].numberOfunits":
                Number(existingBatchData?.batch[batchIndex]?.numberOfunits) -
                Number(req.body.numberOfunits),
              "batch.$[elem].weight.batchQuantity":
                Number(existingBatchData?.batch[batchIndex]?.weight.batchQuantity) -
                Number(req.body.numberOfunits) *
                  Number(productDetail?.weight.quantityInPack),
              "batch.$[elem].weight.unit": productDetail?.weight?.unit,
              "batch.$[elem].updatedBy": new mongoose.Types.ObjectId(req.id),
              "batch.$[elem].updatedAt": Date.now(),
              totalWeight: {
                totalBatchQuantity:
                  Number(oldInventoryData?.totalWeight?.totalBatchQuantity) -
                  Number(req.body.numberOfunits) *
                    Number(productDetail?.weight.value),
                totalActualQuantity:
                  Number(oldInventoryData?.totalWeight?.totalActualQuantity) -
                  Number(productDetail?.weight?.quantityInPack) *
                    Number(req.body.numberOfunits),
                totalPacks:
                  Number(oldInventoryData?.totalWeight?.totalPacks) -
                  Number(req?.body?.numberOfunits),
                // unit: new mongoose.Types.ObjectId(req.body.unit)
              },
            },
          };
          updateOptions.arrayFilters = [
            { "elem.batchNumber": req.body.batchNumber },
          ];
        }
      }
    }

    await Inventory.findOneAndUpdate(
      {
        company_Id: createdBy,
        productId: productId,
        locationId: locationId,
      },
      updateQuery,
      updateOptions,
    )
      .then(async (inventoryData: any) => {
        if (!inventoryData) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: message.inventoryFailed,
          };
        } else {
          //sort updated batch

          if(inventoryData.batch.length>1){
            inventoryData.batch.sort(
              (a: any, b: any) =>
                new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            );
          }

          // Save the sorted inventory
          await inventoryData.save();

          //create inventoryHistory

          InventoryHistory.create({
            transaction_id: await generateDocumentNumber(),
            type: constants.historyType.Inventory,
            product: [
              {
                product_id: productDetail._id,
                batchNumber: selfproductbatchNumber?selfproductbatchNumber: req.body.batchNumber,
                quantity: {
                  previous: oldInventoryData
                    ? Number(oldInventoryData.totalWeight.totalPacks)
                    : 0,
                  changed:
                    inventoryData.totalWeight.totalPacks -
                    (oldInventoryData?.totalWeight.totalPacks
                      ? oldInventoryData?.totalWeight.totalPacks
                      : 0),
                  new: Number(inventoryData.totalWeight.totalPacks),
                },
                weight: {
                  previous: oldInventoryData
                    ? Number(oldInventoryData.totalWeight.totalActualQuantity)
                    : 0,
                  changed:
                    inventoryData.totalWeight.totalActualQuantity -
                    (oldInventoryData?.totalWeight.totalActualQuantity
                      ? oldInventoryData?.totalWeight.totalActualQuantity
                      : 0),
                  new: Number(inventoryData.totalWeight.totalActualQuantity),
                },
                msl: {
                  previous: oldInventoryData
                    ? Number(oldInventoryData?.msl)
                    : 0,
                  changed: oldInventoryData
                    ? Number(inventoryData.msl) - Number(oldInventoryData.msl)
                    : Number(inventoryData.msl),
                  new: Number(inventoryData.msl),
                },
                price:
                  Number(productDetail.price.sellingPrice) 
                  ,
              },
            ],
            sourceLocation: inventoryData.locationId,
            isDeleted: false,
            createdBy: req.id,
          })
            .then((inventoryHistory) => {
              if (!inventoryHistory) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  message: message.inventoryHistory_failed,
                };
              } else {
                res.status(constants.code.success).json({
                  statusCode: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.inventorySuccess,
                });
              }
            })
            .catch((err) => {
              res.status(err.statusCode).json({
                statusCode: constants.status.statusFalse,
                userStatus: req.status,
                message: err.message,
              });
            });
        }
      })
      .catch((err) => {  
        res.status(constants.code.dataNotFound).json({
          statusCode: constants.status.statusFalse,
          userStatus: req.status,
          message: err.message,
        });
      });
  } catch (error: any) {
    
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error.message ? error.message : error,
    });
  }
};

const inventoryHistorylist = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;
    0;

    let createdBy = req.id;
    if (
      req.role === constants.accountLevel.admin ||
      req.role === constants.accountLevel.manager ||
      req.role === constants.accountLevel.inventorymanager
    ) {
      const userDetail = await User.findById({
        _id: new mongoose.Types.ObjectId(req.id),
        role: {
          $or: [
            constants.accountLevel.inventorymanager,
            constants.accountLevel.admin,
            constants.accountLevel.manager,
          ],
        },
      });
      createdBy = userDetail?.createdBy;
    }

    if (Number(req.query.limit) !== 0) {
      InventoryHistory.aggregate([
        {
          $match: {
            "product.product_id": new mongoose.Types.ObjectId(
              req.body.product_id
            ),
            type: constants.historyType.Inventory,
            isDeleted: false,
          },
        },
        {
          $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product.product_id",
            foreignField: "_id",
            as: "product_detail",
          },
        },
        {
          $unwind: {
            path: "$product_detail",
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
        {
          $unwind: {
            path: "$user_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "addresses",

            let: { addressId: "$sourceLocation" },

            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$addressId"] },

                  isDeleted: false,
                },
              },
            ],

            as: "warehouseAddresses",
          },
        },

        {
          $unwind: {
            path: "$warehouseAddresses",

            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: { createdAt: sort },
        },
        {
          $project: {
            _id: 1,
            product_id: "$product_detail._id",
            location:"$warehouseAddresses.slug",
            product_name: "$product_detail.name",
            createdBy_fname: "$user_detail.fname",
            createdBy_lname: "$user_detail.lname",
            createdAt: "$createdAt",
            quantity: {
              previous: "$product.quantity.previous",
              changed: "$product.quantity.changed",
              new: "$product.quantity.new",
            },
            quantityInLitres: {
              previous: {
                $multiply: [
                  "$product.quantity.previous",
                  "$product_detail.weight.quantityInPack",
                ],
              },
              changed: {
                $multiply: [
                  "$product.quantity.changed",
                  "$product_detail.weight.quantityInPack",
                ],
              },
              new: {
                $multiply: [
                  "$product.quantity.new",
                  "$product_detail.weight.quantityInPack",
                ],
              },
            },
            batchNumber: "$product.batchNumber",
            msl: {
              previous: "$product.msl.previous",
              changed: "$product.msl.changed",
              new: "$product.msl.new",
            },
            price: "$product.price",
            currency: "$product.currency",
          },
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
        .then((data) => {
          // if (!data[0].data.length) {
          //   throw {
          //     statusCode: constants.code.dataNotFound,
          //     msg: constants.message.dataNotFound,
          //   };
          // }
          //  else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.inventoryHistoryListSuccess,
            metadata: data[0].metadata,
            data: data[0].data,
          });
          //  }
        })
        .catch((err) => {
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.msg,
          });
        });
    } else {
      InventoryHistory.aggregate([
        {
          $match: {
            "product.product_id": new mongoose.Types.ObjectId(
              req.body.product_id
            ),
            type: constants.historyType.Inventory,
            isDeleted: false,
          },
        },
        {
          $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product.product_id",
            foreignField: "_id",
            as: "product_detail",
          },
        },
        {
          $unwind: {
            path: "$product_detail",
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
        {
          $unwind: {
            path: "$user_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { createdAt: sort },
        },
        {
          $project: {
            _id: 1,
            product_id: "$product_detail._id",
            product_name: "$product_detail.name",
            createdBy_fname: "$user_detail.fname",
            createdBy_lname: "$user_detail.lname",
            createdAt: "$createdAt",
            quantity: {
              previous: "$product.quantity.previous",
              changed: "$product.quantity.changed",
              new: "$product.quantity.new",
            },
            quantityInLitres: {
              previous: {
                $multiply: [
                  "$product.quantity.previous",
                  "$product_detail.weight.quantityInPack",
                ],
              },
              changed: {
                $multiply: [
                  "$product.quantity.changed",
                  "$product_detail.weight.quantityInPack",
                ],
              },
              new: {
                $multiply: [
                  "$product.quantity.new",
                  "$product_detail.weight.quantityInPack",
                ],
              },
            },
            batchNumber: "$product.batchNumber",
            msl: {
              previous: "$product.msl.previous",
              changed: "$product.msl.changed",
              new: "$product.msl.new",
            },
            price: "$product.price",
            currency: "$product.currency",
          },
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
        .then((data) => {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message?.inventoryHistoryListSuccess,
            metadata: data[0]?.metadata,
            data: data[0]?.data,
          });
        })
        .catch((err) => {
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.msg,
          });
        });
    }
  } catch (err) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err,
    });
  }
};

export default {
  inventoryList,
  detail,
  manageInventory,
  inventoryHistorylist,
};
