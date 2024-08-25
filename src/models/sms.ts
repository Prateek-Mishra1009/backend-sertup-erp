import { Schema, model } from "mongoose";
import { createSlug, unixTime } from "../helpers/helper";
import constants from "../utils/constants";

const smsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

smsSchema.method("getSmsDetail", async function getSmsDetail() {
  return {
    _id: this._id,
    title: this.title,
    slug: this.slug,
    body: this.body,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    deletedBy: this.deletedBy,
    createdAt: await unixTime(this.createdAt),
    updatedAt: await unixTime(this.updatedAt),
  };
});

const SMS = model("sms", smsSchema);

const templates = [
  {
    title: constants.smsTitle.otp,
    body: "Sparepart Wale: message is your verification code. DO NOT SHARE this code with anyone, including the delivery executive.",
  },
];

const customTemplates = async () => {
  for (let i = 0; i < templates.length; i++) {
    SMS.findOneAndUpdate(
      { slug: await createSlug(templates[i].title) },
      {
        title: templates[i].title,
        slug: await createSlug(templates[i].title),
        body: templates[i].body,
      },
      { upsert: true }
    )
      .then((data) => {})
      .catch((err: any) => {
        console.log(err);
      });
  }
};

customTemplates();

export default SMS;
