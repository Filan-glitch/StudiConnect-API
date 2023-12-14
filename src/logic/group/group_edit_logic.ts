import GroupModel from "../../dataaccess/schema/group";
import { Types } from "mongoose";
import NotFoundError from "../model/exceptions/not_found";
import NoPermissionError from "../model/exceptions/no_permission";
import Group from "../../dataaccess/schema/group";
import User from "../../dataaccess/schema/user";
import {
  createGroupIndex,
  deleteGroupIndex,
} from "../../dataaccess/elasticsearch/groups";
import Location from "../model/location";

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
