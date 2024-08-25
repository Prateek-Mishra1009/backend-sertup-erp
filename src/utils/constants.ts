// Messages
const message = {
  dbConnect: "MONGODB::Connected to database.",
  clConnect: "MONGODB::Connected to cluster.",
  retry: "Kindly Re-try After 10 Seconds",
  success: "Success",
  failed: "failed",
  columnNameMisMatching: `column name mismatching`,
  dataNotFound: "Data not found.",
  internalServerError: "Internal server error. Please try after some time.",
  unAuthAccess: "Unauthorized access.",
  reqAccessKey: "Access Key is required.",
  invalidAccesskey: "Invalid Access Key.",
  unwantedData: "Unwanted data found.",
  invalidEmail: "Invalid email address.",
  invalidEmailAddress: "You can not update email of primary address",
  invalidPhone: "Invalid phone number.",
  superAdmin: "Super Admin Created Successfully.",
  otpLength: "OTP length should be 6 digits.",
  otpSent:
    "A mail/message with 6 digit verification code is sent successfully.",
  otpMessageSent:
    "A message with 6 digit verification code is sent successfully.",
  otpMailSent: "A mail with 6 digit verification code is sent successfully.",
  invalidOTP: "Invalid OTP.",
  otpExpire:
    "The code has expired. Please re-send the verification code to try again.",
  otpSuccess: "Code verified successfully.",
  invalidAuthToken: "Invalid authentication token.",
  invalidVerifyToken: "Invalid verification token.",
  tokenExpire:
    "The token has expired. Please re-send the verification token to try again.",
  tokenSuccess: "Token verified successfully.",
  reqAccessToken: "Access Token is required.",
  invalidAccessToken: "Invalid Access Token.",
  emailTaken: "Email is already taken.",
  phoneTaken: "Phone number is already taken.",
  invalidPinCode: "Not a valid pincode.",
  invalidPSW: "Invalid password.",
  pswNotMatched: "The password confirmation does not match.",
  invalidValue: "Invalid value.",
  userSuccess: "Registered successfully.",
  invalidPassword: "Invalid password.",
  userInactive: "Your account is disabled.",
  userDeleted: "Your account is suspended.",
  invalidUser: "You are not a valid user.",
  userLogin: "User logged in successfully.",
  userDetail: "User details get successfully.",
  userUpdate: "User details updated successfully.",
  userDisable: "Your Account deactivated successfully.",
  userRemove: "Your Account deleted successfully.",
  logout: "Logout successfully.",
  logoutAll: "Logout from all devices successfully.",
  resetEmail: "A mail with reset link sent successfully.",
  reqProfilePic: "Profile Picture is required.",
  reqProductImages: "Product images is required.",
  diffPassword: "New Password should be different from the current password.",
  invalidOldPassword: "Invalid old password.",
  passChange: "Password changed Successfully.",
  twoFactoreOn: "Two-factor authentication turn on successfully.",
  twoFactorOff: "Two-factor authentication turn off successfully.",
  invalidType: "The selected type is invalid.",
  invalidAddress: "The selected address is invalid.",
  profileSuccess: "Profile picture updated successfully.",
  invalidDateTimeFormat: "Invalid date time format.",
  invalidTimeFormat: "Invalid time format.",
  invalidISOstring: "Invalid ISO string.",
  notOldEnough: "You must be of age 18 years or above.",
  emailVerified: "Email verified successfully.",
  phoneVerified: "Phone verified successfully.",
  emailUpdated: "Email address changed successfully.",
  phoneUpdated: "Phone number changed successfully.",
  addressExist: "Address already exist.",
  pushNotificationOn: "Push notification turn on successfully.",
  pushNotificationOff: "Push notification turn off successfully.",
  emailNotificationOn: "Email notification turn on successfully.",
  emailNotificationOff: "Email notification turn off successfully.",
  messageNotificationOn: "Message notification turn on successfully.",
  messageNotificationOff: "Message notification turn off successfully.",
  invalidPan: "Invalid pan number.",
  invalidAadhar: "Invalid aadhar number.",
  aadharTaken: "Aadhar Number already taken.",
  verifyEmail: "Kindly, verify your email address and try again.",
  verifyPhone: "Kindly, verify your phone number and try again.",
  panTaken: "Pan is already taken.",
  invalidAccNum: "Invalid account number.",
  AccNumExists: "Account number already exists.",
  invalidGSTNum: "Invalid GST number.",
  invalidIFSCCode: "Not a valid ifsc code.",
  reqVerified: "Kindly, verify your details and try again.",
  invalidCountryId: "Not a valid country_id.",
  invalidFileType: "Invalid file type.",
  excelFileReq: "Excel file is required.",
  recordNotFound: "No records found.",
  columnMissing: "Some of columns are missing.",
  unwantedColumns: "Unwanted columns found.",
  productVerifyReq: "Kindly, verify this product and try again.",
  addressNotLinked: "This address not associated with you.",
  addressVerifyReq: "Kindly, verify this address and try again.",
  timeIsGreater: "Time should be greater than current time.",
  badRequest: "Couldn't parse the specified URI.",
  invalidCategoryId: "Invalid category id.",
  invalidBrandId: "INvalid Brand id.",
  invalidSubCategoryId: "Invalid sub category id.",
  invalidVehicleNumber: "Invalid vehicle number.",
  invalidYear: `Invalid year`,
  invalidDomain: `invalid domain for email`,
  productNotFound: `Product not found`
};

