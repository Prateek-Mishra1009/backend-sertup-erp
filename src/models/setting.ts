import { Schema, model } from "mongoose";
import { unixTime } from "../helpers/helper";

const settingSchema = new Schema(
  {
    webMaintenance: {
      time: { type: Date },
      status: { type: Boolean, default: false },
    },
    appMaintenance: {
      time: { type: Date },
      status: { type: Boolean, default: false },
    },
    inventoryMaintenance: {
      time: { type: Date },
      status: { type: Boolean, default: false },
    },
    inventoryAppMaintenance: {
      time: { type: Date },
      status: { type: Boolean, default: false },
    },
    supportMaintenance: {
      time: { type: Date },
      status: { type: Boolean, default: false },
    },
    AccessKey: {
      type: String,
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

settingSchema.method("getSettingDetail", async function getSettingDetail() {
  return {
    webMaintenance: {
      status: this.webMaintenance?.status,
      time: await unixTime(this.webMaintenance?.time),
    },
    appMaintenance: {
      status: this.appMaintenance?.status,
      time: await unixTime(this.appMaintenance?.time),
    },
    inventoryMaintenance: {
      status: this.inventoryMaintenance?.status,
      time: await unixTime(this.inventoryMaintenance?.time),
    },
    inventoryAppMaintenance: {
      status: this.inventoryAppMaintenance?.status,
      time: await unixTime(this.inventoryAppMaintenance?.time),
    },
    supportMaintenance: {
      status: this.supportMaintenance?.status,
      time: await unixTime(this.supportMaintenance?.time),
    },
    createdAt: await unixTime(this.createdAt),
    updatedAt: await unixTime(this.updatedAt),
  };
});

settingSchema.method(
  "getWebMaintenanceDetail",
  async function getWebMaintenanceDetail() {
    return {
      status: this.webMaintenance?.status,
      time: await unixTime(this.webMaintenance?.time),
    };
  }
);

settingSchema.method(
  "getAppMaintenanceDetail",
  async function getAppMaintenanceDetail() {
    return {
      status: this.appMaintenance?.status,
      time: await unixTime(this.appMaintenance?.time),
    };
  }
);

settingSchema.method(
  "getInventoryMaintenanceDetail",
  async function getInventoryMaintenanceDetail() {
    return {
      status: this.inventoryMaintenance?.status,
      time: await unixTime(this.inventoryMaintenance?.time),
    };
  }
);

settingSchema.method(
  "getInventoryAppMaintenanceDetail",
  async function getInventoryAppMaintenanceDetail() {
    return {
      status: this.inventoryAppMaintenance?.status,
      time: await unixTime(this.inventoryAppMaintenance?.time),
    };
  }
);

settingSchema.method(
  "getSupportMaintenanceDetail",
  async function getSupportMaintenanceDetail() {
    return {
      status: this.supportMaintenance?.status,
      time: await unixTime(this.supportMaintenance?.time),
    };
  }
);

const Setting = model("setting", settingSchema);

Setting.exists({
  AccessKey: `fkYXLn6xB3tRC8ThMDsF4jwUvrKuHSXXWCqt8xxeJJS2to0hZ5Tu77XFneZyZ8`,
}).then((data) => {
  if (!data) {
    Setting.create({
      AccessKey: `fkYXLn6xB3tRC8ThMDsF4jwUvrKuHSXXWCqt8xxeJJS2to0hZ5Tu77XFneZyZ8`,
    });
  }
});

export default Setting;
