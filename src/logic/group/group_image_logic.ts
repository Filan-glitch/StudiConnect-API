import { readFileSync, existsSync, unlinkSync, writeFileSync } from "fs";
import { Types } from "mongoose";
import NoPermissionError from "../model/exceptions/no_permission";
import GroupModel from "../../dataaccess/schema/group";
import NotFoundError from "../model/exceptions/not_found";

/**
 * Verifies that the group has an image.
 * @param groupId id of the group
 * @returns true if the group image exists, false otherwise
 */
export function groupImageExists(groupId: string): boolean {
  let path = `${process.env.PUBLIC_FILES}/group-images/${groupId}.jpg`;
  return existsSync(path);
}

/**
 * Reads the image of a group.
 * @param groupId id of the group
 * @returns the image of the group or null if it does not exist
 */
export function getGroupImage(groupId: string): Buffer | null {
  let path = `${process.env.PUBLIC_FILES}/group-images/${groupId}.jpg`;
  if (existsSync(path)) {
    return readFileSync(path);
  } else {
    return null;
  }
}

/**
 * Writes the image of a group.
 * @param id id of the group
 * @param uid id of the user who issues the request
 * @param content image content
 * @throws NotFoundError if the group does not exist
 * @throws NoPermissionError if the user is not a member of the group
 */
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

/**
 * Deletes the image of a group.
 * @param id id of the group
 * @param uid id of the user who issues the request
 * @throws NotFoundError if the group does not exist
 * @throws NoPermissionError if the user is not a member of the group
 */
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
