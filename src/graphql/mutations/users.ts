import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../model/app_context";
import User from "../../model/user";
import { user as fetchUser } from "../queries/users";
import AuthenticationError from "../errors/authentication";
import NotFoundError from "../errors/not-found";

export async function updateProfile(
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
): Promise<User> {
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
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  const user = await User.prototype.getModel().findById(userID);
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

  return fetchUser({}, { id: userID }, context, info);
}
