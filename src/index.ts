import "dotenv/config";
import mongodbSetup from "./config/mongodb";
import expressServerSetup from "./config/express";
import { firebaseSetup } from "./config/firebase";
import { connectElasticsearch } from "./config/elasticsearch";
import { appendFileSync } from "fs";
import moment from "moment";

const main = async () => {
  // initialize firebase admin sdk
  firebaseSetup();

  //await mongodbSetup();
  //await connectElasticsearch();

  let port = await expressServerSetup();

  console.log(`🚀 Server ready at http://${process.env["DOMAIN"]}:${port}/api`);
};

console.log = function (data) {
  let today = moment(Date.now()).format("yyyy-MM-DD");
  let timestamp = moment(Date.now()).format("HH:mm:ss");
  appendFileSync(
    `${process.env.LOG_PATH}/log_${today}.txt`,
    `${timestamp}  ${data}\n`
  );
  process.stderr.write(`${timestamp}  ${data}\n`);
};

console.error = function (data) {
  let today = moment(Date.now()).format("yyyy-MM-DD");
  let timestamp = moment(Date.now()).format("HH:mm:ss");
  appendFileSync(
    `${process.env.LOG_PATH}/error_${today}.txt`,
    `ERROR ${timestamp}  ${data}\n`
  );
  process.stderr.write(`ERROR ${timestamp}  ${data}\n`);
};

console.warn = function (data) {
  let today = moment(Date.now()).format("yyyy-MM-DD");
  let timestamp = moment(Date.now()).format("HH:mm:ss");
  appendFileSync(
    `${process.env.LOG_PATH}/error_${today}.txt`,
    `WARN  ${timestamp}  ${data}\n`
  );
  process.stderr.write(`WARN  ${timestamp}  ${data}\n`);
};

import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8081 });
console.log("start server");
wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  console.log("connection");
  ws.on('message', function message(data) {
    console.log('received: ${data}');
  });

  ws.send('something');
});

console.log("Starting server...");

process.on("uncaughtException", function (error) {
  console.error(error.stack);
});

main().catch((error: any) => {
  console.error(error);
});
