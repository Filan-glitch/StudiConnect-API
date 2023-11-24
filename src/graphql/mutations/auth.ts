import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../model/app_context";
import User from "../../model/user";
import Session, { sessionModel } from "../../model/session";
import { firebaseAuth } from "../..";
import AuthenticationError from "../errors/authentication";
import { Types } from "mongoose";

export async function login(
  _parent: unknown,
  args: { token: string },
  _context: AppContext,
  _info: GraphQLResolveInfo
): Promise<any> {
  const { token } = args;

  let tokenDetails = await firebaseAuth.verifyIdToken(token);

  // const TOKEN_EXPIRE = 5 * 60; // 5 minutes
  // if (new Date().getTime() / 1000 - tokenDetails.iat > TOKEN_EXPIRE) {
  //   throw new AuthenticationError("Token ist abgelaufen.");
  // }

  let user = await User.prototype.getModel().findOne({
    email: tokenDetails.email,
  });

  if (user == null) {
    user = new (User.prototype.getModel())();
    user._id = new Types.ObjectId();
    user.email = tokenDetails.email;
    user.username = tokenDetails.display_name;
    user.verified = tokenDetails.email_verified ?? false;
    user.publicVisible = false;
    user.darkThemeEnabled = false;
    user.university = "";
    user.major = "";
    user.location = "";
    user.bio = "";
    user.mobile = "";
    user.discord = "";

    await user.save();
  }

  const session = new sessionModel();
  session._id = new Types.ObjectId();
  session.user = user._id;

  await session.save();

  return { sessionID: session._id, user: user._id };
}

export async function logout(
  _parent: unknown,
  _args: unknown,
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  let { sessionID } = context;

  if (sessionID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet");
  }

  Session.prototype.getModel().findByIdAndDelete(sessionID).exec();
}
