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
    if (body_param.object) {
      if (
        body_param.entry &&
        body_param.entry[0].changes &&
        body_param.entry[0].changes[0].value.messages &&
        body_param.entry[0].changes[0].value.messages[0]
      ) {
        let phone_no_id =
          body_param.entry[0].changes[0].value.metadata.phone_number_id;
        let from = body_param.entry[0].changes[0].value.messages[0].from;
        let msg_body =
          body_param.entry[0].changes[0].value.messages[0].text.body;
        try {
          axios({
            method: "POST",
            url:
              "https://graph.facebook.com/v17.0/" +
              phone_no_id +
              "/messages?access_token=" +
              whatsapp_token,
            data: {
              messaging_product: "whatsapp",
              to: from,
              text: {
                body: "This is some text." + msg_body,
              },
            },
            headers: {
              "Content-Type": "application/json",
            },
          });

          res.sendStatus(200);
        } catch (error) {
          console.error("Error sending message:", error);
          res.sendStatus(500); // Send an error response if something goes wrong
        }
      }
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404);
    }
  });

  return routes;
};
