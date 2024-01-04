import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import UserTO from "../../../logic/model/to/user_to";
import logic from "../../../logic/user";

export async function updateProfile(
  _parent: unknown,
  args: {
    username: string;
    university: string;
    major: string;
    lat: number;
    lon: number;
    bio: string;
    mobile: string;
    discord: string;
  },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<UserTO> {
  let { username, university, major, lat, lon, bio, mobile, discord } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  await logic.updateProfile(
    userID,
    username,
    university,
    major,
    { lat, lon },
    bio,
    mobile,
    discord
  );

  return logic.findUserByID(userID, userID, info);
}

export async function deleteAccount(
  _parent: unknown,
  _args: unknown,
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  await logic.deleteAccount(userID);
}
