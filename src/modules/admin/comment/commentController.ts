import { Request, Response, NextFunction } from "express";
import constants from "../../../utils/constants";
import message from "./commentConstant";
import {
  createSlug,
  getFileName,
  imageUrl,
  removeFile,
  removeImage,
  toLowerCase,
} from "../../../helpers/helper";
import mongoose from "mongoose";
import Comment from "../../../models/comment";
import Product from "../../../models/product";


const addComment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const productId = req.body.product_id;
    const commentText = req.body.comment;
    const userId = req.id;

    const productExists = await Product.exists({ _id: productId, isDeleted: false });

    if (!productExists) {
      return res.status(constants.code.dataNotFound).json({
        status: constants.status.statusFalse,
        message: constants.message.dataNotFound,
      });
    }

    const updatedComment = await Comment.findOneAndUpdate(
      { productId: new mongoose.Types.ObjectId(productId) },
      {
        $push: {
          comments: { comment: commentText, createdBy: new mongoose.Types.ObjectId(userId) },
        },
      },
      { upsert: true, new: true }
    );

    if (!updatedComment) {
      return res.status(constants.code.internalServerError).json({
        status: constants.status.statusFalse,
        message: constants.message.internalServerError,
      });
    }

    return res.status(constants.code.success).json({
      status: constants.status.statusTrue,
      message: message.commentSuccess
    });

  } catch (err:any) {
    return res.status(constants.code.internalServerError).json({
      status: constants.status.statusFalse,
      message: err.message || err,
    });
  }
};

const updateComment = async (req: any, res: Response, next: NextFunction) => {
  try {
    Comment.findOne({
      _id: new mongoose.Types.ObjectId(req.params.comment_id),
      productId: new mongoose.Types.ObjectId(req.body.product_id),
      isDeleted: false,
    })
      .then(async (data) => {
        if (!data) {
          throw {
            statusCode: constants.code.dataNotFound,
            msg: constants.message.dataNotFound,
          };
        } else {
          Comment.exists({
            _id: { $nin: [new mongoose.Types.ObjectId(req.params.comment_id)] },
            productId: new mongoose.Types.ObjectId(req.body.product_id),
            comment: req.body.comment,
          })
            .then(async (dataExist) => {
              if (dataExist) {
                throw {
                  statusCode: constants.code.preconditionFailed,
                  msg: message.alreadyComment,
                };
              } else {
                Comment.findOneAndUpdate(
                  {
                    _id: new mongoose.Types.ObjectId(req.params.comment_id),
                    productId: new mongoose.Types.ObjectId(req.body.product_id),
                    isDeleted: false,
                  },
                  {
                    comment: req.body.comment,
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
                        message: message.commentUpdateSuccess,
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

//In below api we are deleting a single comment of a particular product
const deleteComment = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.body.is_delete) {
      throw {
        statusCode: constants.code.preconditionFailed,
        msg: constants.message.invalidType,
      };
    } else {
      Comment.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.comment_id),
          productId: new mongoose.Types.ObjectId(req.body.product_id),
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
              message: message.commentDeleteSuccess,
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
  addComment,
  // commentDetail,
  updateComment,
  deleteComment,
};
