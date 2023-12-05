import express from "express";
import multer from "multer";
import routes from "../../api/rest";
import { addApolloMiddleware } from "../graphql";
import authenticationMiddleware from "../../core/rest/authentication_middleware";

const cookieParser = require("cookie-parser");

async function expressServerSetup(): Promise<number> {
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

  return new Promise<number>((resolve, reject) => {
    app.listen({ port }, () => {
      resolve(port);
    });
  });
}

export default expressServerSetup;
