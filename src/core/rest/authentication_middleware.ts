import { Request, RequestHandler, Response } from "express";
import Session from "../../dataaccess/schema/session";

const URL_WHITELIST: string[] = ["/api/graphql", "/health"];

/**
 * Middleware to check if the user is authenticated.
 * @returns RequestHandler
 */
export default function authenticationMiddleware(): RequestHandler {
  return (req: Request, res: Response) => {
    // allow all requests to whitelisted urls
    // -> graphql endpoint
    // -> health endpoint
    // -> image endpoint for GET requests
    if (
      URL_WHITELIST.includes(req.originalUrl) ||
      (req.originalUrl.includes("/image") && req.method === "GET")
    ) {
      req.next!();
      return;
    }

    // check if session cookie is set
    let session = req.cookies["session"];
    if (session === undefined) {
      res.status(401).clearCookie("session").send();
      return;
    }

    try {
      // check if session is valid
      Session.findById(session)
        .then((session) => {
          if (session == null) {
            // if session is invalid clear cookie and send 401
            res.status(401).clearCookie("session").send();
          } else {
            // if session is valid continue with next handlers
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
