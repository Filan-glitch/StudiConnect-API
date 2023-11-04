import mongoose, { Schema } from "mongoose";
import { IEntity } from "./IEntity";

export default class User implements IEntity {
  _id: Schema.Types.ObjectId | undefined;
  email: string | undefined;
  username: string | undefined;
  verified: boolean | undefined;
  publicVisible: boolean | undefined;
  darkThemeEnabled: boolean | undefined;
  university: string | undefined;
  major: string | undefined;
  location: string | undefined;
  bio: string | undefined;
  mobile: string | undefined;
  discord: string | undefined;

  getFieldsToPopulate(): { path: string; model: typeof IEntity }[] {
    return [];
  }

  getSchemaName(): string {
    return "users";
  }

  getModel(): mongoose.Model<any> {
    return userModel;
  }
}

export const userModel = mongoose.model(
  User.prototype.getSchemaName(),
  new Schema({
    _id: Schema.ObjectId,
    email: String,
    username: String,
    verified: Boolean,
    publicVisible: Boolean,
    darkThemeEnabled: Boolean,
    university: String,
    major: String,
    location: String,
    bio: String,
    mobile: String,
    discord: String,
  })
);
