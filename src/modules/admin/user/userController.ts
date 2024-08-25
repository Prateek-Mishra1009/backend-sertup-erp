import { Request, Response, NextFunction } from "express";
import constants from "../../../utils/constants";
import message from "./userConstant";
import mongoose from "mongoose";
import User from "../../../models/user";
import {
  createPassword,
  getFileName,
  getUsername,
  hashPassword,
  phoneFormat,
  photoUrl,
  removePhoto,
  toLowerCase,
} from "../../../helpers/helper";
import sendMail from "../../../helpers/mail";
import Department from "../../../models/department";
import Company from "../../../models/company";

const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    const adminDepartment: any = await Department.findOne({
      name: "Administration",
    });
    const userDepartment =
      req?.body?.role === constants.accountLevel.admin
        ? adminDepartment._id
        : req.body.department_id;
    User.findOne({
      $and: [
        { role: constants.accountLevel.manager },
        { department_id: userDepartment },
      ],
    })
      .then(async (managerData) => {
        //if manager does not exist for the department
        if (!managerData) {
          User.create({
            fname: req.body.first_name,
            lname: req.body.last_name,
            email: {
              value: await toLowerCase(req.body.email),
              is_verified: false,
            },
            department_id: userDepartment,
            username: await getUsername(req.body.email),
            password: await hashPassword(
              await createPassword(req.body.first_name, req.body.date_of_birth)
            ),
            phone: { value: req.body.phone, is_verified: false },
            gender: req.body.gender,
            dob: req.body.date_of_birth,
            role: req.body.role,
            privileges: req.body.privileges,
            is_verified: false,
            createdBy: req.id,
          })
            .then(async (data) => {
              if (!data) {
                throw {
                  statusCode: constants.code.dataNotFound,
                  msg: constants.message.dataNotFound,
                };
              } else {
                const payload = {
                  to: data?.email?.value,
                  title: constants.emailTitle.credential,
                  data: {
                    name: data.fname,
                    email: data?.email?.value,
                  },
                };

                await sendMail(payload);

                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: req.status,
                  message: message.userAddSuccess,
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
          // if department has existing manager and we are adding new manager , throw error
          if (req.body.role === constants.accountLevel.manager) {
            throw {
              statusCode: constants.code.preconditionFailed,
              message: message.managerExists,
            };
          } else {
            //if we are adding another roles, apart from manager
            User.create({
              fname: req.body.first_name,
              lname: req.body.last_name,
              email: {
                value: await toLowerCase(req.body.email),
                is_verified: false,
              },
              department_id: userDepartment,
              username: await getUsername(req.body.email),
              password: await hashPassword(
                await createPassword(
                  req.body.first_name,
                  req.body.date_of_birth
                )
              ),
              phone: { value: req.body.phone, is_verified: false },
              gender: req.body.gender,
              dob: req.body.date_of_birth,
              role: req.body.role,
              privileges: req.body.privileges,
              is_verified: false,
              createdBy: req.id,
            })
              .then(async (userData) => {
                if (!userData) {
                  throw {
                    status: constants.code.dataNotFound,
                    message: constants.message.dataNotFound,
                  };
                } else {
                  const payload = {
                    to: userData?.email,
                    title: constants.emailTitle.credential,
                    data: userData?.email,
                  };
                  await sendMail(payload);
                  res.status(constants.code.success).json({
                    status: constants.status.statusTrue,
                    userStatus: req.status,
                    message: constants.message.success,
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
        }
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
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
};

const usersList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = page * limit;
    const sort = req.query.sort === "desc" ? -1 : 1;

    if (Number(req.query.limit) !== 0) {
      User.aggregate([
        {
          $match: {
            _id: { $nin: [new mongoose.Types.ObjectId(req.id)] },
            role: { $nin: [constants.accountLevel.superAdmin] },
            isDeleted: false,
            $or: [
              {
                fname: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                "email.value": {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                "phone.value": {
                  $regex: "^[+]91" + req.query.search + ".*",
                  $options: "i",
                },
              },
            ],
          },
        },
        {
            $lookup: {
              from: "departments",
              localField: "department_id",
              foreignField: "_id",
              as: "department_detail",
            },
          },
          {
            $unwind: {
              path: "$department_detail",
              preserveNullAndEmptyArrays: true,
            },
          },
        {
          $project: {
            _id: 1,
            profilePicture: 1,
            profilePictureUrl: 1,
            fname: 1,
            lname: 1,
            username: 1,
            "department_detail.name":1,
            email: 1,
            phone: 1,
            dob: { $toLong: "$dob" },
            gender: 1,
            status: 1,
            isDeleted: 1,
            role: 1,
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
              message: message.userListSuccess,
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
      User.aggregate([
        {
          $match: {
            _id: { $nin: [new mongoose.Types.ObjectId(req.id)] },
            role: { $nin: [constants.accountLevel.superAdmin] },
            isDeleted: false,
            $or: [
              {
                fname: {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                "email.value": {
                  $regex: "^" + req.query.search + ".*",
                  $options: "i",
                },
              },
              {
                "phone.value": {
                  $regex: "^[+]91" + req.query.search + ".*",
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "department_id",
            foreignField: "_id",
            as: "department_detail",
          },
        },
        {
          $unwind: {
            path: "$department_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            profilePicture: 1,
            profilePictureUrl: 1,
            fname: 1,
            lname: 1,
            username: 1,
            "department_detail.name":1,
            email: 1,
            phone: 1,
            dob: { $toLong: "$dob" },
            gender: 1,
            status: 1,
            isDeleted: 1,
            role: 1,
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
              message: message.userListSuccess,
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
    User.findOne({
      _id: new mongoose.Types.ObjectId(req.params.user_id),
      role: { $nin: [constants.accountLevel.superAdmin] },
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
            message: message.userDetailSuccess,
            data: await data.getUserDetail(),
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

const changeProfilePicture = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    User.findOne({
      _id: new mongoose.Types.ObjectId(req.params.user_id),
      role: { $nin: [constants.accountLevel.superAdmin] },
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if (!data.profilePicture) {
          User.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.params.user_id),
              role: { $nin: [constants.accountLevel.superAdmin] },
              isDeleted: false,
            },
            {
              profilePicture: await photoUrl(
                req.headers.host,
                req.file.filename
              ),
            },
            { new: true }
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
                  message: message.userPictureSuccess,
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
          await removePhoto(await getFileName(data.profilePicture));
          User.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.params.user_id),
              role: { $nin: [constants.accountLevel.superAdmin] },
              isDeleted: false,
            },
            {
              profilePicture: await photoUrl(
                req.headers.host,
                req.file.filename
              ),
            },
            { new: true }
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
                  message: message.userPictureSuccess,
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

const update = async (req: any, res: Response, next: NextFunction) => {
  try {
    //================checkings params id is correct or not==============================//
    User.exists({ _id: req.params.user_id, isDeleted: false })
      .then(async (userData) => {
        if (!userData) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        } else {
          //========================checking phone or email===========================//
          const existingEmail = await User.findOne({
            "email.value": await toLowerCase(req.body.email),
            _id: { $nin: [new mongoose.Types.ObjectId(req.params.user_id)] },
          });

          if (existingEmail) {
            throw {
              statusCode: constants.code.notAcceptable,
              message: constants.message.emailTaken,
            };
          }

          // Check if the phone number already exists
          const existingPhone = await User.findOne({
            "phone.value": await phoneFormat(req.body.phone),
            _id: { $nin: [new mongoose.Types.ObjectId(req.params.user_id)] },
          });

          if (existingPhone) {
            throw {
              statusCode: constants.code.notAcceptable,
              message: constants.message.phoneTaken,
            };
          }

          //=====================checking we are updating manager data or employee /user data=================================
          if (req.body.role != constants.accountLevel.manager) {
            await User.findOneAndUpdate(
              {
                _id: new mongoose.Types.ObjectId(req.params.user_id),
                role: { $nin: [constants.accountLevel.superAdmin] },
                isDeleted: false,
              },
              {
                fname: req.body.first_name,
                lname: req.body.last_name,

                email: {
                  value: await toLowerCase(req.body.email),
                  is_verified: false,
                },
                password: await hashPassword(
                  await createPassword(req.body.first_name, req.body.date_of_birth)
                ),
                phone: { value: req.body.phone, is_verified: false },
                gender: req.body.gender,
                dob: req.body.date_of_birth,
                role: req.body.role,
                department_id: new mongoose.Types.ObjectId(
                  req.body.department_id
                ),
                privileges: req.body.privileges,
              },
              { new: true }
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
                    message: message.userUpdateSuccess,
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
            //n
            User.findOne({
              _id: {
                $nin: [new mongoose.Types.ObjectId(req.params.user_id)],
              },
              role: constants.accountLevel.manager,
              department_id: new mongoose.Types.ObjectId(
                req.body.department_id
              ),
            })
              .then(async (managerExists) => {
                if (managerExists) {
                  throw {
                    statusCode: constants.code.preconditionFailed,
                    message: message.managerExists,
                  };
                } else {
                  User.findOneAndUpdate(
                    {
                      _id: new mongoose.Types.ObjectId(req.params.user_id),
                      role: { $nin: [constants.accountLevel.superAdmin] },
                      isDeleted: false,
                    },
                    {
                      fname: req.body.first_name,
                      lname: req.body.last_name,
                      email: {
                        value: await toLowerCase(req.body.email),
                      },
                      phone: { value: req.body.phone, is_verified: false },
                      gender: req.body.gender,
                      password: await hashPassword(
                        await createPassword(req.body.first_name, req.body.date_of_birth)
                      ),
                      dob: req.body.date_of_birth,
                      role: req.body.role,
                      department_id: new mongoose.Types.ObjectId(
                        req.body.department_id
                      ),
                      privileges: req.body.privileges,
                    },
                    { new: true }
                  ).then((updatedManager) => {
                    if (!updatedManager) {
                      throw {
                        statusCode: constants.code.dataNotFound,
                        msg: message.userUpdateFailed,
                      };
                    } else {
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: req.status,
                        message: message.userUpdateSuccess,
                      });
                    }
                  });
                }
              })
              .catch((err) => {
                res.status(err.statusCode).json({
                  status: constants.status.statusFalse,
                  userStatus: req.status,
                  err: err.message,
                });
              });
          }
        }
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          statusCode: constants.status.statusFalse,
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
};

const resetPassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    User.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.user_id),
        role: { $nin: [constants.accountLevel.superAdmin] },
        isDeleted: false,
      },
      {
        password: await hashPassword(req.body.password),
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
            message: constants.message.passChange,
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

const manageAccount = async (req: any, res: Response, next: NextFunction) => {
  try {
    User.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.user_id),
        role: { $nin: [constants.accountLevel.superAdmin] },
        isDeleted: false,
      },
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    )
      .then((data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if (!data.status) {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.accDeactivated,
          });
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.accActivated,
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

// const deleteAccount = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     if (!req.body.is_delete) {
//       throw {
//         statusCode: constants.code.preconditionFailed,
//         msg: constants.message.invalidType,
//       };
//     } else {
//       User.findOneAndUpdate(
//         {
//           _id: new mongoose.Types.ObjectId(req.params.user_id),
//           role: { $nin: [constants.accountLevel.superAdmin] },
//           isDeleted: false,
//         },
//         {
//           isDeleted: req.body.is_delete,
//           deletedBy: req.id,
//         }
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
//               message: message.accDeleted,
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


const deleteAccount = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      const userIds:any = [];
      for (let i = 0; i <= req.body.user_ids.length; i++) {
        userIds.push(new mongoose.Types.ObjectId(req.body.user_ids[i]));
      }
      User.updateMany(
        {
          _id: { $in: userIds},
          role: { $nin: [constants.accountLevel.superAdmin] },
          isDeleted: false,
          status: true,
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
              message: message.accDeleted,
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
const deactivateAccount = async (req: any, res: Response, next: NextFunction) => {
  try {
    // if (req.body.status) {
    //   throw {
    //     statusCode: constants.code.preconditionFailed,
    //     msg: constants.message.invalidType,
    //   };
    // } else {
      User.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.user_id),
          role: { $nin: [constants.accountLevel.superAdmin] },
          isDeleted: false,
        },
        {
          status: req.body.status,
          updatedBy: req.id,
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
              message: !req.body.status?message.accDeactivated:message.accActivated,
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
    // }
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

export default {
  create,
  usersList,
  detail,
  changeProfilePicture,
  update,
  resetPassword,
  manageAccount,
  deleteAccount,
  deactivateAccount
};
