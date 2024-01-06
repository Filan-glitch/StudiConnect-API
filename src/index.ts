import "dotenv/config";
import mongodbSetup from "./config/mongodb";
import expressServerSetup from "./config/express";
import { firebaseSetup } from "./config/firebase";
import { connectElasticsearch } from "./config/elasticsearch";

/**
 * Main function.
 */
const main = async () => {
  // initialize firebase admin sdk
  firebaseSetup();
  await mongodbSetup(); // connect to mongodb
  await connectElasticsearch(); // connect to elasticsearch

  let port = await expressServerSetup(); // start express server

  console.log(`🚀 Server ready at http://${process.env["DOMAIN"]}:${port}/api`);
};

console.log("Starting server...");

// handle uncaught exceptions
process.on("uncaughtException", function (error) {
  console.log(error.stack);
});

main().catch((error: any) => {
  console.log(error);
});
