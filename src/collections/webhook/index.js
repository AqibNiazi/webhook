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
      const body_param = req.body;
      console.log(JSON.stringify(body_param, null, 2));

      if (
        body_param.object &&
        body_param.entry &&
        body_param.entry[0].changes
      ) {
        const message = body_param.entry[0].changes[0].value.messages[0];

        if (message) {
          const phone_no_id = message.metadata.phone_number_id;
          const from = message.from;

          const templateData = {
            messaging_product: "whatsapp",
            to: from,
            type: "template",
            template: {
              name: "hello_world",
              language: {
                code: "en_US",
              },
            },
          };

          await axios.post(
            `https://graph.facebook.com/v17.0/${phone_no_id}/messages?access_token=${whatsapp_token}`,
            templateData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          res.sendStatus(200);
        }
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      res.sendStatus(500);
    }
  });
  

  return routes;
};
