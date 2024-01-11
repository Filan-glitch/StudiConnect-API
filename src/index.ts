import "dotenv/config";
import mongodbSetup from "./config/mongodb";
import expressServerSetup from "./config/express";
import { firebaseSetup } from "./config/firebase";
import { connectElasticsearch } from "./config/elasticsearch";
import { appendFileSync } from "fs";
import moment from "moment";
import websocketSetup from "./config/websocket";

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

// console.log = function (data) {
//   let today = moment(Date.now()).format("yyyy-MM-DD");
//   let timestamp = moment(Date.now()).format("HH:mm:ss");
//   appendFileSync(
//     `${process.env.LOG_PATH}/log_${today}.txt`,
//     `${timestamp}  ${data}\n`
//   );
//   process.stderr.write(`${timestamp}  ${data}\n`);
// };

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

console.log("Starting server...");

// handle uncaught exceptions
process.on("uncaughtException", function (error) {
  console.error(error.stack);
});

main().catch((error: any) => {
  console.error(error);
});
