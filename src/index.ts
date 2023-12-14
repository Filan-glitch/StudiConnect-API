import "dotenv/config";
import mongodbSetup from "./config/mongodb";
import expressServerSetup from "./config/express";
import { firebaseSetup } from "./config/firebase";
import { connectElasticsearch } from "./config/elasticsearch";

const main = async () => {
  // initialize firebase admin sdk
  firebaseSetup();

  await mongodbSetup();
  await connectElasticsearch();

  let port = await expressServerSetup();

  console.log(`🚀 Server ready at http://${process.env["DOMAIN"]}:${port}/api`);
};

console.log("Starting server...");

process.on("uncaughtException", function (error) {
  console.log(error.stack);
});

main().catch((error: any) => {
  console.log(error);
});
