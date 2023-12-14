//import { getUserBySessionID } from "../authentication";
import { Request, Response } from "express";
import { readFileSync, renameSync, existsSync, unlinkSync } from "fs";

export const getGroupImage = async (req: Request, res: Response) => {
  const uid = req.params.uid;
  let content: Buffer;
  let path = `${process.env.PUBLIC_FILES}/group-images/${uid}.jpg`;
  if (existsSync(path)) {
    content = readFileSync(path);
  } else {
    content = readFileSync(
      `${process.env.PUBLIC_FILES}/group-images/default.jpg`
    );
  }
  res.writeHead(200, { "Content-type": "image/jpg" });
  res.end(content);
};

export const setGroupImage = async (req: any, res: any) => {
  // let user = await getUserBySessionID(req.cookies["session"]);
  let user = {
    uid: "abc",
  };
  // let path = `${process.env.PUBLIC_FILES}/group-images/${user!.uid}.jpg`;
  let path = `${process.env.PUBLIC_FILES}/group-images/${user.uid}.jpg`;
  renameSync(req.file.path, path);
  res.sendStatus(200);
};

export const deleteGroupImage = async (req: any, res: any) => {
  // let user = await getUserBySessionID(req.cookies["session"]);

  let user = {
    uid: "abc",
  };
  const path = `${process.env.PUBLIC_FILES}/group-images/${user!.uid}.jpg`;
  if (existsSync(path)) {
    unlinkSync(path);
  }
  res.sendStatus(200);
};
