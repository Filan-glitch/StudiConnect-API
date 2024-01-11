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
import { MessageModelConfig } from "../../dataaccess/schema/message";

/**
 * Creates a new group in mongodb and elasticsearch with the given parameters.
 * @param title title of the group
 * @param description description of the group
 * @param module module for the group
 * @param location lat and lon of the group
 * @param userID id of the user who issues the request
 * @returns id of the created group
 * @throws NotFoundError if the user does not exist
 */
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

  if (
    user.university == null ||
    user.major == null ||
    user.university.trim() === "" ||
    user.major.trim() === ""
  ) {
    throw new Error(
      "Bitte vervollständigen Sie Ihr Profil, bevor Sie eine Gruppe erstellen."
    );
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

  // index group in elasticsearch
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

/**
 * This function updates the group with the given id with the given parameters.
 * @param id id of the group
 * @param title new title of the group
 * @param description new description of the group
 * @param location new location of the group
 * @param module new module of the group
 * @param userID id of the user who issues the request
 * @returns id of the updated group
 */
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

/**
 * This function deletes the group with the given id.
 * @param id id of the group
 * @param userID id of the user who issues the request
 * @throws NotFoundError if the group does not exist
 * @throws NoPermissionError if the user is not a member of the group
 */
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

  // delete all group messages
  await MessageModelConfig.model.deleteMany({ group: id });

  // delete group in mongodb
  await Group.findByIdAndDelete(id);

  // delete group in elasticsearch
  await deleteGroupIndex(id);
}
