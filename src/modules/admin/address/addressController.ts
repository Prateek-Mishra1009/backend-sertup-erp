import { Request, Response, NextFunction } from "express";
import constants from "../../../utils/constants";
import message from "./addressConstant";
import mongoose, { mongo } from "mongoose";
import User from "../../../models/user";
import Address from "../../../models/address";
import { generateAddressSlug, getPinDetail } from "../../../helpers/helper";
import Company from "../../../models/company";
import Inventory from "../../../models/inventory";

const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    Company.findOne({
      _id: new mongoose.Types.ObjectId(req.body.company_id),
      // isCompanyErp: false,
      status: true,
      isDeleted: false,
    })
      .then(async (companyDetail: any) => {
        if (!companyDetail) {
          throw {
            statusCode: constants.code.unAuthorized,
            msg: message.companyNotFound,
          };
        } else {
          Address.countDocuments({
            companyId: new mongoose.Types.ObjectId(companyDetail._id),
            isDeleted: false,
          })
            .then((address_count) => {
              if (address_count === 10) {
                throw {
                  statusCode: constants.code.badRequest,
                  msg: message.addressLimit,
                };
              } else {
                Address.exists({
                  companyId: new mongoose.Types.ObjectId(companyDetail._id),
                  type: req.body.address_type,
                  "address.pin_code": req.body.pin_code,
                  "address.line_one": req.body.address_line_one,
                  "address.line_two": req.body.address_line_two,
                  isDeleted: false,
                })
                  .then(async (address_detail) => {
                    if (address_detail) {
                      throw {
                        statusCode: constants.code.preconditionFailed,
                        msg: message.addressExist,
                      };
                    } else {
                      const pinData: any = await getPinDetail(
                        req.body.pin_code
                      );
                      Address.create({
                        slug: await generateAddressSlug(
                          req.body.name,
                          req.body.address_type,
                          pinData.pinCode
                        ),
                        companyId: new mongoose.Types.ObjectId(
                          companyDetail._id
                        ),
                        constraint: constants.constraint.secondary,
                        type: req.body.address_type,
                        name: req.body.name,
                        email: companyDetail.companyEmail.value,
                        phone: req.body.phone,
                        address: {
                          line_one: req.body.address_line_one,
                          line_two: req.body.address_line_two,
                          city: pinData.cityId,
                          state: pinData.stateId,
                          country: pinData.countryId,
                          pin_code: pinData.pinCode,
                        },
                        landmark: req.body.landmark,
                        latitude: req.body.latitude,
                        longitude: req.body.longitude,
                        createdBy: req.id,
                      })
                        .then(async (data) => {
                          if (!data) {
                            throw {
                              statusCode: constants.code.internalServerError,
                              msg: constants.message.internalServerError,
                            };
                          }
                          else if (req.body.checked && req.body.address_type === constants.addressTypes.warehouse) {
                            Address.create({
                              slug: await generateAddressSlug(
                                req.body.name,
                                req.body.address_type,
                                pinData.pinCode
                              ),
                              companyId: new mongoose.Types.ObjectId(
                                companyDetail._id
                              ),
                              constraint: constants.constraint.secondary,
                              type: constants.addressTypes.shipping,
                              name: req.body.name,
                              email: companyDetail.companyEmail.value,
                              phone: req.body.phone,
                              address: {
                                line_one: req.body.address_line_one,
                                line_two: req.body.address_line_two,
                                city: pinData.cityId,
                                state: pinData.stateId,
                                country: pinData.countryId,
                                pin_code: pinData.pinCode,
                              },
                              landmark: req.body.landmark,
                              latitude: req.body.latitude,
                              longitude: req.body.longitude,
                              createdBy: req.id,
                            }).then((same_address) => {
                              if (!same_address) {
                                throw {
                                  statusCode: constants.code.internalServerError,
                                  message: constants.message.invalidAddress
                                }
                              }
                              else {
                                res.status(constants.code.success).json({
                                  status: constants.status.statusTrue,
                                  userStatus: req.status,
                                  message: message.addressSuccess,
                                });
                              }
                            })
                          }
                          else if (req.body.checked && req.body.address_type === constants.addressTypes.shipping) {
                            Address.create({
                              slug: await generateAddressSlug(
                                req.body.name,
                                req.body.address_type,
                                pinData.pinCode
                              ),
                              companyId: new mongoose.Types.ObjectId(
                                companyDetail._id
                              ),
                              constraint: constants.constraint.secondary,
                              type: constants.addressTypes.warehouse,
                              name: req.body.name,
                              email: companyDetail.companyEmail.value,
                              phone: req.body.phone,
                              address: {
                                line_one: req.body.address_line_one,
                                line_two: req.body.address_line_two,
                                city: pinData.cityId,
                                state: pinData.stateId,
                                country: pinData.countryId,
                                pin_code: pinData.pinCode,
                              },
                              landmark: req.body.landmark,
                              latitude: req.body.latitude,
                              longitude: req.body.longitude,
                              createdBy: req.id,
                            }).then((same_address) => {
                              if (!same_address) {
                                throw {
                                  statusCode: constants.code.internalServerError,
                                  message: constants.message.invalidAddress
                                }
                              }
                              else {
                                res.status(constants.code.success).json({
                                  status: constants.status.statusTrue,
                                  userStatus: req.status,
                                  message: message.addressSuccess,
                                });
                              }
                            })
                          }
                          else {
                            res.status(constants.code.success).json({
                              status: constants.status.statusTrue,
                              userStatus: req.status,
                              message: message.addressSuccess,
                            });
                          }
                        })
                        .catch((err) => {
                          // console.log("err",err)
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

const addressList = async (req: any, res: Response, next: NextFunction) => {
  try {
    Address.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(req.params.company_id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "cities",
          foreignField: "_id",
          localField: "address.city",
          as: "city_detail",
        },
      },
      { $unwind: "$city_detail" },
      {
        $lookup: {
          from: "states",
          foreignField: "_id",
          localField: "address.state",
          as: "state_detail",
        },
      },
      { $unwind: "$state_detail" },
      {
        $lookup: {
          from: "countries",
          foreignField: "_id",
          localField: "address.country",
          as: "country_detail",
        },
      },
      { $unwind: "$country_detail" },
      {
        $project: {
          _id: 1,
          constraint: 1,
          slug: 1,
          type: 1,
          name: 1,
          email: 1,
          phone: 1,
          createdAt: 1,
          is_verified: 1,
          address: {
            line_one: 1,
            line_two: 1,
            city: "$city_detail.name",
            state: "$state_detail.name",
            country: "$country_detail.name",
            city_id: "$city_detail._id",
            state_id: "$state_detail._id",
            country_id: "$country_detail._id",
            pin_code: 1,
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((data) => {
        if (!data.length) {
          throw {
            statusCode: constants.code.internalServerError,
            msg: constants.message.internalServerError,
          };
        } else {
          res.status(constants.code.success).json({
            status: constants.status.statusTrue,
            userStatus: req.status,
            message: message.addressListSuccess,
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

const detail = async (req: any, res: Response, next: NextFunction) => {
  try {
    Address.findOne({
      _id: new mongoose.Types.ObjectId(req.params.address_id),
      // companyId: new mongoose.Types.ObjectId(req.body.company_id),
      isDeleted: false,
    })
      .then((address_detail) => {
        if (!address_detail) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          Address.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(address_detail._id),
                // companyId: new mongoose.Types.ObjectId(req.body.company_id),
                isDeleted: false,
              },
            },
            {
              $lookup: {
                from: "cities",
                foreignField: "_id",
                localField: "address.city",
                as: "city_detail",
              },
            },
            { $unwind: "$city_detail" },
            {
              $lookup: {
                from: "states",
                foreignField: "_id",
                localField: "address.state",
                as: "state_detail",
              },
            },
            { $unwind: "$state_detail" },
            {
              $lookup: {
                from: "countries",
                foreignField: "_id",
                localField: "address.country",
                as: "country_detail",
              },
            },
            { $unwind: "$country_detail" },
            {
              $project: {
                _id: 1,
                constraint: 1,
                slug: 1,
                type: 1,
                name: 1,
                email: 1,
                phone: 1,
                is_verified: 1,
                address: {
                  line_one: 1,
                  line_two: 1,
                  city: "$city_detail.name",
                  city_id: "$city_detail._id",
                  state: "$state_detail.name",
                  state_id: "$state_detail._id",
                  country: "$country_detail.name",
                  country_id: "$country_detail._id",
                  pin_code: 1,
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
                  message: message.addressDetailSuccess,
                  data: data[0],
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
    const pinData = await getPinDetail(req.body.pinCode);
    const companyDetail: any = await Company.findOne({
      _id: new mongoose.Types.ObjectId(req.body.company_id),
      isDeleted: false,
      // isCompanyErp: false,
    });
    const addressDetail: any = await Address.findOne({
      _id: req.params.address_id,
      isDeleted: false,
    });

    if (!addressDetail) {
      throw {
        statusCode: constants.code.dataNotFound,
        message: constants.message.dataNotFound,
      };
    }

    if (
      addressDetail.constraint === constants.constraint.primary &&
      req.body.email != companyDetail?.companyEmail?.value
    ) {
      throw {
        statusCode: constants.code.notAcceptable,
        message: constants.message.invalidEmailAddress,
      };
    } 
    // else if (
    //   addressDetail.constraint === constants.constraint.primary &&
    //   req.body.address_type != constants.addressTypes.work
    // ) {
    //   throw {
    //     statusCode: constants.code.notAcceptable,
    //     message: message.invalidAddressPrimary,
    //   };
    // } else if (
    //   addressDetail.constraint === constants.constraint.secondary &&
    //   req.body.address_type === constants.addressTypes.work
    // ) {
    //   throw {
    //     statusCode: constants.code.notAcceptable,
    //     message: message.invalidAddressSecondary,
    //   };
    // } 
    else {
      Address.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.address_id),
          companyId: new mongoose.Types.ObjectId(req.body.company_id),
          isDeleted: false,
        },
        {
          slug: await generateAddressSlug(
            req.body.name,
            req.body.address_type,
            pinData.pinCode
          ),
          companyId: new mongoose.Types.ObjectId(req.body.company_id),
          constraint: addressDetail.constraint,
          type: req.body.address_type,
          email: req.body.email,
          name: req.body.name,
          phone: req.body.phone,
          address: {
            line_one: req.body.address_line_one,
            line_two: req.body.address_line_two,
            city: pinData.cityId,
            state: pinData.stateId,
            country: pinData.countryId,
            pin_code: pinData.pinCode,
          },
          landmark: req.body.landmark,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          updatedBy: req.id,
        }
      )
        .then((updatedAddress) => {
          if (!updatedAddress) {
            throw {
              statusCode: constants.code.dataNotFound,
              message: message.addressUpdateFailed,
            };
          } else {
            res.status(constants.code.success).json({
              status: constants.status.statusTrue,
              userStatus: req.status,
              message: message.addressUpdateSuccess,
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
  } catch (err: any) {
    res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err?.message ? err.message : err,
    });
  }
};

const deleteAddress = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete || !req.params.address_id) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      const adressExists: any = await Address.exists({
        _id: new mongoose.Types.ObjectId(req.params.address_id),
        isDeleted: false,
      });
      if (!adressExists) {
        throw {
          statusCode: constants.code.preconditionFailed,
          msg: constants.message.invalidAddress,
        };
      }

      //  const existingProducts=await Inventory.countDocuments({locationId:new mongoose.Types.ObjectId(req.params.address_id),isDeleted:false})

      //  if(existingProducts){
      //   throw {
      //     statusCode: constants.code.preconditionFailed,
      //     msg: `There are currently ${existingProducts} Product in inventory associated to this address.Kindly Move to other warehouse, then try to delete the address`,
      //   };
      //  }
      else {
        Address.findOne({
          _id: new mongoose.Types.ObjectId(req.params.address_id),
          isDeleted: false
        })
          .then((addressDetail) => {
            if (!addressDetail) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: constants.message.dataNotFound,
              };
            } else if (
              addressDetail.constraint === constants.constraint.primary
            ) {
              throw {
                statusCode: constants.code.preconditionFailed,
                message: message.deletePrimary,
              };
            } else {
              Address.aggregate([
                {
                  $match: {
                    _id: new mongoose.Types.ObjectId(req.params.address_id),
                    isDeleted: false,
                  },
                },
                // {
                //   $lookup: {
                //     from: "inventories",
                //     let: { locationId: "$locationId" },
                //     pipeline: [
                //       {
                //         $match: {
                //           $expr: {
                //             $eq: ["$_id", "$$locationId"],
                //           },
                //           isDeleted: false,
                //         },
                //       },
                //     ],
                //     as: "inventory_detail",
                //   },
                // },
                // { $sort: { "inventory_detail.createdAt": 1 } },

                {
                  $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "locationId",
                    as: "inventory_detail"
                  }
                },
                { $match: { "inventory_detail.isDeleted": false } },
                // { $sort: { "inventory_detail.createdAt": 1 } },
                { $unwind: "$inventory_detail" },
                {
                  $unwind: {
                    path: "$inventory_detail",
                    // preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $sort: { createdAt: -1 },
                },
              ])
                .then((data: any) => {
                  if (data.length > 0) {
                    throw {
                      statusCode: constants.code.preconditionFailed,
                      message: `There are currently ${data.length} Product in inventory associated to this address, kindly Move to other warehouse, then try to delete the address`,
                    };
                  }
                  else {
                    Address.findOneAndUpdate(
                      {
                        _id: new mongoose.Types.ObjectId(req.params.address_id),
                        companyId: new mongoose.Types.ObjectId(req.body.company_id),
                        constraint: constants.constraint.secondary,
                        isDeleted: false,
                      },
                      {
                        isDeleted: req.body.is_delete,
                      },
                      { new: true }
                    )
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
                            message: message.addressDeletedSuccess,
                          });
                        }
                      })
                      .catch((err) => {
                        res.status(err.statusCode).json({
                          status: constants.status.statusFalse,
                          userStatus: req.status,
                          // message: err.message,
                          msg: constants.message.dataNotFound,
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
                })
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
  } catch (err: any) {
    res.status(err.statusCode).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: err.msg,
    });
  }
};

const changePrimaryAddress = async (req: any, res: Response, next: NextFunction) => {
  try {
    Address.findOneAndUpdate({
      companyId: new mongoose.Types.ObjectId(req.body.company_id),
      isDeleted: false,
      constraint: constants.constraint.primary,
      // type: constants.addressTypes.work
    },
      {
        constraint: constants.constraint.secondary,
        // type: constants.addressTypes.warehouse
      },
      { new: true }
    ).then((old_primary_Address) => {
      if (!old_primary_Address) {
        throw {
          statusCode: constants.code.dataNotFound,
          message: constants.message.dataNotFound
        }
      }
      else {
        Address.findByIdAndUpdate({
          _id: new mongoose.Types.ObjectId(req.body.address_id),
          companyId: new mongoose.Types.ObjectId(req.body.company_id),
          constraint: constants.constraint.secondary,
          isDeleted: false
        }, {
          constraint: constants.constraint.primary,
          // type: constants.addressTypes.work
        }, { new: true }).
          then((updatedPrimaryAddress) => {
            if (!updatedPrimaryAddress) {
              throw {
                statusCode: constants.code.dataNotFound,
                message: constants.message.invalidAddress
              }
            }
            else {
              //success
              res.status(constants.code.success).json({
                status: constants.status.statusTrue,
                userStatus: req.status,
                message: constants.message.success
              })

            }
          }).catch((err) => {
            res.status(constants.code.internalServerError).json({
              status: constants.status.statusFalse,
              userStatus: req.status,
              message: err.message
            })
          })
      }
    }).catch((err) => {
      //error
      res.status(constants.code.internalServerError).json({
        statusCode: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message
      })
    })
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error
    })
  }
}

const getAddressByCompanyId = async (req: any, res: Response, next: NextFunction) => {
  try {
    Address.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(req.body.companyId),
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "cities",
          foreignField: "_id",
          localField: "address.city",
          as: "city_detail",
        },
      },
      { $unwind: "$city_detail" },
      {
        $lookup: {
          from: "states",
          foreignField: "_id",
          localField: "address.state",
          as: "state_detail",
        },
      },
      { $unwind: "$state_detail" },
      {
        $lookup: {
          from: "countries",
          foreignField: "_id",
          localField: "address.country",
          as: "country_detail",
        },
      },
      { $unwind: "$country_detail" },
      {
        $project: {
          _id: 1,
          constraint: 1,
          slug: 1,
          type: 1,
          name: 1,
          email: 1,
          phone: 1,
          createdAt: 1,
          is_verified: 1,
          address: {
            line_one: 1,
            line_two: 1,
            city: "$city_detail.name",
            state: "$state_detail.name",
            country: "$country_detail.name",
            city_id: "$city_detail._id",
            state_id: "$state_detail._id",
            country_id: "$country_detail._id",
            pin_code: 1,
          },
        },
      },
    ]).then((data) => {
      if (data) {
        res.status(constants.code.success).json({
          statusCode: constants.status.statusTrue,
          userStatus: req.status,
          message: message.addressDetailSuccess,
          data: data
        })
      }
      else {
        res.status(constants.code.success).json({
          statusCode: constants.status.statusTrue,
          userStatus: req.status,
          message: message.companyNotFound
        })
      }
    })
    .catch((error) => {
      res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: error
      })
    })
  } catch (error) {
    res.status(constants.code.preconditionFailed).json({
      status: constants.status.statusFalse,
      userStatus: req.status,
      message: error
    })
  }
}

export default {
  create,
  addressList,
  detail,
  update,
  deleteAddress,
  changePrimaryAddress,
  getAddressByCompanyId
};
