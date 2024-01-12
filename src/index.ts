import "dotenv/config";
import mongodbSetup from "./config/mongodb";
import expressServerSetup from "./config/express";
import { firebaseSetup } from "./config/firebase";
import { connectElasticsearch } from "./config/elasticsearch";
import { appendFileSync } from "fs";
import moment from "moment";
import websocketSetup from "./config/websocket";
import { inspect } from "util";

/**
 * Main function.
 */
const main = async () => {
  // initialize firebase admin sdk
  firebaseSetup();
  await mongodbSetup(); // connect to mongodb
  await connectElasticsearch(); // connect to elasticsearch

  websocketSetup();
  let port = await expressServerSetup(); // start express server

  console.log(`🚀 Server ready at http://${process.env["DOMAIN"]}:${port}/api`);
};

console.log = function (data) {
  const stringified = typeof data === "object" ? inspect(data) : data;
  let today = moment(Date.now()).format("yyyy-MM-DD");
  let timestamp = moment(Date.now()).format("HH:mm:ss");
  appendFileSync(
    `${process.env.LOG_PATH}/log_${today}.txt`,
    `${timestamp}  ${stringified}\n`
  );
  process.stdout.write(`${timestamp}  ${stringified}\n`);
};

console.error = function (data) {
  const stringified = typeof data === "object" ? inspect(data) : data;
  let today = moment(Date.now()).format("yyyy-MM-DD");
  let timestamp = moment(Date.now()).format("HH:mm:ss");
  appendFileSync(
    `${process.env.LOG_PATH}/error_${today}.txt`,
    `ERROR ${timestamp}  ${stringified}\n`
  );
  process.stderr.write(`ERROR ${timestamp}  ${stringified}\n`);
};

console.warn = function (data) {
  const stringified = typeof data === "object" ? inspect(data) : data;
  let today = moment(Date.now()).format("yyyy-MM-DD");
  let timestamp = moment(Date.now()).format("HH:mm:ss");
  appendFileSync(
    `${process.env.LOG_PATH}/error_${today}.txt`,
    `WARN  ${timestamp}  ${stringified}\n`
  );
  process.stderr.write(`WARN  ${timestamp}  ${stringified}\n`);
};

console.log("Starting server...");

// handle uncaught exceptions
process.on("uncaughtException", function (error) {
  console.error(error.stack);
});

main().catch((error: any) => {
  console.error(error);
});
