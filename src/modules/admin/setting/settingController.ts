import { Request, Response, NextFunction } from "express";
import constants from "../../../utils/constants";
import mongoose from "mongoose";
import message from "./settingConstant";
import Setting from "../../../models/setting";
import { isDateValid } from "../../../helpers/helper";

const getDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    Setting.findOne({ isDeleted: false })
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
            message: message.detailSuccess,
            data: await data.getSettingDetail(),
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

const manageWebMaintenance = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.status) {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            webMaintenance: {
              time: null,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.webMaintenanceOff,
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
    } else if (!req.body.time || (await isDateValid(req.body.time)) !== true) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidTimeFormat,
      };
    } else {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            webMaintenance: {
              time: req.body.time,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.webMaintenanceOn,
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

const manageAppMaintenance = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.status) {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            appMaintenance: {
              time: null,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.appMaintenanceOff,
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
    } else if (!req.body.time || (await isDateValid(req.body.time)) !== true) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidTimeFormat,
      };
    } else {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            appMaintenance: {
              time: req.body.time,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.appMaintenanceOn,
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

const manageInventoryMaintenance = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.status) {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            inventoryMaintenance: {
              time: null,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.inventoryMaintenanceOff,
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
    } else if (!req.body.time || (await isDateValid(req.body.time)) !== true) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidTimeFormat,
      };
    } else {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            inventoryMaintenance: {
              time: req.body.time,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.inventoryMaintenanceOn,
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

const manageInventoryAppMaintenance = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.status) {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            inventoryAppMaintenance: {
              time: null,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.inventoryAppMaintenanceOff,
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
    } else if (!req.body.time || (await isDateValid(req.body.time)) !== true) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidTimeFormat,
      };
    } else {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            inventoryAppMaintenance: {
              time: req.body.time,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.inventoryAppMaintenanceOn,
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

const manageSupportMaintenance = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.status) {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            supportMaintenance: {
              time: null,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.supportMaintenanceOff,
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
    } else if (!req.body.time || (await isDateValid(req.body.time)) !== true) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidTimeFormat,
      };
    } else {
      Setting.findOneAndUpdate(
        { isDeleted: false },
        {
          $set: {
            supportMaintenance: {
              time: req.body.time,
              status: req.body.status,
            },
          },
        },
        {
          new: true,
        }
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
              message: message.supportMaintenanceOn,
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
  getDetail,
  manageWebMaintenance,
  manageAppMaintenance,
  manageInventoryMaintenance,
  manageInventoryAppMaintenance,
  manageSupportMaintenance,
};