// Response Status
const status = {
  statusTrue: true,
  statusFalse: false,
};

// Response Code
const code = {
  success: 200,
  FRBDN: 403,
  dataNotFound: 404,
  badRequest: 400,
  reqTimeOut: 408,
  unAuthorized: 401,
  PaymentRequired: 402,
  badMethod: 405,
  notAcceptable: 406,
  preconditionFailed: 412,
  unprocessableEntity: 422,
  tooManyRequests: 429,
  internalServerError: 500,
  badGateway: 502,
  serviceUnavailable: 503,
  gatewayTimeOut: 504,
  expectationFailed: 417,
};

// Registration Type
const registrationType = {
  normal: "normal",
  google: "google",
};

// email titles
const emailTitle = {
  otp: "Send OTP",
  resetPassword: "Reset Password",
  credential: "Credential",
  acceptRequest: "Accept Request",
  rejectRequest: "Reject Request",
  reachedMsl: "Minimum Stock Level Reached",
  quotation: "Sales Quotation",
  orderConfirmation: "Order Confirmation",
  orderShipped: "Order Shipped",
  orderDelivered: "Order Delivered",
  orderCancelled: "Order Cancelled",
  paymentFailed: "Payment Failed",
  paymentSuccess: "Payment Success",
  salesQuotation: "Quotation For Requested Products",
  purchaseQuotation: `Quotation Requested`,
  purchaseOrder: "Purchase order",
  salesOrder: `Sales Order`
};

// sms titles
const smsTitle = {
  otp: "Send OTP",
};
//User Level
const accountLevel = {
  superAdmin: 1,
  admin: 2,
  manager: 3,
  inventorymanager: 4
};
// Company Types
const companyType = {
  buyer: "Buyer",
  supplier: "Supplier",
  both: "Both",
};

// Seller Types
const sellerType = {
  direct_seller: "direct seller",
  bulk_seller: "bulk seller",
};

// Privileges
const privileges = {
  // user_management: "user_management",
  // department: "department_management",
  // email_management: "email_management",
  // cms_management: "cms_management",
  // feedback_management: "feedback_management",
  // configuration_management: "configuration_management",
  // address_management: "address_management",
  // product_management: "product_management",
  // inventory_management: "inventory_management",
  order_management: "order_management",
  // shipment_management: "shipment_management",
  // payment_management: "payment_management",
  // faq_management: "faq_management",
  // sms_management: "sms_management",
  // request_management: "request_management",
  buyers_and_suppliers_management: "buyers_and_suppliers_management",
  calendar_management: "calendar_management",
  department_management: "department_management",
  company_management: "company_management",
  user_management: "user_management",
  email_management: "email_management",
  sales_management: "sales_management",
  purchase_management: "purchase_management",
  inventory_management: "inventory_management",
  production_management: "production_management",
  payment_management: "payment_management",
  reports_intelligence_management: "reports_intelligence_management",
  resource_planning_management: "resource_planning_management",
  account_tally_management: "account_tally_management",
  sms_management: "sms_management",
  configuration_management: "configuration_management",
  catalogue_management: "catalogue_management"
};

// Rights
const rights = {
  read: "read",
  write: "write",
  delete: "delete",
};

// Constraints
const constraint = {
  primary: "primary",
  secondary: "secondary",
};

// Address Types
const addressTypes = {
  home: "home",
  work: "work",
  shipping: "shipping",
  warehouse: "warehouse",
};

// Device Types
const deviceTypes = {
  android: "Android",
  iphone: "iOS",
  web: "web",
};

// Catalouge Types
const catalougeTypes = {
  autoPart: "autoPart",
  autoMobile: "autoMobile",
};

// Bank Account Types
const bankAccountTypes = {
  saving: "saving",
  current: "current",
};

