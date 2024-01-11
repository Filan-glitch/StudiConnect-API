import { Types } from "mongoose";
import NotFoundError from "../model/exceptions/not_found";
import NoPermissionError from "../model/exceptions/no_permission";
import DuplicateError from "../model/exceptions/duplicate";
import Group from "../../dataaccess/schema/group";
import { deleteGroup } from "./group_edit_logic";
import { MessageModelConfig } from "../../dataaccess/schema/message";

/**
 * Creates a join request for a group.
 * @param id id of the group
 * @param userID id of the user who issues the request
 * @throws NotFoundError if the group does not exist
 * @throws DuplicateError if the user is already a member of the group or has already sent a join request
 */
export async function joinGroup(id: string, userID: string): Promise<void> {
  const group = await Group.findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  if (
    group.members
      .map((member: Types.ObjectId) => member.toString())
      .includes(userID)
  ) {
    throw new DuplicateError("Sie sind bereits Mitglied dieser Gruppe.");
  }

  if (
    group.joinRequests
      .map((joinRequest: Types.ObjectId) => joinRequest.toString())
      .includes(userID)
  ) {
    throw new DuplicateError(
      "Sie haben bereits eine Beitrittsanfrage gestellt."
    );
  }

  group.joinRequests.push(new Types.ObjectId(userID));
  group.markModified("joinRequests");

  await group.save();
}

/**
 * Adds a member to a group.
 * @param id id of the group
 * @param user id of the user to be added
 * @param userID id of the user who issues the request
 * @throws NotFoundError if the group does not exist
 * @throws NoPermissionError if the user is not allowed to add members to the group
 * @throws DuplicateError if the user is already a member of the group
 */
export async function addMember(
  id: string,
  user: string,
  userID: string
): Promise<void> {
  const group = await Group.findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(userID);

  if (!isMember) {
    throw new NoPermissionError("Sie sind kein Mitglied dieser Gruppe.");
  }

  if (
    group.members
      .map((member: Types.ObjectId) => member.toString())
      .includes(user)
  ) {
    throw new DuplicateError("Der Nutzer ist bereits Mitglied dieser Gruppe.");
  }

  group.members.push(new Types.ObjectId(user));
  group.markModified("members");

  group.joinRequests = group.joinRequests.filter(
    (joinRequest: Types.ObjectId) => joinRequest.toString() !== user
  );
  group.markModified("joinRequests");

  await group.save();
}

/**
 * Removes a member from a group.
 * @param id id of the group
 * @param user id of the user to be removed
 * @param userID id of the user who issues the request
 * @throws NotFoundError if the group does not exist
 * @throws NoPermissionError if the user is not allowed to remove members from the group
 */
export async function removeMember(
  id: string,
  user: string,
  userID: string
): Promise<void> {
  const group = await Group.findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(userID);

  if (!isMember) {
    throw new NoPermissionError("Sie sind kein Mitglied dieser Gruppe.");
  }

  // delete all messages from user
  await MessageModelConfig.model.deleteMany({ group: id, sender: user });

  // delete group, if no members are left
  if (group.members.length === 1) {
    await deleteGroup(id, userID);
    return;
  }

  group.members = group.members.filter(
    (member: Types.ObjectId) => member.toString() !== user
  );
  group.markModified("members");

  // set new creator, if old creator leaves
  if (group.creator == null || group.creator.toString() === user) {
    group.creator = group.members[0];
    group.markModified("creator");
  }

  await group.save();
}

/**
 * Removes a join request from a group without accepting it.
 * @param id id of the group
 * @param user id of the user to be removed
 * @param currentUser id of the user who issues the request
 * @throws NotFoundError if the group or the join request does not exist
 * @throws NoPermissionError if the user is not allowed to remove join requests from the group
 */
export async function removeJoinRequest(
  groupID: string,
  user: string,
  currentUser: string
): Promise<void> {
  const group = await Group.findById(groupID);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  if (group.creator?.toString() !== currentUser) {
    throw new NoPermissionError("Sie sind nicht der Ersteller dieser Gruppe.");
  }

  if (
    !group.joinRequests
      .map((joinRequest: Types.ObjectId) => joinRequest.toString())
      .includes(user)
  ) {
    throw new NotFoundError("Sie haben keine Beitrittsanfrage gestellt.");
  }

  group.joinRequests = group.joinRequests.filter(
    (joinRequest: Types.ObjectId) => joinRequest.toString() !== user
  );

  group.markModified("joinRequests");

  await group.save();
}
