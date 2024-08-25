import { Request, Response, NextFunction } from "express";

import constants from "../../../utils/constants";

import message from "./productConstant";

import Color from "../../../models/color";

import HSN from "../../../models/hsn";

import Brand from "../../../models/brand";

import mongoose from "mongoose";

import Product from "../../../models/product";

import User from "../../../models/user";

import Category from "../../../models/category";

import { generateSku, imageUrl } from "../../../helpers/helper";

import SubCategory from "../../../models/subCategory";

import SubChildCategory from "../../../models/subChildCategory";
import UOM from "../../../models/uom";
import paintType from "../../../models/paintType";
import finishType from "../../../models/finishType";
import Company from "../../../models/company";

const addProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const companyData: any = await Company.findOne({
      isCompanyErp: true,
      isDeleted: false,
    });
    let createdBy = companyData._id;

    const brandData: any = await Brand.findOne({
      _id: new mongoose.Types.ObjectId(req.body.brand_id),
      isDeleted: false,
    });

    if (!brandData) {
      throw {
        statusCode: constants.code.dataNotFound,

        message: message.invalidBrandId,
      };
    }

    const categoryData: any = await Category.findOne({
      _id: new mongoose.Types.ObjectId(req.body.category_id),

      isDeleted: false,
    });

    if (!categoryData) {
      throw {
        statusCode: constants.code.dataNotFound,

        message: constants.message.invalidCategoryId,
      };
    }

    let subCategoryData = null;

    if (req.body.subCategory_id) {
      subCategoryData = await SubCategory.findOne({
        _id: new mongoose.Types.ObjectId(req.body.subCategory_id),

        isDeleted: false,
      });

      if (!subCategoryData) {
        throw {
          statusCode: constants.code.dataNotFound,

          message: message.subcategoryNotExist,
        };
      }
    }

    let colorData: any = null;

    if (req.body.color_id) {
      colorData = await Color.findOne({
        _id: new mongoose.Types.ObjectId(req.body.color_id),

        isDeleted: false,
      });

    }

    const hsnData = await HSN.findOne({
      _id: new mongoose.Types.ObjectId(req.body.hsn_id),

      isDeleted: false,
    });

    if (!hsnData) {
      throw {
        statusCode: constants.code.dataNotFound,

        message: message.invalidHsnId,
      };
    }
    const uomData = await UOM.findOne({
      _id: new mongoose.Types.ObjectId(req.body.uom_id),
      isDeleted: false,
    });

    if (!uomData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.invalidUOMId,
      };
    }
    let paintTypeData: any = null;
    if (req.body.painttype_id) {
      paintTypeData = await paintType.findOne({
        _id: new mongoose.Types.ObjectId(req.body.painttype_id),
        isDeleted: false,
      });
    }
    // if (!paintTypeData) {
    //   throw {
    //     statusCode: constants.code.dataNotFound,
    //     message: message.invalidPaintTypeId,
    //   };
    // }
    let finishTypeData: any = null;
    if (req.body.finishtype_id) {
      finishTypeData = await finishType.findOne({
        _id: new mongoose.Types.ObjectId(req.body.finishtype_id),
        isDeleted: false,
      });
    }

    // if (!finishTypeData) {
    //   throw {
    //     statusCode: constants.code.dataNotFound,
    //     message: message.invalidFinishTypeId,
    //   };
    // }

    const productSku = await generateSku(
      brandData.name,
      req.body.name,
      categoryData,
      req.body.product_weight,
      colorData?.code
    );

    const productExists = await Product.exists({
      sku: productSku,
      // "weight.value": req.body.product_weight,

      //  colorId:req.body.color_id?new mongoose.Types.ObjectId(req.body.color_ibatchNumberd):null,
      soldBy: new mongoose.Types.ObjectId(createdBy),
      isDeleted: false,
    });

    if (productExists) {
      throw {
        statusCode: constants.code.preconditionFailed,

        message: message.prodcutExist,
      };
    } else {
      await Product.create({
        name: req.body.name,
        // batchNumber: req.body.batch_number,
        productCode: req.body.product_code,
        description: req.body.description,
        brandId: brandData._id,
        Type: req.body.productType,
        productStandard: req.body.standard,
        categoryId: categoryData?._id,
        // margin:Number(req.body.margin),
        subCategoryId: req.body.subCategory_id
          ? new mongoose.Types.ObjectId(req.body.subCategory_id)
          : null,

        subChildCategoryId: req.body.subChildCategory_id
          ? new mongoose.Types.ObjectId(req.body.subChildCategory_id)
          : null,

        price: {
          sellingPrice: req.body.selling_price,

          costPrice: req.body.cost_price,

          unitPrice: req.body.unit_price,
        },

        paintType: paintTypeData?._id ? paintTypeData?._id : null,

        finish: finishTypeData?._id ? finishTypeData?._id : null,

        GST: hsnData.gst,

        colorId: req.body.color_id
          ? new mongoose.Types.ObjectId(req.body.color_id)
          : null,

        sku: productSku, // Update this with your SKU generation logic

        HSN: hsnData._id,

        weight: {
          value: req.body.product_weight,
          quantityInPack: Number(req.body.packQuantity),
          unit: uomData?._id,
        },

        soldBy: new mongoose.Types.ObjectId(createdBy),

        createdBy: req.id,
      })
        .then((created_product) => {
          if (!created_product) {
            throw {
              statusCode: constants.code.dataNotFound,

              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.code.success,

              userStatus: req.status,

              message: message.productAddSuccess,
            });
          }
        })
        .catch((err) => {
          console.log("err", err)
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,

            userStatus: req.status,

            message: err.message,
          });
        });
    }
  } catch (error: any) {
    console.log("err1", error)
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error?.message ? error?.message : error,
    });
  }
};

