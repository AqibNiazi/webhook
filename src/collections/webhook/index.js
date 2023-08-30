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
  routes.post("/", async (req, res) => {
    try {
      // Parse the request body from the POST
      // let body = req.body;

      // Check the Incoming webhook message
      console.log(JSON.stringify(req.body, null, 2));

      // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
      if (req.body.object) {
        if (
          req.body.entry &&
          req.body.entry[0].changes &&
          req.body.entry[0].changes[0] &&
          req.body.entry[0].changes[0].value.messages &&
          req.body.entry[0].changes[0].value.messages[0]
        ) {
          let phone_number_id =
            req.body.entry[0].changes[0].value.metadata.phone_number_id;
          let from = req.body.entry[0].changes[0].value.messages[0].from;
          let msg_body =
            req.body.entry[0].changes[0].value.messages[0].text.body;

          await axios({
            method: "POST",
            url:
              "https://graph.facebook.com/v17.0/" +
              phone_number_id +
              "/messages?access_token=" +
              whatsapp_token,
            data: {
              messaging_product: "whatsapp",
              to: from,
              text: { body: "Ack: " + msg_body },
            },
            headers: { "Content-Type": "application/json" },
          });

          res.sendStatus(200);
        } else {
          // Return a '400 Bad Request' if message data is missing
          res.sendStatus(400);
        }
      } else {
        // Return a '404 Not Found' if event is not from a WhatsApp API
        res.sendStatus(404);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      // Return a '500 Internal Server Error' on unexpected errors
      res.sendStatus(500);
    }
  });


  return routes;
};
