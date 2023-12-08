import { GraphQLResolveInfo } from "graphql";
import GroupTO, { mapGroupTO } from "./model/to/group_to";
import { queryOneByID } from "../core/dataaccess/query_builder";
import GroupModel, { GroupModelConfig } from "../dataaccess/schema/group";
import { Types } from "mongoose";
import NotFoundError from "./model/exceptions/not_found";
import NoPermissionError from "./model/exceptions/no_permission";
import DuplicateError from "./model/exceptions/duplicate";
import Group from "../dataaccess/schema/group";
import User from "../dataaccess/schema/user";
import {
  createGroupIndex,
  deleteGroupIndex,
  searchGroupsFromElasticsearch,
} from "../dataaccess/elasticsearch/groups";
import Location from "./model/location";

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

export async function searchGroups(
  module: string,
  radius: number,
  userID: string,
  requestInfo: GraphQLResolveInfo
): Promise<GroupTO[]> {
  let user = await User.findById(userID);

  if (user == null) {
    throw new NotFoundError("Der Nutzer konnte nicht gefunden werden.");
  }

  if (
    user.university == null ||
    user.major == null ||
    user.lat == null ||
    user.lon == null
  ) {
    throw new Error("Es ist ein unerwarteter Fehler aufgetreten.");
  }

  let searchResults = await searchGroupsFromElasticsearch(
    user.university,
    user.major,
    module,
    { lat: user.lat, lon: user.lon },
    radius
  );

  searchResults = searchResults.filter((result: any) => result.score > 1);

  let results = [];

  for (let result of searchResults) {
    let group = await findGroupByID(result.group_id, requestInfo);

    if (group == null) {
      throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
    }

    results.push(mapGroupTO(group));
  }

  return results;
}

export async function createGroup(
  title: string,
  description: string,
  module: string,
  location: Location,
  userID: string
): Promise<string> {
  let user = await User.findById(userID);

  if (user == null) {
    throw new NotFoundError("Der Nutzer konnte nicht gefunden werden.");
  }

  let group = new GroupModel();
  group._id = new Types.ObjectId();
  group.title = title;
  group.description = description;
  group.module = module;
  group.lat = location.lat;
  group.lon = location.lon;
  group.creator = new Types.ObjectId(userID);
  group.members = [new Types.ObjectId(userID)];
  group.joinRequests = [];
  group.createdAt = new Date();

  group = await group.save();

  if (group._id == null) {
    throw new Error("Es ist ein unerwarteter Fehler aufgetreten.");
  }

  await createGroupIndex(
    group._id.toHexString(),
    user.university ?? "",
    user.major ?? "",
    module,
    location.lat,
    location.lon
  );

  return group._id.toHexString();
}

export async function updateGroup(
  id: string,
  title: string,
  description: string,
  location: Location,
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
  group.description = description;
  group.lat = location.lat;
  group.lon = location.lon;
  group.module = module;

  group.markModified("title");
  group.markModified("description");
  group.markModified("lat");
  group.markModified("lon");
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

  if (!isMember) {
    throw new NoPermissionError("Sie sind kein Mitglied dieser Gruppe.");
  }

  await Group.findByIdAndDelete(id);

  await deleteGroupIndex(id);
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