const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const companyData: any = await Company.findOne({
      isCompanyErp: true,
      isDeleted: false,
    });
    let createdBy = companyData._id;

    const brandData = await Brand.findOne({
      _id: new mongoose.Types.ObjectId(req.body.brand_id),
      isDeleted: false,
    });

    if (!brandData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.invalidBrandId,
      };
    }

    const categoryData = await Category.findOne({
      _id: new mongoose.Types.ObjectId(req.body.category_id),
      isDeleted: false,
    });

    if (!categoryData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: constants.message.invalidCategoryId,
      };
    }

    let subCategoryData = null;

    if (req.body.subCategory_id) {
      subCategoryData = await SubCategory.findOne({
        _id: new mongoose.Types.ObjectId(req.body.subCategory_id),
        isDeleted: false,
      });

      if (!subCategoryData) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.subcategoryNotExist,
        };
      }
    }

    let colorData: any = null;

    if (req.body.color_id) {
      colorData = await Color.findOne({
        _id: new mongoose.Types.ObjectId(req.body.color_id),
        isDeleted: false,
      });

      // if (!colorData) {
      //   throw {
      //     statusCode: constants.code.dataNotFound,
      //     message: message.invalidColorId,
      //   };
      // }
    }

    const hsnData = await HSN.findOne({
      _id: new mongoose.Types.ObjectId(req.body.hsn_id),
      isDeleted: false,
    });

    if (!hsnData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.invalidHsnId,
      };
    }

    const uomData = await UOM.findOne({
      _id: new mongoose.Types.ObjectId(req.body.uom_id),
      isDeleted: false,
    });

    if (!uomData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.invalidUOMId,
      };
    }

    let paintTypeData;
    if (req.body.painttype_id) {
      paintTypeData = await paintType.findOne({
        _id: new mongoose.Types.ObjectId(req.body.painttype_id),
        isDeleted: false,
      });
    }

    // if (!paintTypeData) {
    //   throw {
    //     statusCode: constants.code.dataNotFound,
    //     message: message.invalidPaintTypeId,
    //   };
    // }
    let finishTypeData;
    if (req.body.finishtype_id) {
      finishTypeData = await finishType.findOne({
        _id: new mongoose.Types.ObjectId(req.body.finishtype_id),
        isDeleted: false,
      });
    }

    // if (!finishTypeData) {
    //   throw {
    //     statusCode: constants.code.dataNotFound,
    //     message: message.invalidFinishTypeId,
    //   };
    // }

    const basePaintOneData = await Product.findOne({
      _id: new mongoose.Types.ObjectId(req.body.base_paint_one_productId),
      isDeleted: false,
    });

    if (!basePaintOneData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.invalidBasePaintOneProductId,
      };
    }

    const basePaintTwoData = await Product.findOne({
      _id: new mongoose.Types.ObjectId(req.body.base_paint_two_productId),
      isDeleted: false,
    });

    if (!basePaintTwoData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.invalidBasePaintTwoProductId,
      };
    }

    if (req.body.tinters && req.body.tinters.length > 0) {
      await Promise.all(
        req.body.tinters.map(async (tinter: any) => {
          const tinterProductData = await Product.findOne({
            _id: new mongoose.Types.ObjectId(tinter.productId),
            isDeleted: false,
          });

          if (!tinterProductData) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: message.invalidTinterProductId,
            };
          }
        })
      );
    }

    const productSku = await generateSku(
      brandData.name,
      req.body.name,
      categoryData,
      req.body.product_weight,
      colorData?.code
    );

    const productExists = await Product.exists({
      sku: productSku,
      isDeleted: false,
    });

    if (productExists) {
      throw {
        statusCode: constants.code.preconditionFailed,
        message: message.prodcutExist,
      };
    } else {

      await Product.create({
        name: req.body.name,
        // batchNumber: req.body.batch_number,
        productCode: req.body.product_code,
        // description: req.body.description,
        brandId: brandData._id,
        categoryId: categoryData._id,
        subCategoryId: req.body.subCategory_id
          ? new mongoose.Types.ObjectId(req.body.subCategory_id)
          : null,
        subChildCategoryId: req.body.subChildCategory_id
          ? new mongoose.Types.ObjectId(req.body.subChildCategory_id)
          : null,
        productStandard: req.body.standard,
        // marginPercentage:req.body.margin,
        Type: constants.productType.Paint,
        price: {
          sellingPrice: req.body.selling_price,

          costPrice: req.body.cost_price,

          unitPrice: Number(req.body.cost_price / req.body.product_weight)
        },
        paintType: paintTypeData ? paintTypeData._id : null,
        finish: finishTypeData ? finishTypeData?._id : null,
        GST: hsnData.gst,
        colorId: req.body.color_id
          ? new mongoose.Types.ObjectId(req.body.color_id)
          : null,
        sku: productSku,
        weight: {
          value: req.body.product_weight,
          quantityInPack: Number(req.body.quantity),
          unit: uomData?._id,
        },
        base_paint_one: {
          productId: new mongoose.Types.ObjectId(
            req.body.base_paint_one_productId
          ),
          weight: {
            value: req.body.base_paint_one_product_weight,
            unit: new mongoose.Types.ObjectId(req.body.base_paint_one_uomId),
          },
        },
        base_paint_two: {
          productId: new mongoose.Types.ObjectId(
            req.body.base_paint_two_productId
          ),
          weight: {
            value: req.body.base_paint_two_product_weight,
            unit: new mongoose.Types.ObjectId(req.body.base_paint_two_uomId),
          },
        },
        manufacturer: constants.manufactureType.self,

        soldBy: new mongoose.Types.ObjectId(createdBy),
        HSN: new mongoose.Types.ObjectId(hsnData._id),
        tinters: req.body.tinters.map((tinter: any) => ({
          productId: tinter.productId,
          weight: {
            value: tinter.weight,
            unit: new mongoose.Types.ObjectId(tinter.uomId),
          },
        })),
        // margin:req.body.margin,
        productType: req.body.productType,
        createdBy: req.id,
      })
        .then((created_product) => {
          if (!created_product) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              statusCode: constants.code.success,
              userStatus: req.status,
              message: message.productAddSuccess,
            });
          }
        })
        .catch((err) => {
          console.log("err", err);
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.message,
          });
        })
    }
  } catch (error: any) {
    console.log("err1", error);
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error?.message ? error?.message : error,
    });
  }
};

