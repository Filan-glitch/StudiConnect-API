import express from "express";
import routes from "../../api/rest";
import { addApolloMiddleware } from "../graphql";
import bodyParser from "body-parser";
import authenticationMiddleware from "../../core/rest/authentication_middleware";

const cookieParser = require("cookie-parser");

/**
 * Sets up the express server.
 * @returns The port the server is listening on.
 */
async function expressServerSetup(): Promise<number> {
  const app = express();

  // handle image uploads
  app.use(
    bodyParser.raw({
      inflate: true,
      type: "image/*",
      limit: "10mb",
    })
  );

  app.use(express.json()); // handle json requests
  app.use(cookieParser()); // handle cookies
  app.use(authenticationMiddleware()); // check if user is authenticated

  app.get("/health", routes.health); // health endpoint
  app.get("/api/user/:uid/image", routes.getProfileImage); // get profile image
  app.post("/api/user/image", routes.setProfileImage); // set profile image
  app.delete("/api/user/image", routes.deleteProfileImage); // delete profile image
  app.get("/api/group/:id/image", routes.getGroupImage); // get group image
  app.post("/api/group/:id/image", routes.setGroupImage); // set group image
  app.delete("/api/group/:id/image", routes.deleteGroupImage); // delete group image
  app.use("/api/graphql", await addApolloMiddleware()); // graphql endpoint

  let port = parseInt(process.env.PORT ?? "8080");

  return new Promise<number>((resolve, reject) => {
    app.listen({ port }, () => {
      resolve(port);
    });
  });
}

export default expressServerSetup;
