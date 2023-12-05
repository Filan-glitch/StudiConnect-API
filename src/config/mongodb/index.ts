import mongoose from "mongoose";

async function mongodbSetup() {
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
}

export default mongodbSetup;
