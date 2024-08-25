import { Request, Response, NextFunction } from "express";
import constants from "../../../../utils/constants";
import Bank from "../../../../models/bank";
import User from "../../../../models/user";
import {
  createSlug,
  imageUrl,
  removeImage,
  getFileName,
} from "../../../../helpers/helper";
import message from "./bankConstant";
import mongoose from "mongoose";

const addBank = async (req: any, res: Response, next: NextFunction) => {
    try {
        let createdBy = req.id;
    if (req.role === constants.accountLevel.admin) {
      const userDetail = await User.findById({
        _id: new mongoose.Types.ObjectId(req.id),
        role: constants.accountLevel.admin,
      });

      createdBy = userDetail?.createdBy;
    }
      await Bank.findOne({
        account_no: req.body.account_no.value,
        isDeleted: false,
        status: true,
      })
        .then(async (bankExists) => {
          if (bankExists) {
            throw {
              statusCode: constants.code.badRequest,
              message: message.bankExists,
            };
          } else {
            Bank.create({
              companyId: new mongoose.Types.ObjectId(req.company_id),
              bank_name: req.body.bank_name,
              branch_name: req.body.branchName,
              ifsc: req.body.ifsc,
              account_name: req.body.accountName,
              account_no: {
                value: req.body.account_no.value
              } ,
              account_type: req.body.accountType,
            })
              .then((bankDetail) => {
                if (!bankDetail) {
                  throw {
                    statusCode: constants.code.badRequest,
                    message: message.bankFailed,
                  };
                } else {
                  res.status(constants.code.success).json({
                    status: constants.status.statusTrue,
                    userStatus: req.status,
                    message: message.bankAdded,
                  });
                }
              })
              .catch((err) => {
                res
                  .status(err.statusCode || constants.code.preconditionFailed)
                  .json({
                    status: constants.status.statusFalse,
                    userStatus: req.status,
                    message: err.message || message.bankFailed,
                  });
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
      res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: error,
      });
    }
  };
  
  const updateBank = async (req: any, res: Response, next: NextFunction) => {
    try {
      Bank.exists({
        _id: {
          $nin: [new mongoose.Types.ObjectId(req.params.bank_id)],
        },
        account_no: req.body.account_no.value,
        isDeleted: false,
      })
        .then(async (data) => {
          if (data) {
            throw {
              statusCode: constants.code.badRequest,
              message: message.bankExists,
            };
          } else {
            Bank.findOneAndUpdate(
              {
                _id: new mongoose.Types.ObjectId(req.params.bank_id),
                isDeleted: false,
              },
              {
                companyId: new mongoose.Types.ObjectId(req.body.company_id),
                bank_name: req.body.bank_name,
                branch_name: req.body.branchName,
                ifsc: req.body.ifsc,
                account_name: req.body.accountName,
                account_no: {
                value: req.body.account_no.value
              } ,
              account_type: req.body.accountType,
              },
              { upsert: true }
            )
              .then((updateBank) => {
                if (!updateBank) {
                  throw {
                    statusCode: constants.code.preconditionFailed,
                    message: constants.code.dataNotFound,
                  };
                } else {
                  res.status(constants.code.success).json({
                    status: constants.status.statusTrue,
                    userStatus: req.status,
                    message: message.bankUpdated,
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
            message: err.message,
          });
        });
    } catch (err) {
      res.status(constants.code.internalServerError).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err,
      });
    }
  
  }
  
  
  
  const listBank = async (req: any, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const skip = page * limit;
      const sort = req.query.sort === "desc" ? -1 : 1;
  
      if (Number(req.query.limit) !== 0) {
        Bank.aggregate([
            {
                $match: {
                  isDeleted: false,
                  branch_name: {
                    $regex: "^" + req.query.search + ".*",
                    $options: "i",
                  },
                  account_name: {
                    $regex: "^" + req.query.search + ".*",
                    $options: "i",
                  },
                  "account_no.value": {
                    $regex: "^" + req.query.search + ".*",
                    $options: "i",
                  }
                 
                },
              },
        //   {
        //     $match: {
        //         isDelete: false,
        //       $or: [
        //         {
        //           branch_name: {
        //             $regex: "^" + req.query.search + ".*",
        //             $options: "i",
        //           },
        //         },
        //         {
        //           account_name: {
        //             $regex: "^" + req.query.search + ".*",
        //             $options: "i",
        //           },
        //         },
        //         {
        //           "account_no.value": {
        //         $regex: "^" + req.query.search + ".*",
        //         $options: "i",
        //       }
        //         }
  
        //       ],
        //     }
        //   },
           
          {
            $project: {
              _id: 1,
              companyId: 1,
              bank_name:1,
              branch_name: 1,
              ifsc: 1,
              account_no: 1,
              account_name: 1,
              account_type: 1,
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
            if (!data[0].data.length) {
              throw {
                statusCode: constants.code.dataNotFound,
                msg: constants.message.dataNotFound,
              };
            } else {
              res.status(constants.code.success).json({
                status: constants.status.statusTrue,
                userStatus: req.status,
                message: message.bankList,
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
        Bank.aggregate([
            {
                $match: {
                  isDeleted: false,
                  branch_name: {
                    $regex: "^" + req.query.search + ".*",
                    $options: "i",
                  },
                  account_name: {
                    $regex: "^" + req.query.search + ".*",
                    $options: "i",
                  },
                  "account_no.value": {
                    $regex: "^" + req.query.search + ".*",
                    $options: "i",
                  }
                 
                },
              },
          {
            $project: {
              _id: 1,
              companyId: 1,
              bank_name: 1,
              branch_name: 1,
              ifsc: 1,
              account_no: 1,
              account_name: 1,
              account_type: 1,
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
            if (!data[0].data.length) {
              throw {
                statusCode: constants.code.dataNotFound,
                msg: constants.message.dataNotFound,
              };
            } else {
              res.status(constants.code.success).json({
                status: constants.status.statusTrue,
                userStatus: req.status,
                message: message.bankList,
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
  }
  
  const bankDetail = async (req: any, res: Response, next: NextFunction) => {
    try {
      Bank.findOne({
        _id: new mongoose.Types.ObjectId(req.params.bank_id),
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
              message: message.bankDetail,
              data: await data.getBankDetail(),
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
  }
  
  
  
  const deleteBank = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.body.is_delete) {
        throw {
          statusCode: constants.code.preconditionFailed,
          msg: constants.message.invalidType,
        };
      } else {
        Bank.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(req.params.bank_id),
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
                message: message.bankDeleted,
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
  }


export default {
    addBank,
    updateBank,
    listBank,
    bankDetail,
    deleteBank
  }