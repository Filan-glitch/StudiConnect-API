import { GraphQLResolveInfo } from "graphql";
import moment from "moment";
import AppContext from "../../model/app_context";
import Group from "../../model/group";
import { group as fetchGroup } from "../queries/groups";
import { Types } from "mongoose";
import AuthenticationError from "../errors/authentication";
import NotFoundError from "../errors/not-found";
import DuplicateError from "../errors/duplicate";

export async function createGroup(
  _parent: unknown,
  args: { title: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<Group> {
  const { title } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  const group = new (Group.prototype.getModel())();
  group._id = new Types.ObjectId();
  group.title = title;
  group.module = "";
  group.location = "";
  group.creator = userID;
  group.members = [userID];
  group.joinRequests = [];
  group.createdAt = moment().format("YYYY-MM-DD");

  await group.save();

  return fetchGroup({}, { id: group._id }, context, info);
}

export async function updateGroup(
  _parent: unknown,
  args: { id: string; title: string; location: string; module: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<Group> {
  const { id, title, location, module } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  const group = await Group.prototype.getModel().findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(userID);

  if (!isMember) {
    throw new AuthenticationError("Sie sind kein Mitglied dieser Gruppe.");
  }

  group.title = title;
  group.location = location;
  group.module = module;

  group.markModified("title");
  group.markModified("location");
  group.markModified("module");
  await group.save();

  return fetchGroup({}, { id: group._id }, context, info);
}

export async function deleteGroup(
  _parent: unknown,
  args: { id: string },
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  const { id } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  const group = await Group.prototype.getModel().findById(id);
  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  console.log(group.members);

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(userID);
  console.log(userID);

  if (!isMember) {
    throw new AuthenticationError("Sie sind kein Mitglied dieser Gruppe.");
  }

  await Group.prototype.getModel().findByIdAndDelete(id);
}

export async function joinGroup(
  _parent: unknown,
  args: { id: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<void> {
  const { id } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  const group = await Group.prototype.getModel().findById(id);

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
      .map((request: Types.ObjectId) => request.toString())
      .includes(userID)
  ) {
    throw new DuplicateError(
      "Sie haben bereits eine Beitrittsanfrage gesendet."
    );
  }

  group.joinRequests.push(userID);
  group.markModified("joinRequests");

  await group.save();
}

export async function addMember(
  _parent: unknown,
  args: { id: string; user: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<Group> {
  const { id, user } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  const group = await Group.prototype.getModel().findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(userID);

  if (!isMember) {
    throw new AuthenticationError("Sie sind kein Mitglied dieser Gruppe.");
  }

  if (
    group.members
      .map((member: Types.ObjectId) => member.toString())
      .includes(user)
  ) {
    throw new DuplicateError("Der Nutzer ist bereits Mitglied dieser Gruppe.");
  }

  group.members.push(user);
  group.markModified("members");

  group.joinRequests = group.joinRequests.filter(
    (request: Types.ObjectId) => request.toString() !== userID
  );

  await group.save();

  return fetchGroup({}, { id: group._id }, context, info);
}

export async function removeMember(
  _parent: unknown,
  args: { id: string; user: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<Group | null> {
  const { id, user } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  const group = await Group.prototype.getModel().findById(id);

  if (group == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  const isMember = group.members
    .map((member: Types.ObjectId) => member.toString())
    .includes(userID);

  if (!isMember) {
    throw new AuthenticationError("Sie sind kein Mitglied dieser Gruppe.");
  }

  group.members = group.members.filter(
    (member: Types.ObjectId) => member.toString() !== user
  );
  group.markModified("members");

  if (group.members.length === 0) {
    await Group.prototype.getModel().findByIdAndDelete(id);
    return null;
  }

  if (group.creator.toString() === user) {
    group.creator = group.members[0];
    group.markModified("creator");
  }

  await group.save();

  return fetchGroup({}, { id: group._id }, context, info);
}
