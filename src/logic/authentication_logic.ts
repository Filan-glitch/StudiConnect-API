import { Types } from "mongoose";
import { getFirebaseAuth } from "../config/firebase";
import UserModel from "../dataaccess/schema/user";
import SessionModel from "../dataaccess/schema/session";
import SessionTO from "./model/to/session_to";

export default {
  authenticate,
  logout,
  getUserIdBySession,
};

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

async function logout(sessionID: string): Promise<void> {
  await SessionModel.findByIdAndDelete(sessionID).exec();
}

async function getUserIdBySession(
  sessionID: string
): Promise<string | undefined> {
  // TODO: remove return "6543b31be1c4c473ea66428f";
  const session = await SessionModel.findById(sessionID).exec();
  return session?.user?.toHexString();
}
