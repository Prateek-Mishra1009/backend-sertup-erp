import { Schema, model } from "mongoose";
import constants from "../utils/constants";
import { unixTime, getUsername, hashPassword } from "../helpers/helper";

const userSchema = new Schema(
  {
    profilePicture: { type: String },
    profilePictureUrl: { type: String },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: {
      value: { type: String, required: true, unique: true },
      is_verified: { type: Boolean, required: true, default: false },
    },
    department_id: { type: Schema.Types.ObjectId, ref: "Department" },
    phone: {
      value: { type: String, required: true, unique: true },
      is_verified: { type: Boolean, required: true, default: false },
    },
    password: { type: String, required: true },
    gender: { type: String },
    dob: { type: Date },
    is_2FA: {
      value: { type: Boolean, required: true, default: false },
      is_verified: { type: Boolean, required: true, default: false },
    },
    is_verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    notification: {
      push_notification: { type: Boolean, required: true, default: true },
      email_notification: { type: Boolean, required: true, default: true },
      sms_notification: { type: Boolean, required: true, default: true },
    },
    acceptance: { type: Boolean, required: true, default: false },
    role: {
      type: Number,
      enum: [
        constants.accountLevel.superAdmin,
        constants.accountLevel.admin,
        constants.accountLevel.inventorymanager,
        // constants.accountLevel.user,
        constants.accountLevel.manager,
      ],
      // default: constants.accountLevel.user,
      required: true,
    },
    privileges: {
      type: Map,
      of: Array,
    },
    verifyToken: { type: String },
    registrationVia: {
      type: String,
      enum: [
        constants.registrationType.google,
        constants.registrationType.normal,
      ],
      default: constants.registrationType.normal,
    },
    availability: {
      type: Boolean,
    },
    registrationNumber: { type: String },
    platform: { type: String },
    // referral_id: { type: String },
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

userSchema.method("getUserDetail", async function getUserDetail() {
  return {
    _id: this._id,
    profilePicture: this.profilePicture,
    profilePictureUrl: this.profilePictureUrl,
    fname: this.fname,
    lname: this.lname,
    department_id: this.department_id,
    email: this.email,
    username: this.username,
    gender: this.gender,
    dob: await unixTime(this.dob),
    phone: this.phone,
    role: this.role,
    is_2FA: this.is_2FA,
    privileges: this.privileges,
    notification: this.notification,
    status: this.status,
    isDeleted: this.isDeleted,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    deletedBy: this.deletedBy,
    createdAt: await unixTime(this.createdAt),
    updatedAt: await unixTime(this.updatedAt),
  };
});

userSchema.method("getAuthDetail", async function getAuthDetail() {
  return {
    email: this.email?.value,
    phone: this.phone?.value,
    role: this.role,
    is_2FA: this.is_2FA,
    privileges: this.privileges,
  };
});

const User = model("user", userSchema);

User.exists({
  "email.value": `admin@poonamcoatings.com`,
}).then(async (data) => {
  if (!data) {
    await User.create({
      fname: "Super",
      lname: "Admin",
      username: await getUsername("admin@poonamcoatings.com"),
      email: {
        value: `admin@poonamcoatings.com`,
      },
      password: await hashPassword("Super@1234"),
      phone: {
        value: "+910101010108",
      },
      role: constants.accountLevel.superAdmin,
      privileges: [
        [
          constants.privileges.user_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.email_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.buyers_and_suppliers_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.calendar_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.configuration_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.department_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.company_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.payment_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.sales_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.purchase_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.inventory_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.sms_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.production_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.payment_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.reports_intelligence_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.resource_planning_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.account_tally_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.catalogue_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
        [
          constants.privileges.order_management,
          [
            constants.rights.read,
            constants.rights.write,
            constants.rights.delete,
          ],
        ],
      ],
    })
      .then((data) => {
        console.log(constants.message.superAdmin);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

export default User;
