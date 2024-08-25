import { Request, Response, NextFunction } from "express";
import CryptoJS from "crypto-js";
import { verify } from "jsonwebtoken";
import mongoose from "mongoose";
import constants from "../utils/constants";
import Token from "../models/token";
import User from "../models/user";

const checkAuth = {
  Admin: async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) {
        throw {
          statusCode: constants.code.unAuthorized,
          msg: constants.message.reqAccessToken,
        };
      } else {
        const bearer = req.headers.authorization.split(" ");
        const bearerToken = bearer[1];

        Token.findOne({ tokenable_id: bearerToken })
          .then((data: any) => {
            if (!data) {
              throw {
                statusCode: constants.code.unAuthorized,
                msg: constants.message.invalidAccessToken,
              };
            } else {
              const key = CryptoJS.enc.Hex.parse(data.key);
              const iv = CryptoJS.enc.Hex.parse(data.iv);
              const decrypted = CryptoJS.AES.decrypt(data.token, key, {
                iv: iv,
              });
              const token = decrypted.toString(CryptoJS.enc.Utf8);

              verify(
                token,
                `${process.env.JWT_SECRET}`,
                {
                  issuer: process.env.JWT_ISSUER,
                },
                (err, jwt_payload: any) => {
                  if (err) {
                    throw {
                      statusCode: constants.code.unAuthorized,
                      msg: err.message,
                    };
                  } else {
                    User.findOne({
                      _id: new mongoose.Types.ObjectId(jwt_payload.id),
                      $or: [
                        { role: constants.accountLevel.superAdmin },
                        { role: constants.accountLevel.admin },
                      ],
                      status: true,
                      isDeleted: false,
                    })
                      .then((user) => {
                        if (!user) {
                          throw {
                            statusCode: constants.code.unAuthorized,
                            msg: constants.message.invalidAccessToken,
                          };
                        } else {
                          req.token = bearerToken;
                          req.id = user._id;
                          req.role=user.role,
                          req.department=user.department_id
                          req.status = user.status;
                          next();
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
                }
              );
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
    } catch (err: any) {
      res.status(err.statusCode).json({
        status: constants.status.statusFalse,
        userStatus: constants.status.statusFalse,
        message: err.msg,
      });
    }
  },
  Manager: async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) {
        throw {
          statusCode: constants.code.unAuthorized,
          msg: constants.message.reqAccessToken,
        };
      } else {
        const bearer = req.headers.authorization.split(" ");
        const bearerToken = bearer[1];

        Token.findOne({ tokenable_id: bearerToken })
          .then((data: any) => {
            if (!data) {
              throw {
                statusCode: constants.code.unAuthorized,
                msg: constants.message.invalidAccessToken,
              };
            } else {
              const key = CryptoJS.enc.Hex.parse(data.key);
              const iv = CryptoJS.enc.Hex.parse(data.iv);
              const decrypted = CryptoJS.AES.decrypt(data.token, key, {
                iv: iv,
              });
              const token = decrypted.toString(CryptoJS.enc.Utf8);

              verify(
                token,
                `${process.env.JWT_SECRET}`,
                {
                  issuer: process.env.JWT_ISSUER,
                },
                (err, jwt_payload: any) => {
                  if (err) {
                    throw {
                      statusCode: constants.code.unAuthorized,
                      msg: err.message,
                    };
                  } else {
                    User.findOne({
                      _id: new mongoose.Types.ObjectId(jwt_payload.id),
                      $or: [
                        { role: constants.accountLevel.superAdmin },
                        { role: constants.accountLevel.admin },
                        { role: constants.accountLevel.manager },
                      ],
                      status: true,
                      isDeleted: false,
                    })
                      .then((user) => {
                        if (!user) {
                          throw {
                            statusCode: constants.code.unAuthorized,
                            msg: constants.message.invalidAccessToken,
                          };
                        } else {
                          req.token = bearerToken;
                          req.id = user._id;
                          req.role=user.role,
                          req.department=user.department_id
                          req.status = user.status;
                          next();
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
                }
              );
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
    } catch (err: any) {
      res.status(err.statusCode).json({
        status: constants.status.statusFalse,
        userStatus: constants.status.statusFalse,
        message: err.msg,
      });
    }
  },
};

export default checkAuth;
