import "dotenv/config";

import "reflect-metadata";
import express from "express";
import { cert, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import multer from "multer";
const cookieParser = require("cookie-parser");

import routes from "./routes";
import { RedisClientType, createClient } from "redis";
import mongoose from "mongoose";
import { addApolloMiddleware } from "./graphql";
import authenticationMiddleware from "./security/auth-middleware";

export let firebaseAuth: Auth;
export let redis: RedisClientType;

const main = async () => {
  // initialize firebase admin sdk
  let firebase = initializeApp({
    credential: cert({
      projectId: "studiconnect-32c08",
      privateKey: readFileSync("firebase-private.pem").toString() ?? "",
      clientEmail:
        "firebase-adminsdk-ryq7d@studiconnect-32c08.iam.gserviceaccount.com",
    }),
  });
  firebaseAuth = getAuth(firebase);
  console.log("> Firebase activated");

  await mongoose
    .connect(
      `mongodb://${process.env.MONGO_HOST ?? "localhost"}:${parseInt(
        process.env.MONGO_PORT ?? "27017"
      )}/studiconnect`,
      {
        authSource: "admin",
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWORD,
      }
    )
    .then(() => console.log("> MongoDB connected"));

  // connect to redis db
  const redisURL = `redis://${process.env.REDIS_USER}:${
    process.env.REDIS_PASSWORD
  }@${process.env.REDIS_HOST ?? "localhost"}:${parseInt(
    process.env.REDIS_PORT ?? "6379"
  )}`;

  redis = createClient({ url: redisURL });
  console.log("> Redis connected");

  // initialize express server
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(authenticationMiddleware());
  app.use(await addApolloMiddleware());

  // initialize handler for binary files
  let upload = multer({
    dest: "/data/tmp/",
    limits: {
      fieldNameSize: 300,
      fileSize: 16000000, // 16 MB
    },
  });

  app.get("/health", routes.health);
  app.get("/api/profile/:uid/image", routes.getImage);
  app.post("/api/profile/image", upload.single("image"), routes.setImage);
  app.delete("/api/profile/image", routes.deleteImage);
  //app.get("/api/search", routes.search);

  let port = parseInt(process.env.PORT ?? "8080");
  app.listen({ port }, () => {
    console.log(
      `🚀 Server ready at http://${process.env["DOMAIN"]}:${port}/api`
    );
  });
};

console.log("Starting server...");

process.on("uncaughtException", function (error) {
  console.log(error.stack);
});

main().catch((error: any) => {
  console.log(error);
});