const productList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);

    const limit = Number(req.query.limit);

    const skip = page * limit;

    const sort = req.query.sort === "desc" ? -1 : 1;

    // let createdBy = req.id;
    // if (
    //   req.role == constants.accountLevel.admin ||
    //   req.role == constants.accountLevel.manager ||
    //   req.role == constants.accountLevel.inventorymanager
    // ) {
    //   const userDetail = await User.findOne({
    //     _id: new mongoose.Types.ObjectId(req.id),

    //     $or: [
    //       { role: constants.accountLevel.inventorymanager },

    //       { role: constants.accountLevel.admin },

    //       { role: constants.accountLevel.manager },
    //     ],
    //   });

    //   createdBy = userDetail?.createdBy;
    // }

    const companyData: any = await Company.findOne({
      isCompanyErp: true,
      isDeleted: false,
    });
    let createdBy = companyData?._id;
    if (!createdBy) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.companyNotFound
      }
    }

    if (Number(req.query?.limit) !== 0) {
      await Product.aggregate([
        {
          $match: {
            // soldBy: new mongoose.Types.ObjectId(createdBy),

            isDeleted: false,

            $or: [
              {
                name: {
                  $regex: "^" + req.query.search + ".*",

                  $options: "i",
                },
              },

              {
                sku: {
                  $regex: "^" + req.query.search + ".*",

                  $options: "i",
                },
              },
            ],
          },
        },

        { $sort: { createdAt: -1 } },

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
            from: "users",

            let: { userID: "$createdBy" },

            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$userID"] },

                      {
                        $in: [
                          "$role",

                          [
                            constants.accountLevel.manager,

                            constants.accountLevel.admin,

                            constants.accountLevel.superAdmin,
                          ],
                        ],
                      },
                    ],
                  },

                  isDeleted: false,
                },
              },

              {
                $project: {
                  _id: 0,

                  username: 1,

                  fname: 1,

                  lname: 1,
                },
              },
            ],

            as: "user",
          },
        },

        {
          $project: {
            _id: 1,

            name: 1,
            Type: 1,
            description: 1,
            HSN: 1,
            sku: 1,
            unitPrice: "$price.unitPrice",
            brand: "$brandDetail.name",

            category: "$categoryDetail.name",

            subcategory: "$subcategoryDetail.name",

            subchildategory: "$subchildcategoryDetail.name",
            pack_size: {
              weight: "$weight.value",
              productQuantity: "$weight.quantityInPack",
              uomID: "$uomDetail._id",
              uom: "$uomDetail.uom_type"
            },


            createdAt: { $toLong: "$createdAt" },

            user: {
              $arrayElemAt: [
                [
                  {
                    $concat: [
                      { $arrayElemAt: ["$user.fname", 0] },

                      " ",

                      { $arrayElemAt: ["$user.lname", 0] },
                    ],
                  },
                ],

                0,
              ],
            },
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

        .then((productData) => {
          if (!productData) {
            throw {
              statusCode: constants.code.dataNotFound,

              message: message.noProductList,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,

              userStatus: req.status,

              data: productData,
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
      await Product.aggregate([
        {
          $match: {
            soldBy: new mongoose.Types.ObjectId(createdBy),

            isDeleted: false,

            $or: [
              {
                name: {
                  $regex: "^" + req.query.search + ".*",

                  $options: "i",
                },
              },
              {
                sku: {
                  $regex: "^" + req.query.search + ".*",

                  $options: "i",
                },
              },
            ],
          },
        },

        { $sort: { createdAt: -1 } },

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
            from: "users",

            let: { userID: "$createdBy" },

            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$userID"] },

                      {
                        $in: [
                          "$role",

                          [
                            constants.accountLevel.manager,

                            constants.accountLevel.admin,

                            constants.accountLevel.superAdmin,
                          ],
                        ],
                      },
                    ],
                  },

                  isDeleted: false,
                },
              },

              {
                $project: {
                  _id: 0,

                  username: 1,

                  fname: 1,

                  lname: 1,
                },
              },
            ],

            as: "user",
          },
        },

        {
          $project: {
            _id: 1,

            name: 1,
            Type: 1,
            description: 1,
            HSN: 1,

            sku: 1,
            unitPrice: "$price.unitPrice",

            brand: "$brandDetail.name",

            category: "$categoryDetail.name",

            subcategory: "$subcategoryDetail.name",

            subchildategory: "$subchildcategoryDetail.name",
            pack_size: {
              weight: "$weight.value",
              productQuantity: "$weight.quantityInPack",
              uomID: "$uomDetail._id",
              uom: "$uomDetail.uom_type"
            },
            productType: 1,

            createdAt: { $toLong: "$createdAt" },

            user: {
              $arrayElemAt: [
                [
                  {
                    $concat: [
                      { $arrayElemAt: ["$user.fname", 0] },

                      " ",

                      { $arrayElemAt: ["$user.lname", 0] },
                    ],
                  },
                ],

                0,
              ],
            },
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

        .then((productData) => {
          if (!productData) {
            throw {
              statusCode: constants.code.dataNotFound,

              message: message.noProductList,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,

              userStatus: req.status,

              data: productData,
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
  } catch (error: any) {
    res.status(constants.code.internalServerError).json({
      status: constants.code.internalServerError,

      userStatus: req.status,

      message: error.message ? error.message : error.message,
    });
  }
};

const productDetail = async (req: any, res: Response, next: NextFunction) => {
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

                let: { hsnID: "$HSN" },

                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$hsnID"] },
                      isDeleted: false,
                    },
                  },
                ],

                as: "hsn_detail",
              },
            },
            {
              $unwind: {
                path: "$hsn_detail",

                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                manufacturer: 1,
                basic_details: {
                  name: "$name",
                  batchNumber: "$batchNumber",
                  productCode: "$productCode",
                  brand: "$brandDetail.name",
                  brandId: "$brandDetail._id",
                  color: "$colorDetail.name",
                  colorId: "$colorDetail._id",
                  sku: "$sku",
                  category: "$categoryDetail.name",
                  // marginPercentage:"$categoryDetail.marginPercentage",
                  categoryId: "$categoryDetail._id",
                  margin: "$categoryDetail.margin",
                  subcategory: "$subcategoryDetail.name",
                  subcategoryId: "$subcategoryDetail._id",
                  subchildategory: "$subchildcategoryDetail.name",
                  subchildategoryId: "$subchildcategoryDetail._id",
                  Type: "$Type",
                  productStandard: "$productStandard",
                  hsn: "$hsn_detail.hsn",
                  hsn_id: "$hsn_detail._id",
                  pack_size: {
                    weight: "$weight.value",
                    productQuantity: "$weight.quantityInPack",
                    uomID: "$uomDetail._id",
                    uom: "$uomDetail.uom_type",
                    batchNumber: 1,
                    productCode: 1,
                  },
                },

                other_details: {
                  // paintType: "$paintType",
                  // finish: "$finish",
                  paintTypeID: "$paintTypeDetail._id",
                  paintType: "$paintTypeDetail.paint_type",
                  finishTypeID: "$finishTypeDetail._id",
                  finishType: "$finishTypeDetail.finish_type",
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
                  totalQuantityProduced: "$weight.quantityInPack",
                },
                price_details: {
                  sellingPrice: "$price.sellingPrice",

                  costPrice: "$price.costPrice",

                  unitPrice: "$price.unitPrice",
                  margin: "$margin"
                },
                commentsDetail: "$commentsDetail.comments",
                QuantityToProduce: 1,
              },
            },
          ])
            .then((productData: any) => {
              if (!productData) {
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

                message: err.msg,
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

const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
  try {

    const companyData: any = await Company.findOne({
      isCompanyErp: true,
      isDeleted: false,
    });
    let createdBy = companyData._id;

    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      const productIds: any = [];
      for (let i = 0; i <= req.body.product_ids.length; i++) {
        productIds.push(new mongoose.Types.ObjectId(req.body.product_ids[i]));
      }
      Product.updateMany(
        {
          _id: { $in: productIds },
          // soldBy: new mongoose.Types.ObjectId(createdBy),
          isDeleted: false,
          status: true,
        },
        {
          isDeleted: true,
        }
      )
        .then((data) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.productDeleted,
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

const updateBasicDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const nameExists = await Product.findOne({ name: req.body.name, isDeleted: false })
    if (nameExists) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.prodcutExist,
      }
    }
    const brandData = await Brand.findOne({
      _id: new mongoose.Types.ObjectId(req.body.brand_id),
      isDeleted: false,
    });

    if (!brandData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.invalidBrandId,
      };
    }

    const categoryData = await Category.findOne({
      _id: new mongoose.Types.ObjectId(req.body.category_id),
      brandId: new mongoose.Types.ObjectId(req.body.brand_id),
      isDeleted: false,
    });

    if (!categoryData) {
      throw {
        statusCode: constants.code.dataNotFound,

        message: message.invalidCategoryId,
      };
    }

    let subCategoryData: any = null;
    if (req.body.subCategory_id) {
      subCategoryData = await SubCategory.findOne({
        _id: new mongoose.Types.ObjectId(req.body.subCategory_id),

        isDeleted: false,
      });
    }
    // if (!subCategoryData) {
    //   throw {
    //     statusCode: constants.code.dataNotFound,

    //     message: message.subcategoryNotExist,
    //   };
    // }



    let subChildCategoryData: any = null;
    if (req.body.subChildCategory_id) {
      subChildCategoryData = await SubChildCategory.findOne({
        _id: new mongoose.Types.ObjectId(req.body.subChildCategory_id),

        isDeleted: false,
      });
    }

    // if (!subChildCategoryData) {
    //   throw {
    //     statusCode: constants.code.dataNotFound,

    //     message: message.subcategoryNotExist,
    //   };
    // }


    let colorData: any = null;
    if (req.body.color_id) {
      colorData = await Color.findOne({
        _id: new mongoose.Types.ObjectId(req.body.color_id),

        isDeleted: false,
      });
    }


    // if (!colorData) {
    //   throw {
    //     statusCode: constants.code.dataNotFound,

    //     message: message.invalidColorId,
    //   };
    // }

    const uomData = await UOM.findOne({
      _id: new mongoose.Types.ObjectId(req.body.uom_id),
      isDeleted: false,
    });

    if (!uomData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.invalidUOMId,
      };
    }

    const productSku = await generateSku(
      brandData.name,
      req.body.name,
      categoryData,
      req.body.product_weight,
      colorData?.code
    );

    const productExists: any = await Product.findOne({
      // _id: { $nin: [new mongoose.Types.ObjectId(req.params.product_id)] },
      _id: new mongoose.Types.ObjectId(req.params.product_id),

      // sku: productSku,

      isDeleted: false,
    });

    if (!productExists) {
      throw {
        statusCode: constants.code.preconditionFailed,
        message: message.prodcutExist,
      };
    } else {
      await Product.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.product_id),

          isDeleted: false,
        },

        {
          name: req.body.name,

          brandId: brandData._id,

          categoryId: categoryData._id,

          subCategoryId: subCategoryData ? subCategoryData._id : null,

          subChildCategoryId: subChildCategoryData ? subChildCategoryData._id : null,

          colorId: colorData ? colorData._id : null,

          weight: {
            value: Number(req.body.product_weight),
            quantityInPack: req.body?.quantity ? Number(req.body?.quantity) : productExists.weight.quantityInPack,
            unit: uomData._id,
          },
          Type: req.body.type,
          HSN: req.body.hsn,

          sku: productSku,

          productCode: req.body.product_code,
          // batchNumber: req.body.batch_number,
          updatedBy: req.id,
        },

        { new: true }
      )
        .then((productData) => {
          if (!productData) {
            throw {
              statusCode: constants.code.dataNotFound,

              message: message.productUpdationFailed,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,

              userStatus: req.status,

              message: message.productUpdateSuccess,
            });
          }
        })
        .catch((err) => {
          console.log("err1", err);

          res.status(err.statusCode).json({
            status: constants.status.statusFalse,

            userStatus: req.status,

            message: err.msg,
          });
        });
    }
  } catch (error: any) {
    res.status(constants.code.internalServerError).json({
      status: constants.code.internalServerError,

      userStatus: req.status,

      message: error?.message ? error?.message : error,
    });
  }
};

const updateOtherDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {


    let paintTypeData: any = null
    if (req.body.painttype_id) {
      paintTypeData = await paintType.findOne({
        _id: new mongoose.Types.ObjectId(req.body.painttype_id),
        isDeleted: false,
      });
    }


    let finishTypeData: any = null
    if (req.body.finishtype_id) {
      finishTypeData = await finishType.findOne({
        _id: new mongoose.Types.ObjectId(req.body.finishtype_id),
        isDeleted: false,
      });
    }


    await Product.findOne({
      _id: new mongoose.Types.ObjectId(req.params.product_id),

      isDeleted: false,
    })

      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,

            message: message.noProductFound,
          };
        } else {
          await Product.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.params.product_id),

              isDeleted: false,
            },

            {
              finish: finishTypeData ? finishTypeData._id : null,

              paintType: paintTypeData ? paintTypeData._id : null,


              //  "HSN.type":req.body.hsn_id,
              description: req.body?.description,

              updatedBy: req.id,
            },

            { new: true }
          )

            .then((productData) => {
              if (!productData) {
                throw {
                  statusCode: constants.code.dataNotFound,

                  message: message.productUpdationFailed,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.productUpdateSuccess,
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
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: message.noProductFound,
        });
      });
  } catch (error) {
    res.status(constants.code.internalServerError).json({
      status: constants.code.internalServerError,

      userStatus: req.status,

      message: error,
    });
  }
};


const updatePriceDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    await Product.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.product_id),

        isDeleted: false,
      },

      {
        price: {
          sellingPrice: req.body.selling_price,

          costPrice: req.body.cost_price,

          unitPrice: req.body.unit_price,
        },
        // margin:req.body.margin,

        updatedBy: req.id,
      },

      { new: true }
    )

      .then((productData) => {
        if (!productData) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: message.productUpdationFailed,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.productUpdateSuccess,
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
  } catch (error) {
    res.status(constants.code.internalServerError).json({
      status: constants.code.internalServerError,

      userStatus: req.status,

      message: error,
    });
  }
};

const updatePaintFormula = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const productData: any = await Product.findOne({
      _id: new mongoose.Types.ObjectId(req.params.product_id),
      isDeleted: false,
    });
    if (!productData) {
      throw {
        statusCode: constants.code.preconditionFailed,
        message: message.noProductFound,
      };
    } else {
      const basePaintOneData = await Product.findOne({
        _id: new mongoose.Types.ObjectId(req.body.base_paint_one_productId),
        isDeleted: false,
      });

      if (!basePaintOneData) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.invalidBasePaintOneProductId,
        };
      }

      const basePaintTwoData = await Product.findOne({
        _id: new mongoose.Types.ObjectId(req.body.base_paint_two_productId),
        isDeleted: false,
      });

      if (!basePaintTwoData) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.invalidBasePaintTwoProductId,
        };
      }
      //base_paint_one_uomId
      const basePaintOneUomData = await UOM.findOne({
        _id: new mongoose.Types.ObjectId(req.body.base_paint_one_uomId),
        isDeleted: false,
      });

      if (!basePaintOneUomData) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.invalidBasePaintOneUomId,
        };
      }

      const basePaintTwoUomData = await UOM.findOne({
        _id: new mongoose.Types.ObjectId(req.body.base_paint_two_uomId),
        isDeleted: false,
      });

      if (!basePaintTwoUomData) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.invalidBasePaintTwoUomId,
        };
      }

      if (req.body.tinters?.length > 0) {
        await Promise.all(
          req.body.tinters.map(async (tinter: any) => {
            const tinterProductData = await Product.findOne({
              _id: new mongoose.Types.ObjectId(tinter.productId),
              isDeleted: false,
            });
            const tinterUomData = await UOM.findOne({
              _id: new mongoose.Types.ObjectId(tinter.weight.unit),
              isDeleted: false,
            });

            if (!tinterProductData) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: message.invalidTinterProductId,
              };
            }

            if (!tinterUomData) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: message.invalidUOMId,
              };
            }

          })
        );
      }



      const basePaintUpdate: any = {
        base_paint_one: {
          productId: basePaintOneData._id,
          weight: {
            value: req.body.base_paint_one_product_weight,
            unit: basePaintOneUomData._id,
          },
        },
        base_paint_two: {
          productId: basePaintTwoData._id,
          weight: {
            value: req.body.base_paint_two_product_weight,
            unit: basePaintTwoUomData._id,
          },
        },
      };


      const tinterUpdates = req.body.tinters.map((tinter: any) => ({
        productId: new mongoose.Types.ObjectId(tinter.productId),
        weight: {
          value: tinter.weight.value,
          unit: tinter.weight.unit,
        },
      }));

      await Product.updateOne(
        { _id: new mongoose.Types.ObjectId(req.params.product_id) },
        {
          $set: {
            tinters: tinterUpdates,
            ...basePaintUpdate,
            weight: {
              value: productData.weight.value,
              quantityInPack: Number(req.body.total_quantity),
              unit: basePaintUpdate?.base_paint_two?.weight?.unit,
            },

          },
        }
      );

      res.status(constants.code.success).json({
        status: constants.status.statusTrue,
        userStatus: req.status,
        message: message.productUpdateSuccess,
      });
    }
  } catch (error) {
    console.log("errr", error);

    res.status(constants.code.internalServerError).json({
      status: constants.code.internalServerError,
      userStatus: req.status,
      message: error,
    });
  }
};

export default {
  addProduct,

  createProduct,

  productList,

  productDetail,

  deleteProduct,

  updateBasicDetails,

  updateOtherDetails,

  updatePriceDetails,

  updatePaintFormula,
};
