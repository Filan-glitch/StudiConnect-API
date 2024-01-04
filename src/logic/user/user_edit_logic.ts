import NotFoundError from "../model/exceptions/not_found";
import UserModel from "../../dataaccess/schema/user";
import Location from "../model/location";
import { GroupModelConfig } from "../../dataaccess/schema/group";
import { removeMember } from "../group/group_member_logic";
import { SessionModelConfig } from "../../dataaccess/schema/session";

export async function updateProfile(
  id: string,
  username: string,
  university: string,
  major: string,
  location: Location,
  bio: string,
  mobile: string,
  discord: string
): Promise<void> {
  const user = await UserModel.findById(id);

  if (user == null) {
    throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
  }

  user.username = username;
  user.university = university;
  user.major = major;
  user.lat = location.lat;
  user.lon = location.lon;
  user.bio = bio;
  user.mobile = mobile;
  user.discord = discord;

  user.markModified("username");
  user.markModified("university");
  user.markModified("major");
  user.markModified("lat");
  user.markModified("lon");
  user.markModified("bio");
  user.markModified("mobile");
  user.markModified("discord");
  await user.save();
}

export async function deleteAccount(id: string): Promise<void> {
  // leave all groups
  const groupsWhereMember = await GroupModelConfig.model
    .find({ members: id })
    .exec();

  for (let group of groupsWhereMember) {
    await removeMember(group._id!.toHexString(), id, id);
  }

  // delete all join requests
  const groupsWhereJoinRequest = await GroupModelConfig.model
    .find({ joinRequests: id })
    .exec();

  for (let group of groupsWhereJoinRequest) {
    group.joinRequests = group.joinRequests.filter(
      (joinRequest: any) => joinRequest.toHexString() != id
    );
    group.markModified("joinRequests");
    await group.save();
  }

  // delete all sessions
  await SessionModelConfig.model.deleteMany({ user: id }).exec();

  // delete user
  await UserModel.findByIdAndDelete(id).exec();
}
