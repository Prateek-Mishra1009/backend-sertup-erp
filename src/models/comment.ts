import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime } from "../helpers/helper";

const commentSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
    comments: [
      {
        comment: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isDeleted: { type: Boolean, required: true, default: false },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date },
        deletedAt: { type: Date }
      },
    ],
    isDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

commentSchema.method("getCommentDetail", async function getCommentDetail() {
  return {
    _id: this._id,
    comments: this.comments,
    createdAt: await unixTime(this.createdAt),
  };
});

const Comment = model("Comment", commentSchema);

export default Comment;
