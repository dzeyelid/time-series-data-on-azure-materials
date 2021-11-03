'use strict';

require('dotenv').config()

const getSdk = require('obniz-cloud-sdk').getSdk;
const Obniz = require('obniz');
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

let runningIntervalId = null;

// IoT Hub と接続する
const setupIoTHubClient = (deviceConnectionString) => {
  const client = Client.fromConnectionString(deviceConnectionString, Protocol);

  const disconnectHandler = () => {
    clearInterval(runningIntervalId);
    runningIntervalId = null;
    client.open().catch((err) => {
      console.error(err.message);
    });
  }

  const errorHandler = (err) => {
    console.error(err.message);
  }

  const connectHandler = () => {
    console.log('Client connected');
  }

  client.on('connect', connectHandler);
  client.on('error', errorHandler);
  client.on('disconnect', disconnectHandler);

  client.open()
    .catch(err => {
      console.error('Could not connect: ' + err.message);
    });

  return client;
}

// メッセージ生成
const generateMessage = (data) => {
  const message = new Message(JSON.stringify(data));
  message.contentType = 'application/json';
  return message;
}

// Obniz ホステッドアプリ
async function runApp(token) {
  const sdk = getSdk(token);
  const result = await sdk.app();

  // このアプリがインストールされた各 obniz に対して、処理を行う
  for (const edge of result.app.installs.edges) {
    try {
      console.log(edge.node);
  
      const { id, access_token } = edge.node;
      const obniz = access_token ? new Obniz(id, { access_token }) : new Obniz(id);
  
      const { iothub_name, iothub_device_id, iothub_device_shared_access_key } = JSON.parse(edge.node.configs);
      const iothub_device_connection_string = `HostName=${iothub_name}.azure-devices.net;DeviceId=${iothub_device_id};SharedAccessKey=${iothub_device_shared_access_key}`;
      const iotHubClient = setupIoTHubClient(iothub_device_connection_string);
  
      obniz.onconnect = async () => {
        // 人感センサの変化を受信する
        const motionSensor = obniz.wired("Keyestudio_PIR", { signal: 0, vcc: 1, gnd: 2 });
        motionSensor.onchange = async val => {
          console.log(val);
  
          // IoTHub クライアントでメッセージを送信する
          const message = generateMessage({ deviceId: id, motion: val });
          iotHubClient.sendEvent(message);
        }
  
        // 定期的に温度を取得する
        const tempSensor = obniz.wired("Keyestudio_TemperatureSensor", { signal: 8, vcc: 9, gnd: 10 });
        const getTemp = async () => {
          const temp = await tempSensor.getWait();
   
          console.log("temp = " + temp + " .");
  
          // IoTHub クライアントでメッセージを送信する
          const message = generateMessage({ deviceId: id, temp });
          iotHubClient.sendEvent(message);
        }
        runningIntervalId = setInterval(getTemp, 2000);
      };
    } catch (e) {
      console.log(e.message);
    }
  }
  return result.app;
}

// Obniz ホステッドアプリを起動する
runApp(process.env.OBNIZ_CLOUD_APP_TOKEN);
