import { Types } from "mongoose";
import NotFoundError from "../model/exceptions/not_found";
import NoPermissionError from "../model/exceptions/no_permission";
import DuplicateError from "../model/exceptions/duplicate";
import Group from "../../dataaccess/schema/group";
import { deleteGroup } from "./group_edit_logic";

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
