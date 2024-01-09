import express from "express";
import routes from "../../api/rest";
import { addApolloMiddleware } from "../graphql";
import bodyParser from "body-parser";
import authenticationMiddleware from "../../core/rest/authentication_middleware";

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
  app.use(authenticationMiddleware());

  app.get("/health", routes.health);
  app.get("/api/user/:uid/image", routes.getProfileImage);
  app.post("/api/user/image", routes.setProfileImage);
  app.delete("/api/user/image", routes.deleteProfileImage);
  app.get("/api/group/:id/image", routes.getGroupImage);
  app.post("/api/group/:id/image", routes.setGroupImage);
  app.delete("/api/group/:id/image", routes.deleteGroupImage);
  app.use("/api/graphql", await addApolloMiddleware());
  
  let port = parseInt(process.env.PORT ?? "8080");

  return new Promise<number>((resolve, reject) => {
    app.listen({ port }, () => {
      resolve(port);
    });
  });
}

export default expressServerSetup;
