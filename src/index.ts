import express, { Express } from "express";
import http from "http";
import https from "https";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";
import dbConfig from "./config/db";
import router from "./routes";

//Configuration
dotenv.config();
const app: Express = express();

const whitelist = [process.env.ADMIN_ADDRESS];

const corsOptionsDelegate = (req: any, callback: any) => {
  let corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true, methods: ["GET", "POST", "PUT", "DELETE"] };
    if (req.path.endsWith(".*")) {
      corsOptions = { origin: true, methods: ["GET"] };
    }
  } else {
    corsOptions = { origin: false };
    console.log("Not allowed by CORS.");
  }
  callback(null, corsOptions);
};

app.use(cors(), express.json({ limit: "80mb" }), express.static("public"));
dbConfig(process.env.ATLAS_URL, process.env.LOCAL_URL);
router(app);

const privateKeyFile = readFileSync(
  path.join(__dirname, "./config/ssl/development/privkey.pem"),
  "utf8"
);

const fullChainFile = readFileSync(
  path.join(__dirname, "./config/ssl/development/fullchain.pem"),
  "utf8"
);

const httpServer = http.createServer(app);

const httpsServer = https.createServer(
  {
    key: privateKeyFile,
    cert: fullChainFile,
  },
  app
);

if (process.env.NODE_ENV === "dev") {
  httpServer.listen(process.env.PORT, () => {
    console.log(`HTTP Server is running on port ${process.env.PORT}`);
  });
} else {
  httpsServer.listen(process.env.PORT, () => {
    console.log(`HTTPS Server is running on port ${process.env.PORT}`);
  });
}
