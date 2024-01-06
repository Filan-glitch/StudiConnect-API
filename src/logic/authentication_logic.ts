import { Types } from "mongoose";
import { getFirebaseAuth } from "../config/firebase";
import UserModel from "../dataaccess/schema/user";
import SessionModel from "../dataaccess/schema/session";
import SessionTO from "./model/to/session_to";
import { deleteAccount } from "./user/user_edit_logic";

export default {
  authenticate,
  authenticateGuest,
  logout,
  getUserIdBySession,
};

/**
 * Authenticates a user with a firebase token.
 * If the user does not exist, it will be created.
 * @param token id token from firebase
 * @returns created session
 * @throws AuthenticationError if token is invalid
 */
async function authenticate(token: string): Promise<SessionTO> {
  let tokenDetails = await getFirebaseAuth().verifyIdToken(token);

  // TODO: enable token expiration
  // const TOKEN_EXPIRE = 5 * 60; // 5 minutes
  // if (new Date().getTime() / 1000 - tokenDetails.iat > TOKEN_EXPIRE) {
  //   throw new AuthenticationError("Token ist abgelaufen.");
  // }

  let user = await UserModel.findOne({
    email: tokenDetails.email,
  });

  if (user == null) {
    user = new UserModel();
    user._id = new Types.ObjectId();
    user.email = tokenDetails.email;
    user.username = tokenDetails.display_name ?? "";
    user.verified = tokenDetails.email_verified ?? false;
    user.university = "";
    user.major = "";
    user.lat = 0.0;
    user.lon = 0.0;
    user.bio = "";
    user.mobile = "";
    user.discord = "";
    user.isGuest = false;

    await user.save();
  }

  const session = new SessionModel();
  session._id = new Types.ObjectId();
  session.user = user._id;

  await session.save();

  return {
    sessionID: session._id.toHexString(),
    user: user._id?.toHexString(),
  };
}

/**
 * Authenticates a guest user.
 * @returns created session
 */
async function authenticateGuest(): Promise<SessionTO> {
  let user = new UserModel();
  user._id = new Types.ObjectId();
  user.email = "guest@studiconnect.de";
  user.username = "Gast";
  user.verified = false;
  user.university = "Hochschule Ruhr West";
  user.major = "Test";
  user.lat = 51.527248;
  user.lon = 6.927181;
  user.bio = "Dies ist ein Gastaccount.";
  user.mobile = "123456789";
  user.discord = "";
  user.isGuest = true;

  await user.save();

  const session = new SessionModel();
  session._id = new Types.ObjectId();
  session.user = user._id;

  await session.save();

  return {
    sessionID: session._id.toHexString(),
    user: user._id?.toHexString(),
  };
}

/**
 * Logs out a user.
 * @param sessionID The session id of the user.
 */
async function logout(sessionID: string): Promise<void> {
  const session = await SessionModel.findById(sessionID).exec();
  if (session == null) {
    return;
  }

  let user = await UserModel.findById(session.user).exec();
  if (user == null) {
    return;
  }

  if (user.isGuest) {
    await deleteAccount(user._id!.toHexString());
  }

  await SessionModel.findByIdAndDelete(sessionID).exec();
}

/**
 * Gets the user id of a session.
 * @param sessionID The session id of the user.
 * @returns The user id of the session.
 */
async function getUserIdBySession(
  sessionID: string
): Promise<string | undefined> {
  const session = await SessionModel.findById(sessionID).exec();
  return session?.user?.toHexString();
}
