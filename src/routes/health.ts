import { Request, Response } from "express";

/**
 * Sends an empty `200 OK` response for the health check in docker.
 * @param _req request
 * @param res response
 */
export function health(_req: Request, res: Response) {
  res.sendStatus(200);
}
