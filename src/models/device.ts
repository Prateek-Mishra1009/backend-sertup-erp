import { Schema, model } from "mongoose";

const deviceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    deviceId: {
      //the device ID is a unique, anonymized string of numbers and letters that identifies every individual smartphone or tablet in the world
      type: String,
      required: true,
    },
    appId: {
      //the app id, usually something like com.moodle.moodlemobile
      type: String,
      required: true,
    },
    name: {
      //the device name, occam or iPhone etc..
      type: String,
      required: true,
    },
    model: {
      //the device model, Nexus 4 or iPad 1,1
      type: String,
      required: true,
    },
    platform: {
      //the device platform, Android or iOS etc
      type: String,
      required: true,
    },
    version: {
      //The device version, 6.1.2, 4.2.2 etc..
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    latitude: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    longitude: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Device = model("device", deviceSchema);

export default Device;
