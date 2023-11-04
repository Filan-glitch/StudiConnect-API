import { Request, Response } from "express";

const URL_WHITELIST: string[] = ["/api/login", "/api/otp", "/health"];
const GQL_WHITELIST: string[] = ["AddUser"];

export default function authentication(
  req: Request,
  res: Response,
  _next: any
): void {
  if (
    URL_WHITELIST.includes(req.originalUrl) ||
    GQL_WHITELIST.includes(req.body.operationName)
  ) {
    req.next!();
    return;
  }

  let session = req.cookies["session"];
  if (session === undefined) {
    res.status(401).clearCookie("session").send("Not logged in");
    return;
  }

  // TODO: add session validation
  // if ((await getUserBySessionID(session)) === undefined) {
  //   res.status(401).clearCookie("session").send("Not logged in");
  //   return;
  // }
  req.next!();
}
