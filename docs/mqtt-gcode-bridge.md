# MQTT → DWC G-code Bridge

This example bridge listens for pendant MQTT messages and forwards each payload as g-code to Duet Web Control. You can also map button IDs (0-9, A-E, U-Z, etc.) to g-code using a JSON mapping file.

## Prerequisites

- Node.js 18+ recommended.
- Access to your MQTT broker and DWC endpoint.

## Install dependencies

```bash
npm install mqtt axios
```

## Run the bridge

```bash
MQTT_URL=mqtt://localhost:1883 \
MQTT_TOPIC=pendant/btn \
DWC_URL=https://duet.local \
DWC_PASSWORD=your_password \
BUTTON_MAP_FILE=config/button-map.json \
node scripts/mqtt-gcode-bridge.js
```

## Publish a test message

```bash
mosquitto_pub -h localhost -t pendant/btn -m "G1 X10 Y10 F3000"
```

## Notes

- Each MQTT payload is treated as a full g-code line.
- If you set `BUTTON_MAP_FILE`, the bridge will look up the payload in the JSON map first and send the mapped g-code.
- If you do not set `DWC_PASSWORD`, the bridge will omit the password query parameter.
- Update `DWC_URL` to your DWC host or IP.
- If your DWC uses a self-signed TLS certificate, set `DWC_TLS_INSECURE=1` to skip certificate verification.

## Button map example

Copy the example file to `config/button-map.json` and edit the g-code values to match the commands you want to run.

```bash
cp config/button-map.example.json config/button-map.json
```
