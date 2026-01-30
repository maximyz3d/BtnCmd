#!/usr/bin/env node

const mqtt = require("mqtt");
const axios = require("axios");
const https = require("https");
const fs = require("fs");

const config = {
  mqttUrl: process.env.MQTT_URL || "mqtt://localhost:1883",
  mqttTopic: process.env.MQTT_TOPIC || "pendant/btn",
  dwcUrl: process.env.DWC_URL || "https://duet.local",
  dwcPassword: process.env.DWC_PASSWORD || "",
  dwcTlsInsecure: process.env.DWC_TLS_INSECURE === "1",
  buttonMapFile: process.env.BUTTON_MAP_FILE || "",
};

const client = mqtt.connect(config.mqttUrl);
let buttonMap = {};

function loadButtonMap() {
  if (!config.buttonMapFile) {
    return {};
  }
  try {
    const raw = fs.readFileSync(config.buttonMapFile, "utf8");
    const parsed = JSON.parse(raw);
    return Object.keys(parsed).reduce((acc, key) => {
      acc[key.toUpperCase()] = parsed[key];
      return acc;
    }, {});
  } catch (error) {
    process.stderr.write(`Failed to load button map: ${error.message}\n`);
    return {};
  }
}

buttonMap = loadButtonMap();

function buildDwcEndpoint(command) {
  const encoded = encodeURIComponent(command);
  if (config.dwcPassword) {
    return `${config.dwcUrl}/machine/code?gcode=${encoded}&password=${encodeURIComponent(
      config.dwcPassword
    )}`;
  }
  return `${config.dwcUrl}/machine/code?gcode=${encoded}`;
}

async function sendGcode(command) {
  const url = buildDwcEndpoint(command);
  const httpsAgent = config.dwcTlsInsecure
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;
  await axios.post(url, null, { timeout: 5000, httpsAgent });
  process.stdout.write(`Sent gcode: ${command}\n`);
}

client.on("connect", () => {
  process.stdout.write(`Connected to MQTT: ${config.mqttUrl}\n`);
  client.subscribe(config.mqttTopic, (err) => {
    if (err) {
      process.stderr.write(`Failed to subscribe: ${err.message}\n`);
      process.exit(1);
    }
    process.stdout.write(`Subscribed to: ${config.mqttTopic}\n`);
  });
});

client.on("message", async (topic, message) => {
  const payload = message.toString("utf8").trim();
  if (!payload) {
    return;
  }
  const mapped = buttonMap[payload.toUpperCase()] || payload;
  try {
    await sendGcode(mapped);
  } catch (error) {
    const reason = error.response?.data?.result || error.message;
    process.stderr.write(`Failed to send gcode: ${mapped} (${reason})\n`);
  }
});

client.on("error", (error) => {
  process.stderr.write(`MQTT error: ${error.message}\n`);
});
