import { Request, Response, NextFunction } from "express";
import constants from "../../../utils/constants";
import message from "./catalougeConstant";
import Brand from "../../../models/brand";
import {
  createSlug,
  getFileName,
  imageUrl,
  removeFile,
  removeImage,
  toLowerCase,
} from "../../../helpers/helper";
import excelToJson from "convert-excel-to-json";
import Category from "../../../models/category";
import SubCategory from "../../../models/subCategory";
import SubChildCategory from "../../../models/subChildCategory";
import Manufacture from "../../../models/manufacture";
import mongoose from "mongoose";
import Color from "../../../models/color";
import Product from "../../../models/product";
import FinishType from "../../../models/finishType";
import PaintType from "../../../models/paintType";
import UOM from "../../../models/uom";

const addBrand = async (req: any, res: Response, next: NextFunction) => {
  try {
    Brand.exists({
      slug: await createSlug(req.body.brand_name),
      isDeleted: false,
    })
      .then(async (data) => {
        if (data) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: message.alreadyBrand,
          };
        } else {
          Brand.create({
            name: req.body.brand_name,
            slug: await createSlug(req.body.brand_name),
          })
            .then(async (data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                Category.create({
                  name: `Tinters`,
                  slug: await createSlug(`Tinters`),
                  brandId: data._id,
                })
                  .then((newCategoryAdded) => {
                    if (!newCategoryAdded) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        message: constants.message.dataNotFound,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.brandSuccess,
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

const brandDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    Brand.findOne({
      _id: new mongoose.Types.ObjectId(req.params.brand_id),
      isDeleted: false,
    })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.brandDetailSuccess,
            data: await data.getBrandDetail(),
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

const brandList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    if (Number(req.query.limit) !== 0) {
      Brand.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
          },
        },
        {
          $sort: { createdAt: -1 },
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
        .then((data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.brandListSuccess,
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
      Brand.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
          },
        },
        {
          $sort: { createdAt: -1 },
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
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.brandListSuccess,
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

const updateBrand = async (req: any, res: Response, next: NextFunction) => {
  try {
    Brand.findOne({
      _id: new mongoose.Types.ObjectId(req.params.brand_id),
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          Brand.exists({
            slug: await createSlug(req.body.brand_name),
            _id: { $nin: [new mongoose.Types.ObjectId(req.params.brand_id)] },
          })
            .then(async (dataExist) => {
              if (dataExist) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: message.alreadyBrand,
                };
              } else {
                Brand.findOneAndUpdate(
                  {
                    _id: new mongoose.Types.ObjectId(req.params.brand_id),
                    isDeleted: false,
                  },
                  {
                    name: req.body.brand_name,
                    slug: await createSlug(req.body.brand_name),
                  },
                  { new: true }
                )
                  .then((data) => {
                    if (!data) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.brandUpdateSuccess,
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

const deleteBrand = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      Brand.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.brand_id),
          isDeleted: false,
        },
        {
          isDeleted: req.body.is_delete,
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
              message: message.brandDeleteSuccess,
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

const addCategory = async (req: any, res: Response, next: NextFunction) => {
  try {
    Brand.findOne({
      _id: new mongoose.Types.ObjectId(req.body.brand_id),
      isDeleted: false,
    })
      .then(async (brand_detail) => {
        if (!brand_detail) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.invalidBrandId,
          };
        } else {
          Category.findOne({
            brandId: new mongoose.Types.ObjectId(req.body.brand_id),
            slug: await createSlug(req.body.category_name),
            isDeleted: false,
          })
            .then(async (data) => {
              if (data) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: `${message.alreadyCategory} for ${brand_detail.name}`,
                };
              } else {
                Category.create({
                  name: req.body.category_name,
                  slug: await createSlug(req.body.category_name),
                  margin: req.body.margin,
                  brandId: brand_detail._id,
                })
                  .then((data) => {
                    if (!data) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.categorySuccess,
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

const categoryDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    Category.findOne({
      _id: new mongoose.Types.ObjectId(req.params.category_id),
      margin: req.body.margin,
      isDeleted: false,
    })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.categoryDetailSuccess,
            data: await data.getCategoryDetail(),
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

const categoryList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    let brandFilter = {};
    if (req.body.brand_id) {
      const brandData: any = await Brand.findOne({
        _id: new mongoose.Types.ObjectId(req.body.brand_id),
        isDeleted: false,
      });
      if (!brandData) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.brandNotFound,
        };
      }
      brandFilter = { brandId: brandData._id };
    }

    if (Number(req.query.limit) !== 0) {
      Category.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            ...brandFilter,
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "brandId",
            foreignField: "_id",
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
          $project: {
            _id: 1,
            brandName: "$brandDetail.name",
            brandId:"$brandDetail._id",
            name: 1,
            slug: 1,
            margin: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
        .then((data: any) => {
          //    console.log("data",data)
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.categoryListSuccess,
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
      Category.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            ...brandFilter,
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "brandId",
            foreignField: "_id",
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
          $project: {
            _id: 1,
            brandName: "$brandDetail.name",
            name: 1,
            margin: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.categoryListSuccess,
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

const updateCategory = async (req: any, res: Response, next: NextFunction) => {
  try {
            const TinterName = "Tinters";
    Category.findOne({
      brandId: new mongoose.Types.ObjectId(req.body.brandId),
      _id: new mongoose.Types.ObjectId(req.params.category_id),
      isDeleted: false,
    })
      .then(async (foundCategoryWithSameName) => {
        if (foundCategoryWithSameName?.name === TinterName) {
          Category.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.params.category_id),
              brandId: new mongoose.Types.ObjectId(req.body.brandId),
              isDeleted: false,
            },
            {
              margin: Number(req.body.margin),
            },
            { new: true }
          )
            .then((updatedCategory) => {
              if(!updatedCategory)
                {
                  throw {
                    statusCode: 500,
                    message: `some error occured while updating`,
                  };
                }
              res.status(constants.code.success).json({
                status: constants.code.success,
                message: constants.message.success,
                userStatus: req.status,
              });
            })
            .catch((error) => {
              res.status(constants.code.internalServerError).json({
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: error,
              });
            });
        } else {
          Category.findOne({
            name: TinterName,
            isDeleted: false,
          })
            .then((foundedCategorywithTintersName) => {
              if (
                foundedCategorywithTintersName?.name === req.body.category_name
              ) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  message: message.categoryExists,
                };
              } else {
                Category.exists({
                  _id: new mongoose.Types.ObjectId(req.params.category_id),
                  isDeleted: false,
                })
                  .then((existingCategory) => {
                    if (!existingCategory) {
                      throw {
                        statusCode: constants.code.dataNotFound,
                        message: message.categoryExists,
                      };
                    }
                    Category.findOneAndUpdate(
                      {
                        _id: new mongoose.Types.ObjectId(
                          req.params.category_id
                        ),
                        brandId: new mongoose.Types.ObjectId(req.body.brandId),
                        isDeleted: false,
                      },
                      {
                        name: req.body.category_name,
                        margin: Number(req.body.margin),
                      },
                      { new: true }
                    )
                      .then((updatedCategory) => {
                        if (!updatedCategory) {
                          throw {
                            statusCode: constants.code.dataNotFound,
                            message: constants.message.failed,
                          };
                        }
                        res.status(constants.code.success).json({
                          status: constants.code.success,
                          message: constants.message.success,
                          userStatus: req.status,
                        });
                      })
                      .catch((error) => {
                        res.status(constants.code.internalServerError).json({
                          status: constants.status.statusFalse,
                          userStatus: req.status,
                          message: error,
                        });
                      });
                  })
                  .catch((error) => {
                    res.status(constants.code.internalServerError).json({
                      status: constants.status.statusFalse,
                      userStatus: req.status,
                      message: error,
                    });
                  });
              }
            })
            .catch((error) => {
              res.status(constants.code.internalServerError).json({
                status: constants.status.statusFalse,
                userStatus: req.status,
                message: error,
              });
            });
        }
      })
      .catch((error) => {
        res.status(constants.code.internalServerError).json({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: error,
        });
      });
  } catch (error) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

const deleteCategory = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      Category.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.category_id),
          isDeleted: false,
        },
        {
          isDeleted: req.body.is_delete,
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
              message: message.categoryDeleteSuccess,
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

const addSubCategory = async (req: any, res: Response, next: NextFunction) => {
  try {
    Category.exists({ _id: new mongoose.Types.ObjectId(req.body.category_id) })
      .then(async (category_detail) => {
        if (!category_detail) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.invalidCategoryId,
          };
        } else {
          SubCategory.exists({
            categoryId: category_detail._id,
            slug: await createSlug(req.body.sub_category_name),
          })
            .then(async (data) => {
              if (data) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: message.alreadySubCategory,
                };
              } else {
                SubCategory.create({
                  categoryId: category_detail._id,
                  name: req.body.sub_category_name,
                  slug: await createSlug(req.body.sub_category_name),
                })
                  .then((data) => {
                    if (!data) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.subCategorySuccess,
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

const subCategoryDetail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    SubCategory.findOne({
      _id: new mongoose.Types.ObjectId(req.params.subCategory_id),
      isDeleted: false,
    })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.subCategoryDetailSuccess,
            data: await data.getSubCategoryDetail(),
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

const subCategoryList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    let categoryFilter = {};
    if (req.body.category_id) {
      const categoryData: any = await Category.findOne({
        _id: new mongoose.Types.ObjectId(req.body.category_id),
        isDeleted: false,
      });
      if (!categoryData) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.noCategory,
        };
      }
      categoryFilter = { categoryId: categoryData._id };
    }

    if (Number(req.query.limit) !== 0) {
      SubCategory.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            ...categoryFilter,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
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
            from: "brands",
            localField: "categoryDetail.brandId",
            foreignField: "_id",
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
          $project: {
            _id: 1,
            categoryId: 1,
            categoryName: "$categoryDetail.name",
            brandName: "$brandDetail.name",
            name: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
        .then((data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.subCategoryListSuccess,
              metadata: data[0].metadata,
              data: data[0].data,
            });
          }
        })
        .catch((err) => {
          console.log("errrr", err);
          res.status(err.statusCode).json({
            status: constants.status.statusFalse,
            userStatus: req.status,
            message: err.msg,
          });
        });
    } else {
      SubCategory.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            ...categoryFilter,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
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
            from: "brands",
            localField: "categoryDetail.brandId",
            foreignField: "_id",
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
          $project: {
            _id: 1,
            categoryId: 1,
            categoryName: "$categoryDetail.name",
            brandName: "$brandDetail.name",
            name: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.subCategoryListSuccess,
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

const updateSubCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    SubCategory.findOne({
      _id: new mongoose.Types.ObjectId(req.params.subCategory_id),
      isDeleted: false,
    })
      .then((data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          Category.exists({
            _id: new mongoose.Types.ObjectId(req.body.category_id),
          })
            .then(async (category_detail) => {
              if (!category_detail) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  msg: constants.message.invalidCategoryId,
                };
              } else {
                SubCategory.exists({
                  categoryId: category_detail._id,
                  slug: await createSlug(req.body.sub_category_name),
                  _id: {
                    $nin: [
                      new mongoose.Types.ObjectId(req.params.subCategory_id),
                    ],
                  },
                })
                  .then(async (subCategory_detail) => {
                    if (subCategory_detail) {
                      throw {
                        statusCode: constants.code.preconditionFailed,
                        msg: message.alreadySubCategory,
                      };
                    } else {
                      SubCategory.findOneAndUpdate(
                        {
                          _id: new mongoose.Types.ObjectId(
                            req.params.subCategory_id
                          ),
                          isDeleted: false,
                        },
                        {
                          categoryId: category_detail._id,
                          name: req.body.sub_category_name,
                          slug: await createSlug(req.body.sub_category_name),
                        },
                        { new: true }
                      )
                        .then((data) => {
                          if (!data) {
                            throw {
                              statusCode: constants.code.internalServerError,
                              msg: constants.message.internalServerError,
                            };
                          } else {
                            res.status(constants.code.success).json({
                              status: constants.status.statusTrue,
                              userStatus: req.status,
                              message: message.subCategoryUpdateSuccess,
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

const deleteSubCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      SubCategory.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.subCategory_id),
          isDeleted: false,
        },
        {
          isDeleted: req.body.is_delete,
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
              message: message.subCategoryDeleteSuccess,
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

const addSubChildCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    SubCategory.exists({
      _id: new mongoose.Types.ObjectId(req.body.sub_category_id),
    })
      .then(async (subCategory_detail) => {
        if (!subCategory_detail) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.invalidSubCategoryId,
          };
        } else {
          SubChildCategory.exists({
            subCategoryId: subCategory_detail._id,
            slug: await createSlug(req.body.sub_child_category_name),
          })
            .then(async (data) => {
              if (data) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: message.alreadySubChildCategory,
                };
              } else {
                SubChildCategory.create({
                  subCategoryId: subCategory_detail._id,
                  name: req.body.sub_child_category_name,
                  slug: await createSlug(req.body.sub_child_category_name),
                })
                  .then((data) => {
                    if (!data) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.subChildCategorySuccess,
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

const subChildCategoryDetail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    SubChildCategory.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.subChildCategory_id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "subcategories",
          foreignField: "_id",
          localField: "subCategoryId",
          as: "subCategory_detail",
        },
      },
      { $unwind: "$subCategory_detail" },
      {
        $lookup: {
          from: "categories",
          foreignField: "_id",
          localField: "subCategory_detail.categoryId",
          as: "category_detail",
        },
      },
      { $unwind: "$category_detail" },
      {
        $project: {
          _id: 1,
          subCategoryId: 1,
          categoryId: "$category_detail._id",
          categoryName: "$category_detail.name",
          subCategoryName: "$subCategory_detail.name",
          name: 1,
          createdAt: { $toLong: "$createdAt" },
        },
      },
    ])
      .then(async (data: any) => {
        if (!data.length) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.subChildCategoryDetailSuccess,
            data: data[0],
          });
        }
      })
      .catch((err: any) => {
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

const subChildCategoryList = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    let subCategoryFilter = {};
    if (req.body.subCategory_id) {
      const subCategoryData: any = await SubCategory.findOne({
        _id: new mongoose.Types.ObjectId(req.body.subCategory_id),
        isDeleted: false,
      });
      if (!subCategoryData) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: message.noCategory,
        };
      }
      subCategoryFilter = { subCategoryId: subCategoryData._id };
    }

    if (Number(req.query.limit) !== 0) {
      SubChildCategory.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            ...subCategoryFilter,
          },
        },
        {
          $lookup: {
            from: "subcategories",
            localField: "subCategoryId",
            foreignField: "_id",
            as: "subCategoryDetail",
          },
        },
        {
          $unwind: {
            path: "$subCategoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "subCategoryDetail.categoryId",
            foreignField: "_id",
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
            from: "brands",
            localField: "categoryDetail.brandId",
            foreignField: "_id",
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
          $project: {
            _id: 1,
            subCategoryId: 1,
            subCategoryName: "$subCategoryDetail.name",
            categoryName: "$categoryDetail.name",
            brandName: "$brandDetail.name",
            name: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
        .then((data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.subChildCategoryListSuccess,
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
      SubChildCategory.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            ...subCategoryFilter,
          },
        },
        {
          $lookup: {
            from: "subcategories",
            localField: "subCategoryId",
            foreignField: "_id",
            as: "subCategoryDetail",
          },
        },
        {
          $unwind: {
            path: "$subCategoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            subCategoryId: 1,
            subCategoryName: "$subCategoryDetail.name",
            name: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.subChildCategoryListSuccess,
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

const updateSubChildCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    SubChildCategory.findOne({
      _id: new mongoose.Types.ObjectId(req.params.subChildCategory_id),
      isDeleted: false,
    })
      .then((data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          SubCategory.exists({
            _id: new mongoose.Types.ObjectId(req.body.sub_category_id),
          })
            .then(async (subCategory_detail: any) => {
              if (!subCategory_detail) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  msg: constants.message.invalidCategoryId,
                };
              } else {
                SubChildCategory.exists({
                  subCategoryId: subCategory_detail._id,
                  slug: await createSlug(req.body.sub_child_category_name),
                  _id: {
                    $nin: [
                      new mongoose.Types.ObjectId(
                        req.params.subChildCategory_id
                      ),
                    ],
                  },
                })
                  .then(async (subChildCategory_detail) => {
                    if (subChildCategory_detail) {
                      throw {
                        statusCode: constants.code.preconditionFailed,
                        msg: message.alreadySubChildCategory,
                      };
                    } else {
                      SubChildCategory.findOneAndUpdate(
                        {
                          _id: new mongoose.Types.ObjectId(
                            req.params.subChildCategory_id
                          ),
                          isDeleted: false,
                        },
                        {
                          subCategoryId: subCategory_detail._id,
                          name: req.body.sub_child_category_name,
                          slug: await createSlug(
                            req.body.sub_child_category_name
                          ),
                        },
                        { new: true }
                      )
                        .then((data) => {
                          if (!data) {
                            throw {
                              statusCode: constants.code.internalServerError,
                              msg: constants.message.internalServerError,
                            };
                          } else {
                            res.status(constants.code.success).json({
                              status: constants.status.statusTrue,
                              userStatus: req.status,
                              message: message.subChildCategoryUpdateSuccess,
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

const deleteSubChildCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      SubChildCategory.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.subChildCategory_id),
          isDeleted: false,
        },
        {
          isDeleted: req.body.is_delete,
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
              message: message.subChildCategoryDeleteSuccess,
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

const addColor = async (req: any, res: Response, next: NextFunction) => {
  try {
    Color.exists({
      $or: [{ name: req.body.name }, { code: req.body.code }],
    })
      .then(async (data) => {
        if (data) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: message.alreadyColor,
          };
        } else {
          Color.create({
            name: req.body.name,
            code: req.body.code,
          })
            .then((data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.colorSuccess,
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

const colorList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    if (Number(req.query.limit) !== 0) {
      Color.aggregate([
        {
          $match: {
            isDeleted: false,
            $or: [
              {
                name: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                code: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              // {
              //   hex_code: {
              //     $regex: "^#" + req.query.search + ".*",
              //     $options: "i",
              //   },
              // },
              // {
              //   ral_code: {
              //     $regex: "^RAL" + req.query.search + ".*",
              //     $options: "i",
              //   },
              // },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            code: 1,
            // ral_code: 1,
            // hex_code: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
        .then((data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.colorListSuccess,
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
      Color.aggregate([
        {
          $match: {
            isDeleted: false,
            $or: [
              {
                name: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                code: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              // {
              //   hex_code: {
              //     $regex: "^#" + req.query.search + ".*",
              //     $options: "i",
              //   },
              // },
              // {
              //   ral_code: {
              //     $regex: "^" + req.query.search + ".*",
              //     $options: "i",
              //   },
              // },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            code: 1,
            // ral_code: 1,
            // hex_code: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.colorListSuccess,
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

const deleteColor = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      Color.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.color_id),
          isDeleted: false,
        },
        {
          isDeleted: req.body.is_delete,
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
              message: message.colorDeleteSuccess,
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

const tintersList = async (req: any, res: Response, next: NextFunction) => {
  try {
    let query: any = {
      slug: req?.body?.category,
      isDeleted: false,
    };

    if (req.body?.brandId) {
      query.brandId = req.body.brandId;
    }

    const category = await Category.findOne(query);
    if (!category) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: message.noCategory,
      };
    } else {
      const page = Number(req.query.page);

      const limit = Number(req.query.limit);

      const skip = page * limit;

      const sort = req.query.sort === "desc" ? -1 : 1;

      if (Number(req.query?.limit) !== 0) {
        await Product.aggregate([
          {
            $match: {
              isDeleted: false,
              categoryId: category._id,
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
            $project: {
              _id: 1,
              productName: "$name",
              pack_size: {
                weight: "$weight.value",
                uomID: "$uomDetail._id",
                uom: "$uomDetail.uom_type",
                productQuantity: "$weight.quantityInPack",
              },
              unitPrice: "$price.unitPrice",
              createdAt: { $toLong: "$createdAt" },
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
          .then((tinterProductData) => {
            if (!tinterProductData) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: message.noTinterList,
              };
            } else {
              res.status(constants.code.success).json({
                status: constants.status.statusTrue,
                userStatus: req.status,
                data: tinterProductData,
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
              isDeleted: false,
              categoryId: category._id,
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
            $project: {
              _id: 1,
              productName: "$name",
              pack_size: {
                weight: "$weight.value",
                uomID: "$uomDetail._id",
                uom: "$uomDetail.uom_type",
                productQuantity: "$weight.quantityInPack",
              },
              unitPrice: "$price.unitPrice",
              createdAt: { $toLong: "$createdAt" },
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
                    totalPages: { $sum: [Number(page), Number(1)] },
                  },
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
          .then((tinterProductData) => {
            if (!tinterProductData) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: message.noTinterList,
              };
            } else {
              res.status(constants.code.success).json({
                status: constants.status.statusTrue,
                userStatus: req.status,
                data: tinterProductData,
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
    }
  } catch (error) {
    res.status(constants.code.internalServerError).json({
      status: constants.code.internalServerError,
      userStatus: req.status,
      message: error,
    });
  }
};

const addFinishType = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Brand.exists({ _id: new mongoose.Types.ObjectId(req.body.brand_id) })
    // .then(async(brand_detail)=>{
    //  if(!brand_detail){
    //    throw {
    //      statusCode: constants.code.dataNotFound,
    //      msg: constants.message.invalidBrandId,
    //    };
    //  }else{
    //   //below code will come here
    //  }
    // })
    // .catch((err)=>{
    //   res.status(err.statusCode).json({
    //     status: constants.status.statusFalse,
    //     userStatus: req.status,
    //     message: err.msg,
    //   });
    // })

    FinishType.exists({
      slug: await createSlug(req.body.finish_type),
      isDeleted: false,
      //brandId:new mongoose.Types.ObjectId(req.body.brand_id),
    })
      .then(async (data) => {
        if (data) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: message.alreadyFinishType,
          };
        } else {
          FinishType.create({
            finish_type: req.body.finish_type,
            slug: await createSlug(req.body.finish_type),
            isDeleted: false,
            // brandId:brand_detail._id
          })
            .then((data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.finishTypeSuccess,
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

const updateFinishType = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    FinishType.findOne({
      _id: new mongoose.Types.ObjectId(req.params.finishType_id),
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          FinishType.exists({
            slug: await createSlug(req.body.finish_type),
            _id: {
              $nin: [new mongoose.Types.ObjectId(req.params.finishType_id)],
            },
          })
            .then(async (dataExist) => {
              if (dataExist) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: message.alreadyFinishType,
                };
              } else {
                FinishType.findOneAndUpdate(
                  {
                    _id: new mongoose.Types.ObjectId(req.params.finishType_id),
                    isDeleted: false,
                  },
                  {
                    finish_type: req.body.finish_type,
                    slug: await createSlug(req.body.finish_type),
                  },
                  { new: true }
                )
                  .then((data) => {
                    if (!data) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.finishTypeUpdateSuccess,
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

const finishTypeList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    // let brandFilter = {};
    // if (req.body.brand_id) {
    //   const brandData: any = await Brand.findOne({ _id: new mongoose.Types.ObjectId(req.body.brand_id), isDeleted: false });
    //   if (!brandData) {
    //     throw {
    //       statusCode: constants.code.dataNotFound,
    //       message: message.brandNotFound,
    //     };
    //   }
    //   brandFilter = { brandId: brandData._id };
    // }
    if (Number(req.query.limit) !== 0) {
      FinishType.aggregate([
        {
          $match: {
            isDeleted: false,
            finish_type: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            //...brandFilter
          },
        },
        {
          $project: {
            _id: 1,
            finish_type: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
        .then((data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.finishTypeListSuccess,
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
      FinishType.aggregate([
        {
          $match: {
            isDeleted: false,
            finish_type: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            //...brandFilter
          },
        },
        {
          $project: {
            _id: 1,
            finish_type: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.finishTypeListSuccess,
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

const deleteFinishType = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      FinishType.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.finishType_id),
          isDeleted: false,
        },
        {
          isDeleted: req.body.is_delete,
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
              message: message.finishTypeDeleteSuccess,
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

const addPaintType = async (req: any, res: Response, next: NextFunction) => {
  try {
    PaintType.exists({
      slug: await createSlug(req.body.paint_type),
      isDeleted: false,
    })
      .then(async (data) => {
        if (data) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: message.alreadyPaintType,
          };
        } else {
          PaintType.create({
            paint_type: req.body.paint_type,
            slug: await createSlug(req.body.paint_type),
            isDeleted: false,

          })
            .then((data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.paintTypeSuccess,
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

const updatePaintType = async (req: any, res: Response, next: NextFunction) => {
  try {
    PaintType.findOne({
      _id: new mongoose.Types.ObjectId(req.params.paintType_id),
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          PaintType.exists({
            slug: await createSlug(req.body.paint_type),
            _id: {
              $nin: [new mongoose.Types.ObjectId(req.params.paintType_id)],
            },
            isDeleted:false
          })
            .then(async (dataExist) => {
              if (dataExist) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: message.alreadyPaintType,
                };
              } else {
                PaintType.findOneAndUpdate(
                  {
                    _id: new mongoose.Types.ObjectId(req.params.paintType_id),
                    isDeleted: false,
                  },
                  {
                    paint_type: req.body.paint_type,
                    slug: await createSlug(req.body.paint_type),
                  },
                  { new: true }
                )
                  .then((data) => {
                    if (!data) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.paintTypeUpdateSuccess,
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

const paintTypeList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    // let brandFilter = {};
    // if (req.body.brand_id) {
    //   const brandData: any = await Brand.findOne({ _id: new mongoose.Types.ObjectId(req.body.brand_id), isDeleted: false });
    //   if (!brandData) {
    //     throw {
    //       statusCode: constants.code.dataNotFound,
    //       message: message.brandNotFound,
    //     };
    //   }
    //   brandFilter = { brandId: brandData._id };
    // }

    if (Number(req.query.limit) !== 0) {
      PaintType.aggregate([
        {
          $match: {
            isDeleted: false,
            paint_type: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            //...brandFilter
          },
        },
        {
          $project: {
            _id: 1,
            paint_type: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
        .then((data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.paintTypeListSuccess,
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
      PaintType.aggregate([
        {
          $match: {
            isDeleted: false,
            paint_type: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            //...brandFilter
          },
        },
        {
          $project: {
            _id: 1,
            paint_type: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.paintTypeListSuccess,
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

const deletePaintType = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      PaintType.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.paintType_id),
          isDeleted: false,
        },
        {
          isDeleted: req.body.is_delete,
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
              message: message.paintTypeDeleteSuccess,
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

const addUOM = async (req: any, res: Response, next: NextFunction) => {
  try {
    UOM.exists({
      slug: await createSlug(req.body.uom_type),
      isDeleted: false,
    })
      .then(async (data) => {
        if (data) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: message.alreadyUOM,
          };
        } else {
          UOM.findOneAndUpdate(
            { slug: await createSlug(req.body.uom_type) },
            {
              slug: await createSlug(req.body.uom_type),
              uom_type: req.body.uom_type,
              //brandId:brand_detail._id,
              isDeleted: false,
            },
            { new: true, upsert: true }
          )
            .then((data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.uomSuccess,
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

const updateUOM = async (req: any, res: Response, next: NextFunction) => {
  try {
    UOM.findOne({
      _id: new mongoose.Types.ObjectId(req.params.uom_id),
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          UOM.exists({
            slug: await createSlug(req.body.uom_type),
            _id: { $nin: [new mongoose.Types.ObjectId(req.params.uom_id)] },
          })
            .then(async (dataExist) => {
              if (dataExist) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: message.alreadyUOM,
                };
              } else {
                UOM.findOneAndUpdate(
                  {
                    _id: new mongoose.Types.ObjectId(req.params.uom_id),
                    isDeleted: false,
                  },
                  {
                    uom_type: req.body.uom_type,
                    slug: await createSlug(req.body.uom_type),
                  },
                  { new: true }
                )
                  .then((data) => {
                    if (!data) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.uomUpdateSuccess,
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

const UOMList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    // let brandFilter = {};
    // if (req.body.brand_id) {
    //   const brandData: any = await Brand.findOne({ _id: new mongoose.Types.ObjectId(req.body.brand_id), isDeleted: false });
    //   if (!brandData) {
    //     throw {
    //       statusCode: constants.code.dataNotFound,
    //       message: message.brandNotFound,
    //     };
    //   }
    //   brandFilter = { brandId: brandData._id };
    // }

    if (Number(req.query.limit) !== 0) {
      UOM.aggregate([
        {
          $match: {
            isDeleted: false,
            uom_type: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            // ...brandFilter
          },
        },
        {
          $project: {
            _id: 1,
            uom_type: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
        .then((data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.uomListSuccess,
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
      UOM.aggregate([
        {
          $match: {
            isDeleted: false,
            uom_type: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
            //...brandFilter
          },
        },
        {
          $project: {
            _id: 1,
            uom_type: 1,
            slug: 1,
            isDeleted: 1,
            createdAt: { $toLong: "$createdAt" },
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
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.uomListSuccess,
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

const deleteUOM = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      UOM.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.uom_id),
          isDeleted: false,
        },
        {
          isDeleted: req.body.is_delete,
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
              message: message.uomDeleteSuccess,
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};


export default {
  addBrand,
  brandDetail,
  brandList,
  updateBrand,
  deleteBrand,
  addCategory,
  categoryDetail,
  categoryList,
  updateCategory,
  deleteCategory,
  addSubCategory,
  subCategoryDetail,
  subCategoryList,
  updateSubCategory,
  deleteSubCategory,
  addSubChildCategory,
  subChildCategoryDetail,
  subChildCategoryList,
  updateSubChildCategory,
  deleteSubChildCategory,
  addColor,
  colorList,
  deleteColor,
  tintersList,
  addFinishType,
  updateFinishType,
  finishTypeList,
  deleteFinishType,
  addPaintType,
  updatePaintType,
  paintTypeList,
  deletePaintType,
  addUOM,
  updateUOM,
  UOMList,
  deleteUOM,
};
