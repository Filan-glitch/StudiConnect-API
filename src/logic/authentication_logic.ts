import { Types } from "mongoose";
import { getFirebaseAuth } from "../config/firebase";
import UserModel from "../dataaccess/schema/user";
import SessionModel from "../dataaccess/schema/session";
import SessionTO from "./model/to/session_to";

export async function authenticate(token: string): Promise<SessionTO> {
  let tokenDetails = await getFirebaseAuth().verifyIdToken(token);

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
    user.username = tokenDetails.display_name;
    user.verified = tokenDetails.email_verified ?? false;
    user.university = "";
    user.major = "";
    user.lat = 0;
    user.lon = 0;
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

export async function logout(sessionID: string): Promise<void> {
  await SessionModel.findByIdAndDelete(sessionID).exec();
}
