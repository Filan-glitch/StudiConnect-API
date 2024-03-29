import mongoose, { Schema } from "mongoose";
import EntityConfig from "../../core/dataaccess/entity_config";

const schemaName = "users";

/**
 * Schema definition for the user schema.
 */
const User = mongoose.model(
  schemaName,
  new Schema({
    _id: Schema.ObjectId,
    email: String,
    username: String,
    verified: Boolean,
    university: String,
    major: String,
    lat: Number,
    lon: Number,
    bio: String,
    mobile: String,
    discord: String,
    isGuest: Boolean,
  })
);

/**
 * Configuration for the user schema.
 */
export const UserModelConfig: EntityConfig = {
  fieldsToPopulate: [],
  fieldsToExclude: ["groups"],
  model: User,
  schemaName,
};

export default User;
