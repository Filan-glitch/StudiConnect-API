import { Request, RequestHandler, Response } from "express";
import Session from "../../dataaccess/schema/session";

const URL_WHITELIST: string[] = ["/api/graphql", "/health"];

export default function authenticationMiddleware(): RequestHandler {
  return (req: Request, res: Response) => {
    if (
      URL_WHITELIST.includes(req.originalUrl) ||
      (req.originalUrl.includes("/image") && req.method === "GET")
    ) {
      req.next!();
      return;
    }

    let session = req.cookies["session"];
    if (session === undefined) {
      res.status(401).clearCookie("session").send();
      return;
    }

    try {
      Session.findById(session)
        .then((session) => {
          if (session == null) {
            res.status(401).clearCookie("session").send();
          } else {
            if (req.next) req.next();
          }
        })
        .catch(() => res.status(500).send());
    } catch (error) {
      res.status(500).send();
      return;
    }
  };
}
