import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { readFileSync, writeFileSync } from "fs";
import { createSlug } from "./helper";
import Email from "../models/email";
import constants from "../utils/constants";

const generateHtml = async (data: any) => {
  try {
    const context = {
      body: data,
    };
    const content = readFileSync("public/templates/mail.html", "utf8");
    const template = Handlebars.compile(content);
    return template(context);
  } catch (err) {
    console.log(err);
  }
};

const addPayload = async (data: any, payload: any) => {
  try {
    const context = {
      payload: payload,
    };
    const template = Handlebars.compile(await generateHtml(data));
    return template(context);
  } catch (err) {
    console.log(err);
  }
};

const sendMail = async (payload: any) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  Email.findOne({
    slug: await createSlug(payload.title),
  })
    .then(async (data: any) => {

      let mailData = addPayload(data?.body, payload?.data)
      if (!data) {
        constants.message.dataNotFound;
      } else {

        const mailOptions: any = {
          from: `Poonam Coatings ${process.env.SMTP_USER}`,
          to: payload?.to,
          subject: data?.subject,
          html: await addPayload(data.body, payload.data),
        };
        if (payload.attachments && payload.attachments.length > 0) {
          mailOptions.attachments = payload.attachments.map((attachment: any) => ({
            filename: attachment.filename,
            content: Buffer.from(attachment.content), // Correctly construct Buffer
            contentType: attachment.contentType,
          }));
        }
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            return true;
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

export default sendMail;
