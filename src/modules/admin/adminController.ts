import { Request, Response, NextFunction } from "express";
import constants from "../../utils/constants";
import mongoose from "mongoose";
import User from "../../models/user";
import Device from "../../models/device";
import {
  checkPassword,
  createSlug,
  generateAddressSlug,
  getFileName,
  getIPInfo,
  getPinDetail,
  hashPassword,
  jwtDecode,
  logoUrl,
  minutes,
  phoneFormat,
  photoUrl,
  randomToken,
  removeLogo,
  removePhoto,
  toLowerCase,
} from "../../helpers/helper";
import {
  createToken,
  createTokenMobile,
  deleteAllToken,
  deleteToken,
} from "../../helpers/token";
import OTP from "../../models/otp";
import sendMail from "../../helpers/mail";
import Company from "../../models/company";
import Address from "../../models/address";
import message from "./company/companyConstant";

const login = async (req: any, res: Response, next: NextFunction) => {
  try {
    User.findOne({ "email.value": await toLowerCase(req.body.email) })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.invalidEmail,
          };
        } else if (
          (await checkPassword(req.body.password, data.password)) !== true
        ) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.invalidPassword,
          };
        } else if (!data.status) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.userInactive,
          };
        } else if (data.isDeleted) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.userDeleted,
          };
        } else if (
          data.role !== constants.accountLevel.superAdmin &&
          data.role !== constants.accountLevel.admin &&
          data.role !== constants.accountLevel.manager
        ) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.invalidUser,
          };
        } else {
          Device.findOneAndUpdate(
            { deviceId: req.body.device_info.device_id, userId: data._id },
            {
              userId: data._id,
              deviceId: req.body.device_info.device_id,
              appId: req.body.device_info.app_id,
              name: req.body.device_info.name,
              model: req.body.device_info.model,
              platform: req.body.device_info.platform,
              version: req.body.device_info.version,
              ipAddress: req.body.device_info.ip,
              latitude: req.body.device_info.latitude,
              longitude: req.body.device_info.longitude,
              createdBy: data._id,
            },
            {
              upsert: true,
              new: true,
            }
          )
            .then(async (device_detail) => {
              if (!device_detail) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                const payload = {
                  id: data._id,
                };
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: data.status,
                  message: constants.message.userLogin,
                  token:
                    req.body.device_info.platform !==
                      constants.deviceTypes.android &&
                    req.body.device_info.platform !==
                      constants.deviceTypes.iphone
                      ? await createToken(payload)
                      : await createTokenMobile(payload),
                  data: await data.getAuthDetail(),
                });
              }
            })
            .catch((err) => {
              res.status(err.statusCode).json({
                status: constants.status.statusFalse,
                userStatus: constants.status.statusFalse,
                message: err.msg,
              });
            });
        }
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: constants.status.statusFalse,
          message: err.msg,
        });
      });
  } catch (err) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: constants.status.statusFalse,
      message: err,
    });
  }
};

const getDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    User.findOne({
      _id: new mongoose.Types.ObjectId(req.id),
      $or: [
        { role: constants.accountLevel.superAdmin },
        { role: constants.accountLevel.admin },
        { role: constants.accountLevel.manager },
      ],
      status: true,
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
            message: constants.message.userDetail,
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
      _id: new mongoose.Types.ObjectId(req.id),
      $or: [
        { role: constants.accountLevel.superAdmin },
        { role: constants.accountLevel.admin },
        { role: constants.accountLevel.manager },
      ],
      status: true,
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
              _id: new mongoose.Types.ObjectId(req.id),
              $or: [
                { role: constants.accountLevel.superAdmin },
                { role: constants.accountLevel.admin },
                { role: constants.accountLevel.manager },
              ],
              status: true,
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
                  message: constants.message.profileSuccess,
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
              _id: new mongoose.Types.ObjectId(req.id),
              $or: [
                { role: constants.accountLevel.superAdmin },
                { role: constants.accountLevel.admin },
                { role: constants.accountLevel.manager },
              ],
              status: true,
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
                  message: constants.message.profileSuccess,
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

const updateDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    User.exists({ _id: req.id, isDeleted: false })
      .then(async (userData) => {
        if (!userData) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        } else {
          const existingPhone = await User.findOne({
            "phone.value": await phoneFormat(req.body.phone),
            _id: { $nin: [new mongoose.Types.ObjectId(req.id)] },
          });

          if (existingPhone) {
            throw {
              statusCode: constants.code.notAcceptable,
              message: constants.message.phoneTaken,
            };
          }

          User.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.id),
              $or: [
                { role: constants.accountLevel.superAdmin },
                { role: constants.accountLevel.admin },
                { role: constants.accountLevel.manager },
              ],
              status: true,
              isDeleted: false,
            },
            {
              fname: req.body.first_name,
              lname: req.body.last_name,
              gender: req.body.gender,
              dob: req.body.date_of_birth,
              "phone.value": await phoneFormat(req.body.phone),
            },
            { new: true }
          )
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
                  message: constants.message.userUpdate,
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

const verifyEmail = async (req: any, res: Response, next: NextFunction) => {
  try {
    OTP.findOne({ email: await toLowerCase(req.body.email) })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if ((await minutes(data.updatedAt)) >= 5) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.otpExpire,
          };
        } else if (data.otp !== req.body.otp) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.invalidOTP,
          };
        } else {
          User.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.id),
              "email.value": await toLowerCase(data.email),
              $or: [
                { role: constants.accountLevel.superAdmin },
                { role: constants.accountLevel.admin },
                { role: constants.accountLevel.manager },
              ],
              status: true,
              isDeleted: false,
            },
            {
              "email.is_verified": true,
            },
            { new: true }
          )
            .then(async (user_detail) => {
              if (!user_detail) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                OTP.findOneAndDelete({
                  email: await toLowerCase(data.email),
                })
                  .then((data) => {
                    res.status(constants.code.success).json({
                      status: constants.status.statusTrue,
                      userStatus: req.status,
                      message: constants.message.emailVerified,
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

const verifyPhone = async (req: any, res: Response, next: NextFunction) => {
  try {
    OTP.findOne({ phone: req.body.phone })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if ((await minutes(data.updatedAt)) >= 5) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.otpExpire,
          };
        } else if (data.otp !== req.body.otp) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.invalidOTP,
          };
        } else {
          User.findOne({
            _id: new mongoose.Types.ObjectId(req.id),
            $or: [
              { role: constants.accountLevel.superAdmin },
              { role: constants.accountLevel.admin },
              { role: constants.accountLevel.manager },
            ],
            status: true,
            isDeleted: false,
          })
            .then((user_detail) => {
              if (!user_detail) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: constants.message.invalidPhone,
                };
              } else if (!user_detail.email?.is_verified) {
                throw {
                  statusCode: constants.code.notAcceptable,
                  msg: constants.message.verifyEmail,
                };
              } else {
                User.findOneAndUpdate(
                  {
                    _id: new mongoose.Types.ObjectId(req.id),
                    "phone.value": data.phone,
                    $or: [
                      { role: constants.accountLevel.superAdmin },
                      { role: constants.accountLevel.admin },
                      { role: constants.accountLevel.manager },
                    ],
                    status: true,
                    isDeleted: false,
                  },
                  {
                    "phone.is_verified": true,
                    is_verified: true,
                  },
                  { new: true }
                )
                  .then(async (user_detail) => {
                    if (!user_detail) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      OTP.findOneAndDelete({
                        phone: data.phone,
                      })
                        .then((data) => {
                          res.status(constants.code.success).json({
                            status: constants.status.statusTrue,
                            userStatus: req.status,
                            message: constants.message.phoneVerified,
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

const updateEmail = async (req: any, res: Response, next: NextFunction) => {
  try {
    OTP.findOne({ email: await toLowerCase(req.body.email) })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if ((await minutes(data.updatedAt)) >= 5) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.otpExpire,
          };
        } else if (data.otp !== req.body.otp) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.invalidOTP,
          };
        } else {
          User.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.id),
              $or: [
                { role: constants.accountLevel.superAdmin },
                { role: constants.accountLevel.admin },
                { role: constants.accountLevel.manager },
              ],
              status: true,
              isDeleted: false,
            },
            {
              email: {
                value: await toLowerCase(data.email),
                is_verified: true,
              },
            },
            { new: true }
          )
            .then(async (user_detail) => {
              if (!user_detail) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                OTP.findOneAndDelete({
                  email: await toLowerCase(data.email),
                })
                  .then((data) => {
                    res.status(constants.code.success).json({
                      status: constants.status.statusTrue,
                      userStatus: req.status,
                      message: constants.message.emailUpdated,
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

const updatePhone = async (req: any, res: Response, next: NextFunction) => {
  try {
    OTP.findOne({ phone: req.body.phone })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if ((await minutes(data.updatedAt)) >= 5) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.otpExpire,
          };
        } else if (data.otp !== req.body.otp) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.invalidOTP,
          };
        } else {
          User.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(req.id),
              $or: [
                { role: constants.accountLevel.superAdmin },
                { role: constants.accountLevel.admin },
                { role: constants.accountLevel.manager },
              ],
              status: true,
              isDeleted: false,
            },
            {
              phone: {
                value: data.phone,
                is_verified: true,
              },
            },
            { new: true }
          )
            .then(async (user_detail) => {
              if (!user_detail) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                OTP.findOneAndDelete({
                  phone: data.phone,
                })
                  .then((data) => {
                    res.status(constants.code.success).json({
                      status: constants.status.statusTrue,
                      userStatus: req.status,
                      message: constants.message.phoneUpdated,
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

const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (req.body.old_password === req.body.new_password) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.diffPassword,
      };
    } else {
      User.findOne({
        _id: new mongoose.Types.ObjectId(req.id),
        $or: [
          { role: constants.accountLevel.superAdmin },
          { role: constants.accountLevel.admin },
          { role: constants.accountLevel.manager },
        ],
        status: true,
        isDeleted: false,
      })
        .then(async (data: any) => {
          if (!data) {
            throw {
              statusCode: constants.code.dataNotFound,
              msg: constants.message.dataNotFound,
            };
          } else if (
            (await checkPassword(req.body.old_password, data.password)) !== true
          ) {
            throw {
              statusCode: constants.code.preconditionFailed,
              msg: constants.message.invalidOldPassword,
            };
          } else {
            User.findOneAndUpdate(
              {
                _id: new mongoose.Types.ObjectId(req.id),
                $or: [
                  { role: constants.accountLevel.superAdmin },
                  { role: constants.accountLevel.admin },
                  { role: constants.accountLevel.manager },
                ],
                status: true,
                isDeleted: false,
              },
              {
                password: await hashPassword(req.body.new_password),
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

const manageAuthentication = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    User.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.id),
        $or: [
          { role: constants.accountLevel.superAdmin },
          { role: constants.accountLevel.admin },
          { role: constants.accountLevel.manager },
        ],
        status: true,
        isDeleted: false,
      },
      {
        is_2FA: {
          value: req.body.is_2FA,
          is_verified: false,
        },
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
        } else if (!data.is_2FA?.value) {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.twoFactorOff,
          });
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.twoFactoreOn,
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

const managePushNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    User.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.id),
        $or: [
          { role: constants.accountLevel.superAdmin },
          { role: constants.accountLevel.admin },
          { role: constants.accountLevel.manager },
        ],
        status: true,
        isDeleted: false,
      },
      {
        "notification.push_notification": req.body.is_notification,
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
        } else if (!data.notification?.push_notification) {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.pushNotificationOff,
          });
        } else {
          ``;
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.pushNotificationOn,
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

const manageEmailNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    User.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.id),
        $or: [
          { role: constants.accountLevel.superAdmin },
          { role: constants.accountLevel.admin },
          { role: constants.accountLevel.manager },
        ],
        status: true,
        isDeleted: false,
      },
      {
        "notification.email_notification": req.body.is_notification,
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
        } else if (!data.notification?.email_notification) {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.emailNotificationOff,
          });
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.emailNotificationOn,
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

const manageMessageNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    User.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.id),
        $or: [
          { role: constants.accountLevel.superAdmin },
          { role: constants.accountLevel.admin },
          { role: constants.accountLevel.manager },
        ],
        status: true,
        isDeleted: false,
      },
      {
        "notification.sms_notification": req.body.is_notification,
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
        } else if (!data.notification?.sms_notification) {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.messageNotificationOff,
          });
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: constants.message.messageNotificationOn,
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

const deactivateAccount = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.status) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      User.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.id),
          $or: [
            { role: constants.accountLevel.superAdmin },
            { role: constants.accountLevel.admin },
            { role: constants.accountLevel.manager },
          ],
          status: true,
          isDeleted: false,
        },
        {
          status: req.body.status,
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
              message: constants.message.userDisable,
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

const deleteAccount = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      User.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.id),
          $or: [
            { role: constants.accountLevel.superAdmin },
            { role: constants.accountLevel.admin },
            { role: constants.accountLevel.manager },
          ],
          status: true,
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
              message: constants.message.userRemove,
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

const logout = async (req: any, res: Response, next: NextFunction) => {
  try {
    User.findOne({
      _id: new mongoose.Types.ObjectId(req.id),
      $or: [
        { role: constants.accountLevel.superAdmin },
        { role: constants.accountLevel.admin },
        { role: constants.accountLevel.manager },
      ],
      status: true,
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          await deleteToken(req.token);
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: constants.status.statusFalse,
            message: constants.message.logout,
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

const logoutFromAll = async (req: any, res: Response, next: NextFunction) => {
  try {
    User.findOne({
      _id: new mongoose.Types.ObjectId(req.id),
      $or: [
        { role: constants.accountLevel.superAdmin },
        { role: constants.accountLevel.admin },
        { role: constants.accountLevel.manager },
      ],
      status: true,
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          await deleteAllToken(req.token);
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: constants.status.statusFalse,
            message: constants.message.logoutAll,
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

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    User.findOneAndUpdate(
      {
        "email.value": await toLowerCase(req.body.email),
        $or: [
          { role: constants.accountLevel.superAdmin },
          { role: constants.accountLevel.admin },
          { role: constants.accountLevel.manager },
        ],
      },
      {
        verifyToken: await randomToken(),
      },
      {
        new: true,
      }
    )
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.invalidEmail,
          };
        } else {
          const payload = {
            to: data?.email.value,
            title: constants.emailTitle.resetPassword,
            data: `${process.env.ADMIN}${data.verifyToken}`,
          };
          await sendMail(payload);
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: constants.status.statusFalse,
            message: constants.message.resetEmail,
          });
        }
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: constants.status.statusFalse,
          message: err.msg,
        });
      });
  } catch (err) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: constants.status.statusFalse,
      message: err,
    });
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    User.findOne({
      verifyToken: req.body.verify_token,
      $or: [
        { role: constants.accountLevel.superAdmin },
        { role: constants.accountLevel.admin },
        { role: constants.accountLevel.manager },
      ],
    })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.invalidVerifyToken,
          };
        } else if ((await minutes(data.updatedAt)) >= 10) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.tokenExpire,
          };
        } else if (
          (await checkPassword(req.body.password, data.password)) === true
        ) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.diffPassword,
          };
        } else {
          User.findOneAndUpdate(
            {
              verifyToken: req.body.verify_token,
              $or: [
                { role: constants.accountLevel.superAdmin },
                { role: constants.accountLevel.admin },
                { role: constants.accountLevel.manager },
              ],
            },
            {
              password: await hashPassword(req.body.password),
              verifyToken: null,
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
              } else {
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: constants.status.statusFalse,
                  message: constants.message.passChange,
                });
              }
            })
            .catch((err) => {
              res.status(err.statusCode).json({
                status: constants.status.statusFalse,
                userStatus: constants.status.statusFalse,
                message: err.msg,
              });
            });
        }
      })
      .catch((err) => {
        res.status(err.statusCode).json({
          status: constants.status.statusFalse,
          userStatus: constants.status.statusFalse,
          message: err.msg,
        });
      });
  } catch (err) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: constants.status.statusFalse,
      message: err,
    });
  }
};

