import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import UserTO from "../../../logic/model/to/user_to";
import { findUserByID, updateProfile } from "../../../logic/user_logic";

export async function updateProfile_resolver(
  _parent: unknown,
  args: {
    username: string;
    publicVisible: boolean;
    university: string;
    major: string;
    location: string;
    bio: string;
    mobile: string;
    discord: string;
  },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<UserTO> {
  let {
    username,
    publicVisible,
    university,
    major,
    location,
    bio,
    mobile,
    discord,
  } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  await updateProfile(
    userID,
    username,
    publicVisible,
    university,
    major,
    location,
    bio,
    mobile,
    discord
  );

  return findUserByID(userID, userID, info);
}
