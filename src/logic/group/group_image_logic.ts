import { readFileSync, existsSync, unlinkSync, writeFileSync } from "fs";
import { Types } from "mongoose";
import NoPermissionError from "../model/exceptions/no_permission";
import GroupModel from "../../dataaccess/schema/group";
import NotFoundError from "../model/exceptions/not_found";

export function getGroupImage(groupId: string): Buffer | null {
  let path = `${process.env.PUBLIC_FILES}/group-images/${groupId}.jpg`;
  if (existsSync(path)) {
    return readFileSync(path);
  } else {
    return null;
  }
}

export async function setGroupImage(
  id: string,
  uid: string,
  content: Buffer
): Promise<void> {
  const group = await GroupModel.findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(uid);

  if (!isMember) {
    throw new NoPermissionError("Sie sind kein Mitglied dieser Gruppe.");
  }

  let path = `${process.env.PUBLIC_FILES}/group-images/${id}.jpg`;
  writeFileSync(path, content);
}

export async function deleteGroupImage(id: string, uid: string): Promise<void> {
  const group = await GroupModel.findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(uid);

  if (!isMember) {
    throw new NoPermissionError("Sie sind kein Mitglied dieser Gruppe.");
  }

  const path = `${process.env.PUBLIC_FILES}/group-images/${id}.jpg`;
  if (existsSync(path)) {
    unlinkSync(path);
  }
}
