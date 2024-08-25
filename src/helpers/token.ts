import { sign } from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { verify } from "jsonwebtoken";
import Token from "../models/token";
import { randomKey, randomiv, randomToken } from "./helper";
import constants from "../utils/constants";
import User from "../models/user";
import mongoose from "mongoose";

const createToken = async (payload: Object) => {
  try {
    const token = sign(payload, `${process.env.JWT_SECRET}`, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
      issuer: process.env.JWT_ISSUER,
    });

    const key = await randomKey();
    const iv = await randomiv();
    const newToken = await randomToken();

    const encrypted = CryptoJS.AES.encrypt(token, key, { iv: iv });
    const msg = encrypted.toString();

    await Token.create({
      tokenable_type: "jwt",
      tokenable_id: newToken,
      name: "bearer",
      token: msg,
      key: key,
      iv: iv,
    }).catch((err) => {
      console.log(err);
    });

    return newToken;
  } catch (err) {
    console.log(err);
  }
};

const createTokenMobile = async (payload: Object) => {
  try {
    const token = sign(payload, `${process.env.JWT_SECRET}`, {
      expiresIn: process.env.JWT_EXPIRE_TIME_MOBILE,
      issuer: process.env.JWT_ISSUER,
    });

    const key = await randomKey();
    const iv = await randomiv();
    const newToken = await randomToken();

    const encrypted = CryptoJS.AES.encrypt(token, key, { iv: iv });
    const msg = encrypted.toString();

    await Token.create({
      tokenable_type: "jwt",
      tokenable_id: newToken,
      name: "bearer",
      token: msg,
      key: key,
      iv: iv,
    }).catch((err) => {
      console.log(err);
    });

    return newToken;
  } catch (err) {
    console.log(err);
  }
};

const deleteToken = async (token: String) => {
  try {
    Token.deleteMany({ tokenable_id: token }).then((data) => {
      if (!data) {
        throw constants.message.dataNotFound;
      } else {
        return true;
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const deleteAllToken = async (token: String) => {
  try {
    Token.findOne({ tokenable_id: token })
      .then((data) => {
        if (!data) {
          throw constants.message.dataNotFound;
        } else {
          const key = CryptoJS.enc.Hex.parse(data.key);
          const iv = CryptoJS.enc.Hex.parse(data.iv);
          const decrypted = CryptoJS.AES.decrypt(data.token, key, { iv: iv });
          const decryptedToken = decrypted.toString(CryptoJS.enc.Utf8);

          verify(
            decryptedToken,
            `${process.env.JWT_SECRET}`,
            {
              issuer: process.env.JWT_ISSUER,
            },
            async (err, jwt_payload: any) => {
              if (err) {
                throw err.message;
              } else {
                User.findById({
                  _id: new mongoose.Types.ObjectId(jwt_payload.id),
                })
                  .then(async (user) => {
                    if (!user) {
                      throw constants.message.dataNotFound;
                    } else {
                      const Tokens = await Token.find().then((data: any) => {
                        return data;
                      });

                      if (Tokens.length > 0) {
                        for (let i = 0; i < Tokens.length; i++) {
                          const key = CryptoJS.enc.Hex.parse(Tokens[i].key);
                          const iv = CryptoJS.enc.Hex.parse(Tokens[i].iv);
                          const decrypted = CryptoJS.AES.decrypt(
                            Tokens[i].token,
                            key,
                            {
                              iv: iv,
                            }
                          );
                          const decryptedToken = decrypted.toString(
                            CryptoJS.enc.Utf8
                          );

                          verify(
                            decryptedToken,
                            `${process.env.JWT_SECRET}`,
                            {
                              issuer: process.env.JWT_ISSUER,
                            },
                            async (err, users: any) => {
                              if (err) {
                                return;
                              } else {
                                if (user?._id?.toString() === users.id) {
                                  Token.deleteOne({
                                    tokenable_id: Tokens[i].tokenable_id,
                                  })
                                    .then((data) => {
                                      if (!data) {
                                        throw constants.message.dataNotFound;
                                      }
                                    })
                                    .catch((err: any) => {
                                      console.log(err);
                                    });
                                }
                              }
                            }
                          );
                        }
                      }
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            }
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

export { createToken, createTokenMobile, deleteToken, deleteAllToken };