// Product origin
const productOrigin = {
  oem: "OEM",
  afterMarket: "afterMarket",
};

// Product standard
const productStandard = {
  nonStandard: "Non-Standard",
  standard: "Standard",
};

const productType = {
  Paint: "paint",
  Powder: "powder",
  Putty: "putty",
  Sheet: "sheet"
};
// Mass Units
const massUnit = {
  mg: "mg",
  g: "g",
  kg: "kg",
  l: "litre",
  ml: "ml",
  pack: "pack",
  Number: "Number"
};

const companyCategory =
{
  individual: "Individual",
  company: "Company"
}

const operationType = {
  add: "Add",
  remove: "Remove",
}



// Measurement units
const measureUnit = {
  mm: "mm",
  cm: "cm",
  m: "m",
};

const historyType = {
  StockTransfer: "stock-transfer",
  Inventory: "inventory"
}

const transportTerm = {
  toPay: 'To Pay',
  inInvoice: 'In Invoice',
  free: 'Free'
}
// GST values
const gstPercentage = {
  none: 0,
  fivePercent: 5,
  twelvePercent: 12,
  eighteenPercent: 18,
  twentyEightPercent: 28,
};

// Product Condition ratios
const productCondition = {
  veryPoor: 20,
  poor: 40,
  average: 60,
  good: 80,
  excellent: 100,
};

// Request Status
const requestStatus = {
  pending: 1,
  approved: 2,
  rejected: 3,
};

const paintType = {
  acrylic: "Acrylic",
  latex: "Latex",
  oil: "Oil-based"
}

const paintFinish = {
  matte: "Matte",
  gloss: "Gloss",
  others: "Others"
}
const colorType = {
  classic: "Classic",
  design: "Design",
  effect: "Effect",
  other: "others"
}

const paymentTerm = {
  Net30: "Net30",
  Net60: "Net60",
  Net90: "Net90",
  COD: "COD",
  PartialPayment: "partial",
  Prepaid: "prepaid"
}

const quotationType = {
  sales: 'sales',
  purchase: 'purchase'
}


const shippingStatus = {
  pending: `pending`,
  hold: 'onHold',
  partialShipped: `partially shipped`,
  shipped: `shipped`,
}

const manufactureType = {
  supplier: `supplier`,
  self: `self`
}



const orderType = {
  purchase: 'purchase',
  sales: 'sales',
  purchaseReturn: 'purchase return',
  salesReturn: 'sales return'
}
const primaryDocumentType = {
  purchase: 'PO',
  sales: 'SO',
  purchaseReturn: 'PR',
  salesReturn: 'SR'
}

const orderStatus = {
  pending: "pending",
  draft: 'draft',
  sentForApproval: 'sent for approval',
  partialllyShipped: "partially shipped",
  shipped: "shipped",
  partiallyDelivered: "partially delivered",
  delivered: "delivered",
  completed: "completed"
}

const invoiceTypes =
{
  purchaseOrder: "purchase order invoice",
  salesOrder: "sales order invoice",
  salesProformaInvoice: "sales proforma invoice",
  eInvoice: "E-invoice",
  eWayInvoice: "E-way invoice",
  deliveryChallan: "delivery challan invoice",
  creditNote: "credit-note invoice",
  salesQuotation: "sales quotation"


}

const paymentStatus =
{
  pending: "pending",
  paid: "paid",
  partiallyPaid: "partially paid"
}
const paymentMethod =
{
  cash: "cash",
  bankTransfer: 'bank transfer',
  cheque: "cheque"

}

const paymentMode =
{
  prepaid: 'prePaid',
  postPaid: 'postPaid',

}

const salesQuotationStatus =
{
  draft: "darft",
  sent: "sent",
  pending: "pending"
}


const paymentType = {
  credit: "credit",
  debit: "debit"
}

export default {
  message,
  status,
  code,
  emailTitle,
  smsTitle,
  registrationType,
  accountLevel,
  privileges,
  companyType,
  sellerType,
  rights,
  constraint,
  addressTypes,
  deviceTypes,
  catalougeTypes,
  bankAccountTypes,
  productOrigin,
  productType,
  massUnit,
  measureUnit,
  gstPercentage,
  productCondition,
  requestStatus,
  paintType,
  paintFinish,
  colorType,
  historyType,
  quotationType,
  shippingStatus,
  primaryDocumentType,
  orderStatus,
  paymentTerm,
  operationType,
  productStandard,
  companyCategory,
  orderType,
  manufactureType,
  invoiceTypes,
  paymentStatus,
  salesQuotationStatus,
  transportTerm,
  paymentMode,
  paymentType,
  paymentMethod
};
