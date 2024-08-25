import { Request, Response, NextFunction } from "express";
import constants from "../../../utils/constants";
import Department from "../../../models/department";
import message from "./departmentConstant";
import User from "../../../models/user";
import { createSlug } from "../../../helpers/helper";
import mongoose from "mongoose";

const addDepartment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const departmentExists: any = await Department.findOne({
      slug: await createSlug(req.body.name),
      isDeleted: false,
      status: true,
    })
      .then(async (departmentExists) => {
        if (departmentExists) {
          throw {
            statusCode: constants.code.badRequest,
            message: message.departmentExists,
          };
        } else {
          Department.create({
            name: req.body.name,
            slug: await createSlug(req.body.name),
            description: req.body.description,
          })
            .then((departmentDetail) => {
              if (!departmentDetail) {
                throw {
                  statusCode: constants.code.badRequest,
                  message: message.departmentAddFailed,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.departmentSuccess,
                });
              }
            })
            .catch((err) => {
              res
                .status(err.statusCode || constants.code.preconditionFailed)
                .json({
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: err.message || message.departmentAddFailed,
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

// const deleteDepartment = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (!req.body.is_delete) {
//       throw {
//         statusCode: constants.code.preconditionFailed,
//         msg: constants.message.invalidType,
//       };
//     } else {
//       Department.findOneAndUpdate(
//         {
//           _id: new mongoose.Types.ObjectId(req.params.department_id),
//           isDeleted: false,
//         },
//         {
//           isDeleted: req.body.is_delete,
//         },
//         { new: true }
//       )
//         .then((data) => {
//           if (!data) {
//             throw {
//               statusCode: constants.code.dataNotFound,
//               msg: constants.message.dataNotFound,
//             };
//           } else {
//             res.status(constants.code.success).json({
//               status: constants.status.statusTrue,
//               userStatus: req.status,
//               message: message.departmentdelete,
//             });
//           }
//         })
//         .catch((err) => {
//           res.status(err.statusCode).json({
//             status: constants.status.statusFalse,
//             userStatus: req.status,
//             message: err.msg,
//           });
//         });
//     }
//   } catch (err: any) {
//     res.status(err.statusCode).json({
//       status: constants.status.statusFalse,
//       userStatus: req.status,
//       message: err.msg,
//     });
//   }
// };


const deleteDepartment = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      const departmentIds:any = [];
      for (let i = 0; i <= req.body.department_ids.length; i++) {
        departmentIds.push(new mongoose.Types.ObjectId(req.body.department_ids[i]));
      }
      Department.updateMany(
        {
          _id: { $in: departmentIds },
          isDeleted: false,
          status:true
        },
        {
          isDeleted: req.body.is_delete,
          deletedBy: req.id,
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
              message: message.departmentdelete,
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


const updateDepartment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    Department.exists({
      _id: { $nin: [new mongoose.Types.ObjectId(req.params.department_id)] },
      slug: await createSlug(req.body.name),
      isDeleted: false,
    })
      .then(async (data) => {
        if (data) {
          throw {
            statusCode: constants.code.badRequest,
            message: message.departmentExists,
          };
        } else {
          Department.findOneAndUpdate(
            { _id: req.params.department_id, isDeleted: false, status: true },
            {
              name: req.body.name,
              slug: await createSlug(req.body.name),
              description: req.body.description,
            },
            { upsert: true }
          )
            .then((updatedDepartment) => {
              if (!updatedDepartment) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  message: constants.code.dataNotFound,
                };
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.updateSuccess,
                });
              }
            })
            .catch((err) => {
              res
                .status(err.statusCode || constants.code.preconditionFailed)
                .json({
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  message: err.message || err,
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

const getDepartmentList = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;

    if (Number(req.query?.limit) !== 0) {
      await Department.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
          },
        },
        { $sort: { createdAt: -1 } },

        {
          $lookup: {
            from: "users",
            let: { department_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$department_id", "$$department_id"] },
                      { $eq: ["$role", constants.accountLevel.manager] },
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
            as: "manager",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            manager: {
              $arrayElemAt: [
                [
                  {
                    $concat: [
                      { $arrayElemAt: ["$manager.fname", 0] },
                      " ",
                      { $arrayElemAt: ["$manager.lname", 0] },
                    ],
                  },
                ],
                0,
              ],
            },
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
        .then((departmentData) => {
          if (!departmentData) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: message.noDepartmentFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              data: departmentData,
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
      await Department.aggregate([
        {
          $match: {
            isDeleted: false,
            name: {
              $regex: "^" + req.query.search + ".*",
              $options: "i",
            },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            let: { department_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$department_id", "$$department_id"] },
                      { $eq: ["$role", constants.accountLevel.manager] },
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
            as: "manager",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            manager: {
              $arrayElemAt: [
                [
                  {
                    $concat: [
                      { $arrayElemAt: ["$manager.fname", 0] },
                      " ",
                      { $arrayElemAt: ["$manager.lname", 0] },
                    ],
                  },
                ],
                0,
              ],
            },
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
        .then((departmentData) => {
          if (!departmentData) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: message.noDepartmentFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              data: departmentData,
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
    res.status(constants.code.internalServerError).json({
      status: constants.code.internalServerError,
      userStatus: req.status,
      message: error,
    });
  }
};

const getDepartment = async (req: any, res: Response, next: NextFunction) => {
  try {
    Department.findOne({
      _id: req.params.department_id,
      isDeleted: false,
      status: true,
    })
      .then((data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        } else {
          Department.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(req.params.department_id),
                isDeleted: false,
              },
            },
            {
              $lookup: {
                from: "users",
                let: { department_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$department_id", "$$department_id"] },
                          { $eq: ["$role", constants.accountLevel.manager] },
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
                as: "manager",
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
                description: 1,
                manager: {
                  $arrayElemAt: [
                    [
                      {
                        $concat: [
                          { $arrayElemAt: ["$manager.fname", 0] },
                          " ",
                          { $arrayElemAt: ["$manager.lname", 0] },
                        ],
                      },
                    ],
                    0,
                  ],
                },
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
                  message: constants.message.success,
                  data: data,
                });
              }
            })
            .catch((err) => {
              res.status(constants.code.preconditionFailed).json({
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
          message: constants.message.dataNotFound,
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

const searchDepartment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    Department.aggregate([
      {
        $match: {
          name: { $regex: "^" + req.body.name + ".*", $options: "i" },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { department_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$department_id", "$$department_id"] },
                    { $eq: ["$role", constants.accountLevel.manager] },
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
          as: "manager",
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          description: 1,
          manager: {
            $arrayElemAt: [
              [
                {
                  $concat: [
                    { $arrayElemAt: ["$manager.fname", 0] },
                    " ",
                    { $arrayElemAt: ["$manager.lname", 0] },
                  ],
                },
              ],
              0,
            ],
          },
        },
      },

      {
        $sort: { name: 1 },
      },
      {
        $limit: 2,
      },
    ])
      .then((data: any) => {
        if (!data.length) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.success,
            data: data,
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
const getAllDepartment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    Department.find({ isDeleted: false })
      .then((departments) => {
        res.status(constants.code.success).json({
          status: constants.status.statusTrue,
          userStatus: req.status,
          data: departments,
        });
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
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

export default {
  getDepartmentList,
  addDepartment,
  deleteDepartment,
  updateDepartment,
  getDepartment,
  searchDepartment,
  getAllDepartment,
};
