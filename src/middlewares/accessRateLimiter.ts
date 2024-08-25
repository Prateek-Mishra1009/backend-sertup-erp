import { rateLimit } from "express-rate-limit";
import constants from "../utils/constants";

const accessRateLimiter = rateLimit({
  windowMs: 10000 * 10,
  max: 100,
  message: {
    status: false,
    userStatus: false,
    message: constants.message.retry,
  },
  statusCode: constants.code.tooManyRequests,
  headers: true,
});

export default accessRateLimiter;
