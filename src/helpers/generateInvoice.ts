import { readFileSync, writeFileSync } from "fs";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import { fileUrl, numberToWord } from "./helper";

const generateHtml = async (host: string, data: any, fileName: string) => {
  const context = {
    data: data,
    amountInwords: (await numberToWord(Number(data?.grandTotal))).toUpperCase(),
    signatureUrl: data?.signature ?process.env.NODE_ENV === 'dev' ? `http://${host}:${process.env.PORT}/` + data?.signature.split("public/")[1] : `https://${host}:${process.env.PORT}/` + data?.signature.split("public/")[1] :''
  };

  const content = readFileSync(fileName, "utf8");

  const template = Handlebars.compile(content);

  Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
  });


  Handlebars.registerHelper('formatDate', function (dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear())
    return `${day}-${month}-${year}`;
  });
  return template(context);
};

const createInvoice = async (host: string, fileName: string, data: any) => {
  const html: any = await generateHtml(host, data, fileName);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");
  const file = await page.pdf({ printBackground: true, format: "A4" });
  await browser.close();

  const filename = `invoice-${Date.now()}.pdf`;
  writeFileSync(`public/files/${filename}`, file, "base64");
  return fileUrl(host, filename);
};

export default createInvoice;