const updateCompany = async (req: any, res: Response, next: NextFunction) => {
  try {
    const pinData = await getPinDetail(req.body.pin_code);

    if (!pinData) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: constants.message.dataNotFound,
      };
    }
    const emailExists: any = await Company.exists({
      "companyEmail.value": await toLowerCase(req.body.email),
      isCompanyErp: { $nin: [true] },
    });

    const phoneExists: any = await Company.exists({
      "companyPhone.value": req.body.phone,
      isCompanyErp: { $nin: [true] },
    });

    if (emailExists) {
      throw {
        statusCode: constants.code.notAcceptable,
        message: constants.message.emailTaken,
      };
    } else if (phoneExists) {
      throw {
        statusCode: constants.code.notAcceptable,
        message: constants.message.phoneTaken,
      };
    }
    await Company.findOneAndUpdate(
      { isCompanyErp: true, isDeleted: false },
      {
        name: req.body.name,
        slug: await createSlug(req.body.name),
        "gst.value": req.body.gstNumber,
        foundingYear: req.body.year,
        isCompanyErp: true,
        industry: req.body.industry,
        about: req.body.about,
        companyEmail: {
          value: await toLowerCase(req.body.email),
        },
        companyPhone: {
          value: await req.body.phone,
        },
        createdBy: req.id,
        updatedBy: req.id,
      },
      { new: true, upsert: true }
    )
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.badRequest,
            message: constants.message.dataNotFound,
          };
        } else {
          await Address.findOneAndUpdate(
            {
              companyId: data._id,
              isDeleted: false,
              type: constants.addressTypes.work,
              // constraint: constants.constraint.primary,
            },
            {
              slug: await generateAddressSlug(
                req.body.name,
                constants.addressTypes.work,
                pinData.pinCode
              ),
              companyId: data._id,
              name: req.body.name,
              email: await toLowerCase(req.body.email),
              phone: req.body.phone,
              address: {
                line_one: req.body.line_one,
                line_two: req.body.line_two,
                city: pinData.cityId,
                state: pinData.stateId,
                country: pinData.countryId,
                pin_code: req.body.pin_code,
              },
              type: constants.addressTypes.work,
              // constraint: constants.constraint.primary,
              updatedBy: req.id,
            },
            { new: true, upsert: true }
          ).then((updatedAddress) => {
            if (!updatedAddress) {
              throw {
                statusCode: constants.code.preconditionFailed,
                message: message.addAddFailed,
              };
            } else {
              res.status(constants.code.success).json({
                statusCode: constants.code.success,
                userStatus: req.status,
                message: constants.message.success,
              });
            }
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
  } catch (error:any) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error?.message? error?.message : error,
    });
  }
};

const companyDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    User.findOne({
      _id: req.id,
      isDeleted: false,
      status: true,
      role: {
        $in: [
          constants.accountLevel.admin,
          constants.accountLevel.superAdmin,
          constants.accountLevel.manager,
        ],
      },
    })
      .then((userData) => {
        if (!userData) {
          throw {
            statusCode: constants.code.dataNotFound,
            message: constants.message.dataNotFound,
          };
        } else {
          Company.aggregate([
            {
              $match: { isCompanyErp: true, isDeleted: false },
            },
            {
              $lookup: {
                from: "addresses",
                let: { companyId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$companyId", "$$companyId"] },
                          { $eq: ["$isDeleted", false] },
                          // {
                          //   $eq: ["$constraint", constants.constraint.primary],
                          // },
                          { $eq: ["$type", constants.addressTypes.work] },
                        ],
                      },
                    },
                  },
                ],
                as: "addressDetail",
              },
            },
            // { $unwind: "$addressDetail" },
            {
              $unwind: {
                path: "$addressDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "cities",
                let: { cityId: "$addressDetail.address.city" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$_id", "$$cityId"] },
                          { $eq: ["$isDeleted", false] },
                        ],
                      },
                    },
                  },
                ],
                as: "cityDetail",
              },
            },
            // { $unwind: "$cityDetail" },
            {
              $unwind: {
                path: "$cityDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "states",
                let: { stateId: "$addressDetail.address.state" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$stateId"] },
                      isDeleted: false,
                    },
                  },
                ],
                as: "stateDetail",
              },
            },
            // { $unwind: "$stateDetail" },
            {
              $unwind: {
                path: "$stateDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "countries",
                let: { countryId: "$addressDetail.address.country" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$countryId"] },
                      isDeleted: false,
                    },
                  },
                ],
                as: "countryDetail",
              },
            },
            // { $unwind: "$countryDetail" },
            {
              $unwind: {
                path: "$countryDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                industry: 1,
                gst: 1,
                companyEmail: 1,
                companyPhone: "$companyPhone.value",
                foundingYear: 1,
                line_one: "$addressDetail.address.line_one",
                line_two: "$addressDetail.address.line_two",
                cityId: "$addressDetail.address.city",
                cityName: "$cityDetail.name",
                stateId: "$addressDetail.address.state",
                stateName: "$stateDetail.name",
                countryId: "$addressDetail.address.state",
                countryName: "$countryDetail.name",
                pin_code: "$addressDetail.address.pin_code",
                logo: 1,
                about: 1,
              },
            },
          ])
            .then((companyData) => {
              if (!companyData) {
                throw {
                  statusCode: constants.code.badRequest,
                  message: constants.message.dataNotFound,
                };
              } else {
                res.status(constants.code.success).json({
                  statusCode: constants.status.statusTrue,
                  userStatus: req.status,
                  data: companyData,
                });
              }
            })
            .catch((err) => {
              res.status(err.statusCode).json({
                statusCode: constants.status.statusTrue,
                userStatus: req.status,
                message: err.message,
              });
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
  } catch (error) {
    res.status(constants.code.internalServerError).json({
      statusCode: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

const googleLogin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const googleData: any = await jwtDecode(req.body.credential);
    User.findOne({ "email.value": await toLowerCase(googleData.email) })
      .then(async (data: any) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.invalidEmail,
          };
        } else if (!data.status) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.userInactive,
          };
        } else if (data.isDeleted) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.userDeleted,
          };
        } else if (
          data.role !== constants.accountLevel.superAdmin &&
          data.role !== constants.accountLevel.admin &&
          data.role !== constants.accountLevel.manager
        ) {
          throw {
            statusCode: constants.code.preconditionFailed,
            msg: constants.message.invalidUser,
          };
        } else if (
          !req.body.device_info.latitude &&
          !req.body.device_info.latitude
        ) {
          Device.findOneAndUpdate(
            { deviceId: req.body.device_info.deviceId, userId: data._id },
            {
              userId: data._id,
              deviceId: req.body.device_info.deviceId,
              appId: req.body.device_info.appId,
              name: req.body.device_info.name,
              model: req.body.device_info.model,
              platform: req.body.device_info.platform,
              version: req.body.device_info.version,
              ipAddress: !req.body.device_info.ip
                ? req.clientIp
                : req.body.device_info.ip,
              createdBy: data._id,
            },
            {
              upsert: true,
              new: true,
            }
          )
            .then(async (deviceDetail) => {
              if (!deviceDetail) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                const ipData = await getIPInfo(deviceDetail.ipAddress);
                Device.findOneAndUpdate(
                  { deviceId: deviceDetail.deviceId },
                  { latitude: ipData.lat, longitude: ipData.lon },
                  { upsert: true }
                )
                  .then(async (newDeviceDetail) => {
                    if (!newDeviceDetail) {
                      throw {
                        statusCode: constants.code.internalServerError,
                        msg: constants.message.internalServerError,
                      };
                    } else {
                      const payload = {
                        id: data._id,
                      };
                      res.status(constants.code.success).json({
                        status: constants.status.statusTrue,
                        userStatus: data.status,
                        message: constants.message.userLogin,
                        token:
                          req.body.device_info.platform !==
                            constants.deviceTypes.android &&
                          req.body.device_info.platform !==
                            constants.deviceTypes.iphone
                            ? await createToken(payload)
                            : await createTokenMobile(payload),
                        data: await data.getAuthDetail(),
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
                userStatus:req.status,
                message: err.msg,
              });
            });
        } else {
          Device.findOneAndUpdate(
            { deviceId: req.body.device_info.deviceId, userId: data._id },
            {
              userId: data._id,
              deviceId: req.body.device_info.deviceId,
              appId: req.body.device_info.appId,
              name: req.body.device_info.name,
              model: req.body.device_info.model,
              platform: req.body.device_info.platform,
              version: req.body.device_info.version,
              ipAddress: !req.body.device_info.ip
                ? req.clientIp
                : req.body.device_info.ip,
              latitude: req.body.device_info.latitude,
              longitude: req.body.device_info.longitude,
              createdBy: data._id,
            },
            {
              upsert: true,
              new: true,
            }
          )
            .then(async (deviceDetail) => {
              if (!deviceDetail) {
                throw {
                  statusCode: constants.code.internalServerError,
                  msg: constants.message.internalServerError,
                };
              } else {
                const payload = {
                  id: data._id,
                };
                res.status(constants.code.success).json({
                  status: constants.status.statusTrue,
                  userStatus: data.status,
                  message: constants.message.userLogin,
                  token:
                    req.body.device_info.platform !==
                      constants.deviceTypes.android &&
                    req.body.device_info.platform !==
                      constants.deviceTypes.iphone
                      ? await createToken(payload)
                      : await createTokenMobile(payload),
                  data: await data.getAuthDetail(),
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
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus:req.status,
      message: err,
    });
  }
};

const changeSelfCompanyLogo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    Company.findOne({
      isCompanyErp:true,
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else if (!data.logo) {
          Company.findOneAndUpdate(
            {
              isCompanyErp:true,
              isDeleted: false,
            },
            {
              logo: await logoUrl(req.headers.host, req.file.filename),
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
                  message: message.logoChangeSuccess,
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
          await removeLogo(await getFileName(data.logo));
          Company.findOneAndUpdate(
            {
              isCompanyErp:true,

              isDeleted: false,
            },
            {
              logo: await logoUrl(req.headers.host, req.file.filename),
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
                  message: message.logoChangeSuccess,
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


export default {
  login,
  getDetail,
  changeProfilePicture,
  updateDetail,
  verifyEmail,
  verifyPhone,
  updateEmail,
  updatePhone,
  changePassword,
  manageAuthentication,
  managePushNotification,
  manageEmailNotification,
  manageMessageNotification,
  deactivateAccount,
  deleteAccount,
  logout,
  logoutFromAll,
  forgotPassword,
  resetPassword,
  updateCompany,
  companyDetail,
  googleLogin,
  changeSelfCompanyLogo
};
