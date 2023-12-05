import { GraphQLResolveInfo } from "graphql";
import UserModel, { UserModelConfig } from "../dataaccess/schema/user";
import UserTO, { mapUserTO } from "./model/to/user_to";
import { queryOneByID } from "../core/dataaccess/query_builder";
import NotFoundError from "./model/exceptions/not_found";
import NoPermissionError from "./model/exceptions/no_permission";

export async function findUserByID(
  id: string,
  currentUser: string,
  requestInfo: GraphQLResolveInfo
): Promise<UserTO> {
  let entity = await queryOneByID(UserModelConfig, id, requestInfo);

  if (entity == null) {
    throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
  }

  if (id != currentUser) {
    if (!entity.publicVisible) {
      throw new NoPermissionError(
        "Sie haben keine Berechtigung, diesen Benutzer anzuzeigen."
      );
    } else {
      entity.verified = undefined;
      entity.darkThemeEnabled = undefined;
    }
  }

  return mapUserTO(entity);
}

export async function updateProfile(
  id: string,
  username: string,
  publicVisible: boolean,
  university: string,
  major: string,
  location: string,
  bio: string,
  mobile: string,
  discord: string
): Promise<void> {
  const user = await UserModel.findById(id);

  if (user == null) {
    throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
  }

  user.username = username;
  user.publicVisible = publicVisible;
  user.university = university;
  user.major = major;
  user.location = location;
  user.bio = bio;
  user.mobile = mobile;
  user.discord = discord;

  user.markModified("username");
  user.markModified("publicVisible");
  user.markModified("university");
  user.markModified("major");
  user.markModified("location");
  user.markModified("bio");
  user.markModified("mobile");
  user.markModified("discord");
  await user.save();
}
