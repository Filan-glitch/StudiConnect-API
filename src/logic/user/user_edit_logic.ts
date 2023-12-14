import NotFoundError from "../model/exceptions/not_found";
import UserModel from "../../dataaccess/schema/user";
import Location from "../model/location";

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
