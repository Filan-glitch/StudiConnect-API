import express from "express";
import routes from "../../api/rest";
import { addApolloMiddleware } from "../graphql";
import bodyParser from "body-parser";

const cookieParser = require("cookie-parser");

async function expressServerSetup(): Promise<number> {
  const app = express();
  app.use(
    bodyParser.raw({
      inflate: true,
      type: "image/*",
      limit: "10mb",
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  //app.use(authenticationMiddleware());

  app.get("/health", routes.health);
  app.get("/api/profile/:uid/image", routes.getProfileImage);
  app.post("/api/profile/image", routes.setProfileImage);
  app.delete("/api/profile/image", routes.deleteProfileImage);
  app.use("/api/graphql", await addApolloMiddleware());

  let port = parseInt(process.env.PORT ?? "8080");

  return new Promise<number>((resolve, reject) => {
    app.listen({ port }, () => {
      resolve(port);
    });
  });
}

export default expressServerSetup;
