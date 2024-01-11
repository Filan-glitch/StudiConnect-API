import mongoose, { Schema } from "mongoose";
import EntityConfig from "../../core/dataaccess/entity_config";
import { UserModelConfig } from "./user";
import { GroupModelConfig } from "./group";

const schemaName = "messages";

/**
 * Schema definition for the message schema.
 */
const Message = mongoose.model(
  schemaName,
  new Schema({
    _id: Schema.ObjectId,
    content: String,
    sender: { type: Schema.ObjectId, ref: UserModelConfig.schemaName },
    group: { type: Schema.ObjectId, ref: GroupModelConfig.schemaName },
    sendAt: Date,
  })
);

/**
 * Configuration for the message schema.
 */
export const MessageModelConfig: EntityConfig = {
  fieldsToPopulate: [
    {
      path: "sender",
      model: UserModelConfig,
    },
    {
      path: "group",
      model: GroupModelConfig,
    },
  ],
  fieldsToExclude: [],
  model: Message,
  schemaName,
};
