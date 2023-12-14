import { Request, Response } from "express";
import logic from "../../logic/user";
import auth_logic from "../../logic/authentication_logic";

export const getProfileImage = async (req: Request, res: Response) => {
  const content = logic.getProfileImage(req.params.uid);

  if (content === null) {
    res.sendStatus(404);
  } else {
    res.writeHead(200, { "Content-type": "image/jpg" });
    res.end(content);
  }
};

export const setProfileImage = async (req: Request, res: Response) => {
  let uid = await auth_logic.getUserIdBySession(req.cookies["session"]);

  if (uid === undefined) {
    res.sendStatus(401);
    return;
  }

  logic.setProfileImage(uid, req.body);
  res.sendStatus(200);
};

export const deleteProfileImage = async (req: Request, res: Response) => {
  let uid = await auth_logic.getUserIdBySession(req.cookies["session"]);

  if (uid === undefined) {
    res.sendStatus(401);
    return;
  }

  logic.deleteProfileImage(uid);

  res.sendStatus(200);
};
