import { Request, Response, NextFunction } from "express";
import constants from "../../utils/constants";
import message from "./publicConstant";
import Setting from "../../models/setting";
import OTP from "../../models/otp";
import {
  getFileName,
  minutes,
  randomNumber,
  removeFile,
  toLowerCase,
} from "../../helpers/helper";
// import sendMessage from "../../services/sms-service";
import sendMail from "../../helpers/mail";
import User from "../../models/user";
import State from "../../models/state";
import City from "../../models/city";
import Location from "../../models/location";
import mongoose from "mongoose";

import { readFileSync } from "fs";
import CMS from "../../models/cms";
import Color from "../../models/color";
import excelToJson from "convert-excel-to-json";
import HSN from "../../models/hsn";
import Company from "../../models/company";
import Address from "../../models/address";

const localityDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    Location.aggregate([
      {
        $match: {
          pinCode: req.body.pin_code,
        },
      },
      {
        $lookup: {
          from: "cities",
          foreignField: "_id",
          localField: "cityId",
          as: "city_detail",
        },
      },
      { $unwind: "$city_detail" },
      {
        $lookup: {
          from: "states",
          foreignField: "_id",
          localField: "city_detail.stateId",
          as: "state_detail",
        },
      },
      { $unwind: "$state_detail" },
      {
        $lookup: {
          from: "countries",
          foreignField: "_id",
          localField: "state_detail.countryId",
          as: "country_detail",
        },
      },
      { $unwind: "$country_detail" },
      {
        $project: {
          _id: 0,
          city_id: "$city_detail._id",
          city_name: "$city_detail.name",
          state_id: "$state_detail._id",
          state_name: "$state_detail.name",
          country_id: "$country_detail._id",
          country_name: "$country_detail.name",
        },
      },
    ])
      .then((data) => {
        if (!data.length) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.invalidPinCode,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: constants.status.statusFalse,
            message: message.localitySuccess,
            data: data[0],
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

const stateList = async (req: any, res: Response, next: NextFunction) => {
  try {
    State.find({ countryId: req.body.country_id }, { _id: 1, name: 1 })
      .then((data) => {
        if (!data.length) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.invalidCountryId,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: constants.status.statusFalse,
            message: message.localitySuccess,
            data: data,
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

const findCity = async (req: any, res: Response, next: NextFunction) => {
  try {
    City.aggregate([
      {
        $match: {
          name: { $regex: "^" + req.body.city_name + ".*", $options: "i" },
        },
      },
      {
        $lookup: {
          from: "states",
          foreignField: "_id",
          localField: "stateId",
          as: "state_detail",
        },
      },
      { $unwind: "$state_detail" },
      {
        $project: {
          _id: 1,
          name: 1,
          stateId: "$state_detail._id",
          stateName: "$state_detail.name",
        },
      },
      {
        $sort: { name: 1 },
      },
      {
        $limit: 5,
      },
    ])
      .then((data) => {
        if (!data.length) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: constants.status.statusFalse,
            message: message.citySuccess,
            data: data,
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

const addColorsBulk = async (req: any, res: any, next: NextFunction) => {
  try {
    // let createdBy = req?.id;
    const data = excelToJson({
      sourceFile: req.file.path,
      sheets: ["color"],
    });
    const validateColumns = async (data: any) => {
      const columns: any = ["RAL Code", "Hex", "Name"];
      for (let i in data) {
        if (!columns.includes(data[i])) {
          await removeFile(req.file.filename);
          throw {
            statusCode: constants.code.badRequest,
            msg: `Invalid column name (${data[i]}). Kindly change the name & try again.`,
          };
        }
      }
      return true;
    };
    if (!data.color.length) {
      await removeFile(req.file.filename);
      throw {
        statusCode: constants.code.badRequest,
        msg: constants.message.recordNotFound,
      };
    } else if (Object.keys(data.color[0]).length < 3) {
      await removeFile(req.file.filename);
      throw {
        statusCode: constants.code.badRequest,
        msg: constants.message.columnMissing,
      };
    } else if (Object.keys(data.color[0]).length > 3) {
      await removeFile(req.file.filename);
      throw {
        statusCode: constants.code.badRequest,
        msg: constants.message.unwantedColumns,
      };
    } else {
      const columns = data.color.shift();
      if ((await validateColumns(columns)) === true) {
        const superAdminData: any = await User.findOne({
          role: constants.accountLevel.superAdmin,
          isDeleted: false,
          status: true,
        });
      }
      for (let i = 0; i < data.color.length; i++) {
        const hexCode: any = Object.values(data.color[i])[2];
        const ralCode: any = Object.values(data.color[i])[0];
        const ral_code: any = ralCode.replace(" ", "");
        const name: any = Object.values(data.color[i])[1];

        await Color.findOneAndUpdate(
          { name: name, ral_code: ral_code, hex_code: hexCode,type:constants.colorType.classic},
          { name: name, ral_code: ral_code, hex_code: hexCode },
          { new: true, upsert: true }
        ).then((updatedcolorSheet) => {
          if (!updatedcolorSheet) {
            throw {
              statusCode: constants.code.internalServerError,
              message: message.bulkColorUploadFailed,
            };
          }
        });
      }
      await removeFile(req.file.filename);
      return res.status(constants.code.success).json({
        status: constants.status.statusTrue,
        userStatus: req.status,
        message: message.bulkColorUpload,
      });
    }
  } catch (error) {
    return res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
};

const uploadHsnBulk=async(req:any,res:Response,next:NextFunction)=>{
  try {
    // let createdBy = req?.id;
    const data = excelToJson({
      sourceFile: req.file.path,
      sheets: ["HSN"],
    });
    const validateColumns = async (data: any) => {
      const columns: any = ["Code", "HSN Description", "GST"];
      for (let i in data) {
        if (!columns.includes(data[i])) {
          await removeFile(req.file.filename);
          throw {
            statusCode: constants.code.badRequest,
            msg: `Invalid column name (${data[i]}). Kindly change the name & try again.`,
          };
        }
      }
      return true;
    };
    if (!data.HSN.length) {
      await removeFile(req.file.filename);
      throw {
        statusCode: constants.code.badRequest,
        msg: constants.message.recordNotFound,
      };
    } else if (Object.keys(data.HSN[0]).length < 3) {
      await removeFile(req.file.filename);
      throw {
        statusCode: constants.code.badRequest,
        msg: constants.message.columnMissing,
      };
    } else if (Object.keys(data.HSN[0]).length > 3) {
      await removeFile(req.file.filename);
      throw {
        statusCode: constants.code.badRequest,
        msg: constants.message.unwantedColumns,
      };
    } else {
      const columns = data.HSN.shift();
      if ((await validateColumns(columns)) === true) {
        const superAdminData: any = await User.findOne({
          role: constants.accountLevel.superAdmin,
          isDeleted: false,
          status: true,
        });
      }
      for (let i = 0; i < data.HSN.length; i++) {
        const hsnCode: any = Object.values(data.HSN[i])[0];
        const description: any = Object.values(data.HSN[i])[1];
        const gst: any = Object.values(data.HSN[i])[2];
          console.log(i)
              if((gst==''&&gst!==0)||gst=='Null'){
                continue;
              }
              else if(isNaN(Number(hsnCode))){
                continue
              }
        await HSN.findOneAndUpdate(
          { hsn: hsnCode, description: description, gst: Number(gst) },
          { hsn: hsnCode, description: description, gst: Number(gst) },
          { new: true, upsert: true }
        ).then((updatedHsnSheet) => {
          if (!updatedHsnSheet) {
            throw {
              statusCode: constants.code.internalServerError,
              message: message.bulkHsnUploadFailed,
            };
          }
        });
      }
      await removeFile(req.file.filename);
      return res.status(constants.code.success).json({
        status: constants.status.statusTrue,
        userStatus: req.status,
        message: message.bulkHsnUploadSuccess,
      });
    }
  } catch (error) {
    return res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error,
    });
  }
}

const getSelfAddresses = async (req: any, res: Response, next: NextFunction) => {
  try {
    Company.findOne({ isCompanyErp: true, isDeleted: false }).
      then((companyData: any) => {
        if (!companyData) {
          throw {
            statusCode: constants.code.preconditionFailed,
            message: message.updateCompanyAddresses
          }
        }
        else {
          // Address.find({ companyId: companyData._id, isDeleted:false}).then((addressList: any) => {
          //   if (!addressList) {
          //     throw {
          //       statusCode: constants.code.preconditionFailed,
          //       message: message.updateCompanyAddresses
          //     }
          //   }
          //   else {
          //     res.status(constants.code.success).json({
          //       statusCode: constants.status.statusTrue,
          //       userStatus: req.status,
          //       data: addressList
          //     })
          //   }
          // })
          Address.aggregate([{ $match: { companyId: companyData._id, isDeleted: false } },
          {
            $lookup: {
              from: "cities",
              foreignField: "_id",
              localField: "address.city",
              as: "city_detail",
            }
          },
          {
            $unwind: "$city_detail"
          },
          {
            $lookup: {
              from: "states",
              foreignField: "_id",
              localField: "address.state",
              as: "state_detail"
            }
          },
          { $unwind: "$state_detail" },
          {
            $lookup: {
              from: "countries",
              localField: "address.country",
              foreignField: "_id",
              as: "country_detail"
            }
          },
          { $unwind: "$country_detail" },
          {
            $project: {
              _id:1,
              "address.line_one": 1,
              "address.line_two": 1,
              "address.pin_code":1,
              "city_detail._id":1,
              "city_detail.name":1,
              "state_detail._id":1,
              "state_detail.name":1,
              "country_detail._id":1,
              "country_detail.name":1,
              "address.address.pincode":1,
              constraint:1,
               slug:1,
               type:1
            }
          }
          ])
          .then((addressList:any)=>{
            if (!addressList) {
              throw{
                statusCode:constants.code.preconditionFailed,
                message:message.addressNotFound
              }

            }
            else{
             res.status(constants.code.success).json({
               statusCode:constants.status.statusTrue,
               userStatus:req.status,
               addressList:addressList
             })
            }
            }).catch((err) => {
              res.json(constants.code.internalServerError).json({
                statusCode: constants.status.statusFalse,
                userStatus: req.status,
                message: err.message
              })
            })

        }
      }).catch((err) => {
        res.status(err.statusCode).json(({
          status: constants.status.statusFalse,
          userStatus: req.status,
          message: err.message
        }))
      })
  } catch (error) {
    res.status(constants.code.preconditionFailed).json(({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error
    }))
  }
}


const hsnList = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);

    const limit = Number(req.query.limit);

    const skip = page * limit;

    const sort = req.query.sort === "desc" ? -1 : 1;

    let createdBy = req.id;

    if (Number(req.query?.limit) !== 0) {
      await HSN.aggregate([
        {
          $match: {

            isDeleted: false,

            hsn: {
              $regex: "^" + req.query.search + ".*",

              $options: "i",
            },

          },
        },

        { $sort: { createdAt: -1 } },


        {
          $project: {
            _id: 1, 
             hsn:1,
            description:1,
            gst:1

           
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

              message: message.noHsnFound,
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
     

      await HSN.aggregate([
        {
          $match: {
            isDeleted: false,

            hsn: {
              $regex: "^" + req.query.search + ".*",

              $options: "i",
            },

          },
        },

        { $sort: { createdAt: -1 } },


        {
          $project: {
            id:1,
            hsn:1,
            description:1,
            gst:1
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

        .then((hsnData) => {
          if (!hsnData) {
            throw {
              statusCode: constants.code.dataNotFound,

              message: message.noHsnFound,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,

              userStatus: req.status,

              data: hsnData,
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
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error
    });
  }
};



export default {
  // getAccessKey,
  // sendOTP,
  // sendOTPMessage,
  // sendOTPEmail,
  // verifyOTP,
  // verifyToken,
  // pageDetail,
  // getWebMaintenanceDetail,
  // getAppMaintenanceDetail,
  // getInventoryMaintenanceDetail,
  // getInventoryAppMaintenanceDetail,
  // getSupportMaintenanceDetail,
  localityDetail,
  stateList,
  findCity,
  addColorsBulk,
  uploadHsnBulk,
  getSelfAddresses,
  hsnList
  // getImage,
};