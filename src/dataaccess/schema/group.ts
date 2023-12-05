import mongoose, { Schema } from "mongoose";
import EntityConfig from "../../core/dataaccess/entity_config";
import { UserModelConfig } from "./user";

const schemaName = "groups";

const Group = mongoose.model(
  schemaName,
  new Schema({
    _id: Schema.ObjectId,
    title: String,
    module: String,
    creator: { type: Schema.ObjectId, ref: UserModelConfig.schemaName },
    members: [{ type: Schema.ObjectId, ref: UserModelConfig.schemaName }],
    joinRequests: [{ type: Schema.ObjectId, ref: UserModelConfig.schemaName }],
    createdAt: Date,
    location: String,
  })
);

export const GroupModelConfig: EntityConfig = {
  fieldsToPopulate: [
    {
      path: "creator",
      model: UserModelConfig,
    },
    {
      path: "members",
      model: UserModelConfig,
    },
    {
      path: "joinRequests",
      model: UserModelConfig,
    },
  ],
  model: Group,
  schemaName,
};

export default Group;