const express = require("express");
const routes = express.Router();
const axios = require("axios");
require("dotenv").config();

const whatsapp_token = process.env.WHATSAPP_TOKEN;
const verify_token = process.env.VERIFY_TOKEN;
module.exports = () => {
  routes.get("/", (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];
    if (mode && token) {
      if (mode === "subscribe" && token === verify_token) {
        console.log("Webhook verified");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });
  routes.post("/", (req, res) => {
    let body_param = req.body;
    console.log(JSON.stringify(body_param, null, 2));
    
    if (body_param.object === "page") {
      if (
        body_param.entry &&
        body_param.entry[0].messaging &&
        body_param.entry[0].messaging[0].message &&
        body_param.entry[0].messaging[0].message.text
      ) {
        let senderId = body_param.entry[0].messaging[0].sender.id;
        let userMessage = body_param.entry[0].messaging[0].message.text;

        try {
          axios({
            method: "POST",
            url:
              "https://graph.facebook.com/v17.0/me/messages?access_token=" +
              whatsapp_token,
            data: {
              messaging_type: "RESPONSE",
              recipient: { id: senderId },
              message: { text: "You said: " + userMessage },
            },
            headers: { "Content-Type": "application/json" },
          });

          res.sendStatus(200);
        } catch (error) {
          console.error("Error sending message:", error);
          res.sendStatus(500);
        }
      }
    } else {
      res.sendStatus(404);
    }
  });

  return routes;
};
