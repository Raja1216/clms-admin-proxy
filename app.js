const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

app.disable("etag").disable("x-powered-by");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());

const allowedOrigins = [process.env.ORIGIN];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origin is not allowed"));
      console.log(false);
    }
  },
};

// app.options("*", cors(corsOptions));

app.use(
  "",
  cors(corsOptions),
  createProxyMiddleware({
    target: process.env.IDENTITY_URI,
    changeOrigin: true,
    // pathRewrite: {
    //   ["^/api"]: "",
    // },
    onProxyReq(proxyReq, req, res) {
      // add new header to request
      if (req.body) {
        let tempBodyData = req.body;
        tempBodyData.client_id = process.env.OAUTH_CLIENT_ID;
        tempBodyData.client_secret = process.env.OAUTH_CLIENT_SECRET;
        tempBodyData.scope = process.env.OAUTH_SCOPE;
        let bodyData = JSON.stringify(tempBodyData);
        // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
      }
    },

    pathRewrite(pathReq, req) {
      const pathname = pathReq.split("?")[0];
      let url = pathname;
      url = Object.entries(req.query).reduce(
        (newUrl, [key, value]) => `${newUrl}&${key}=${encodeURI(value)}`,
        url
      );
      return url;
    },
  })
);

module.exports = app;
