const express = require("express");
const bodyParser = require("body-parser");
const router = require("./src/collections");
require("dotenv").config();
const app = express();

const NodeJsServer = async () => {
  try {
    app.use(bodyParser.json());

    app.use(router());
    app.listen(process.env.PORT || 8080, () =>
      console.log("app is running on port http://localhost:8080")
    );
  } catch (error) {
    console.log("error", error);
  }
};
NodeJsServer();
