const express = require("express");
const routes = express.Router();

const webhook = require("./webhook");

module.exports = () => {
  //Main routes
  routes.use("/webhook", webhook());
  return routes;
};
