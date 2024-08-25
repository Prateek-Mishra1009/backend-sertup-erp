import { Request, Response, NextFunction } from "express";
import multer, { diskStorage } from "multer";
import constants from "../utils/constants";

//Profile Picture
const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/photos");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}.${ext}`);
  },
});

const multerFilter = (req: any, file: any, cb: any) => {
  let allowedMimes = [
    // "image/jpeg",
    // "image/jpg",
    // "image/png",
    "image/webp",
    // "image/avif",
    // "image/heif",
    // "image/heic",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    return cb(new Error(constants.message.invalidFileType));
  }
};
const multerFilterForSignature = (req: any, file: any, cb: any) => {
  let allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    // "image/avif",
    // "image/heif",
    // "image/heic",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    return cb(new Error(constants.message.invalidFileType));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profile_picture");

const handleProfileUpload = (req: any, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    } else if (err) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    }
    next();
  });
};


const multerLogoStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/logos");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}.${ext}`);
  },
});

const multerSignatureStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/signatures");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}.${ext}`);
  },
});

const uploadSignature=multer({
  storage: multerSignatureStorage,
  fileFilter: multerFilterForSignature,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("company_signature");

const uploadLogo=multer({
  storage: multerLogoStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("company_logo");


const handleSignatureUpload = (req: any, res: Response, next: NextFunction) => {
  uploadSignature(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    } else if (err) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    }
    next();
  });
};



const handleLogoUpload = (req: any, res: Response, next: NextFunction) => {
  uploadLogo(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    } else if (err) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    }
    next();
  });
};

//Single Image
const multerStorageTwo = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}.${ext}`);
  },
});

const uploadTwo = multer({
  storage: multerStorageTwo,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("file");

const handleImageUpload = (req: any, res: Response, next: NextFunction) => {
  uploadTwo(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    } else if (err) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    }
    next();
  });
};

// Multiple files with multiple names
const multerStorageThree = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/files");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}${Math.floor(Math.random() * 10000)}.${ext}`);
  },
});

const multerFilterTwo = (req: any, file: any, cb: any) => {
  let allowedMimes = ["application/pdf"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    return cb(new Error(constants.message.invalidFileType));
  }
};

const uploadThree = multer({
  storage: multerStorageThree,
  fileFilter: multerFilterTwo,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  {
    name: "aadharCard",
    maxCount: 1,
  },
  {
    name: "panCard",
    maxCount: 1,
  },
]);

const handleFilesUpload = (req: any, res: Response, next: NextFunction) => {
  uploadThree(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    } else if (err) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    }
    next();
  });
};

// Multiple Images
const multerStorageFour = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}${Math.floor(Math.random() * 10000)}.${ext}`);
  },
});

const uploadFour = multer({
  storage: multerStorageFour,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 10);

const handleImagesUpload = (req: any, res: Response, next: NextFunction) => {
  uploadFour(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    } else if (err) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    }
    next();
  });
};

// Excel File
const multerStorageFive = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/files");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}.xlsx`);
  },
});

const multerFilterFive = (req: any, file: any, cb: any) => {
  let allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    return cb(new Error(constants.message.invalidFileType));
  }
};

const uploadFive = multer({
  storage: multerStorageFive,
  fileFilter: multerFilterFive,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("excelFile");

const handleExcelUpload = (req: any, res: Response, next: NextFunction) => {
  uploadFive(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    } else if (err) {
      return res.status(constants.code.preconditionFailed).json({
        status: constants.status.statusFalse,
        userStatus: req.status,
        message: err.message,
      });
    }
    next();
  });
};

export {
  handleProfileUpload,
  handleImageUpload,
  handleFilesUpload,
  handleImagesUpload,
  handleExcelUpload,
  handleLogoUpload,
  handleSignatureUpload
};
