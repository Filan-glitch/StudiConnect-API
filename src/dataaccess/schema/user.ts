import mongoose, { Schema } from "mongoose";
import EntityConfig from "../../core/dataaccess/entity_config";

const schemaName = "users";

const User = mongoose.model(
  schemaName,
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

export const UserModelConfig: EntityConfig = {
  fieldsToPopulate: [],
  model: User,
  schemaName,
};

export default User;
