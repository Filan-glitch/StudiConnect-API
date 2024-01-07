import mongoose, { Schema } from "mongoose";
import { UserModelConfig } from "./user";
import EntityConfig from "../../core/dataaccess/entity_config";

const schemaName = "sessions";

/**
 * Schema definition for the session schema.
 */
const Session = mongoose.model(
  schemaName,
  new Schema({
    _id: Schema.ObjectId,
    user: { type: Schema.ObjectId, ref: UserModelConfig.schemaName },
    iat: {
      type: Date,
      default: Date.now,
      expires: 3600, // seconds
    },
  })
);

/**
 * Configuration for the session schema.
 */
export const SessionModelConfig: EntityConfig = {
  fieldsToPopulate: [],
  fieldsToExclude: [],
  model: Session,
  schemaName,
};

export default Session;
