import { GraphQLResolveInfo } from "graphql";
import GroupTO, { mapGroupTO } from "./model/to/group_to";
import { queryOneByID } from "../core/dataaccess/query_builder";
import GroupModel, { GroupModelConfig } from "../dataaccess/schema/group";
import { Types } from "mongoose";
import NotFoundError from "./model/exceptions/not_found";
import NoPermissionError from "./model/exceptions/no_permission";
import DuplicateError from "./model/exceptions/duplicate";
import Group from "../dataaccess/schema/group";

export async function findGroupByID(
  id: string,
  requestInfo: GraphQLResolveInfo
): Promise<GroupTO> {
  let entity = await queryOneByID(GroupModelConfig, id, requestInfo);

  if (entity == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  return mapGroupTO(entity);
}

export async function createGroup(
  title: string,
  module: string,
  location: string,
  userID: string
): Promise<string> {
  const group = new GroupModel();
  group._id = new Types.ObjectId();
  group.title = title;
  group.module = module;
  group.location = location;
  group.creator = new Types.ObjectId(userID);
  group.members = [new Types.ObjectId(userID)];
  group.joinRequests = [];
  group.createdAt = new Date();

  await group.save();

  return group._id.toHexString();
}

export async function updateGroup(
  id: string,
  title: string,
  location: string,
  module: string,
  userID: string
): Promise<string> {
  const group = await GroupModel.findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(userID);

  if (!isMember) {
    throw new NoPermissionError("Sie sind kein Mitglied dieser Gruppe.");
  }

  group.title = title;
  group.location = location;
  group.module = module;

  group.markModified("title");
  group.markModified("location");
  group.markModified("module");

  await group.save();

  return id;
}

export async function deleteGroup(id: string, userID: string): Promise<void> {
  const group = await Group.findById(id);
  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(userID);
  console.log(userID);

  if (!isMember) {
    throw new NoPermissionError("Sie sind kein Mitglied dieser Gruppe.");
  }

  await Group.findByIdAndDelete(id);
}

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

  group.members = group.members.filter(
    (member: Types.ObjectId) => member.toString() !== user
  );
  group.markModified("members");

  // delete group, if no members are left
  if (group.members.length === 0) {
    await Group.findByIdAndDelete(id);
    return;
  }

  // set new creator, if old creator leaves
  if (group.creator == null || group.creator.toString() === user) {
    group.creator = group.members[0];
    group.markModified("creator");
  }

  await group.save();
}