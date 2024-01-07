import { Request, Response } from "express";
import logic from "../../logic/group";
import auth_logic from "../../logic/authentication_logic";
import NotFoundError from "../../logic/model/exceptions/not_found";
import NoPermissionError from "../../logic/model/exceptions/no_permission";

/**
 * API handler for fetching a group image.
 * @param req express request
 * @param res express response
 */
export const getGroupImage = async (req: Request, res: Response) => {
  const content = logic.getGroupImage(req.params.id);

  if (content === null) {
    res.sendStatus(404);
  } else {
    res.writeHead(200, { "Content-type": "image/jpg" });
    res.end(content);
  }
};

/**
 * API handler for setting a group image.
 * @param req express request
 * @param res express response
 */
export const setGroupImage = async (req: Request, res: Response) => {
  let uid = await auth_logic.getUserIdBySession(req.cookies["session"]);

  if (uid === undefined) {
    res.sendStatus(401);
    return;
  }
  try {
    await logic.setGroupImage(req.params.id, uid, req.body);
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.sendStatus(404);
    } else if (error instanceof NoPermissionError) {
      res.sendStatus(403);
    } else {
      res.sendStatus(500);
    }
  }
};

/**
 * API handler for deleting a group image.
 * @param req express request
 * @param res express response
 */
export const deleteGroupImage = async (req: Request, res: Response) => {
  let uid = await auth_logic.getUserIdBySession(req.cookies["session"]);

  if (uid === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    await logic.deleteGroupImage(req.params.id, uid);
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.sendStatus(404);
      return;
    } else if (error instanceof NoPermissionError) {
      res.sendStatus(403);
      return;
    } else {
      res.sendStatus(500);
    }
  }
};
