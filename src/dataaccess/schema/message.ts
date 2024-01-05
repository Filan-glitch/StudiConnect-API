import mongoose, { Schema } from "mongoose";
import EntityConfig from "../../core/dataaccess/entity_config";
import { UserModelConfig } from "./user";
import { GroupModelConfig } from "./group";

const schemaName = "messages";

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
