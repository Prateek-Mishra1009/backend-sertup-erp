import { Request, Response, NextFunction } from "express";
import Setting from "../models/setting";
import constants from "../utils/constants";

const checkAccessKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.header("AccessKey")) {
      throw {
        statusCode: constants.code.unAuthorized,
        msg: constants.message.reqAccessKey,
      };
    } else {
      const accesskey = req.header("AccessKey");
      await Setting.findOne({ AccessKey: accesskey })
        .then((data) => {
          if (!data) {
            throw {
              statusCode: constants.code.unAuthorized,
              msg: constants.message.invalidAccesskey,
            };
          } else {
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: constants.status.statusFalse,
      message: err.msg,
    });
  }
};

export default checkAccessKey;
