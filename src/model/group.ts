import mongoose, { Schema } from "mongoose";
import User from "./user";
import { IEntity } from "./IEntity";

export default class Group implements IEntity {
  _id: Schema.Types.ObjectId | undefined;
  title: string | undefined;
  module: string | undefined;
  creator: User | string | undefined;
  members: User[] | string[] | undefined;
  joinRequests: User[] | string[] | undefined;
  createdAt: string | undefined;
  location: string | undefined;

  getFieldsToPopulate(): { path: string; model: typeof IEntity }[] {
    return [
      {
        path: "creator",
        model: User,
      },
      {
        path: "members",
        model: User,
      },
      {
        path: "joinRequests",
        model: User,
      },
    ];
  }

  getSchemaName(): string {
    return "groups";
  }

  getModel(): mongoose.Model<any> {
    return _groupModel;
  }
}

export const _groupModel = mongoose.model(
  Group.prototype.getSchemaName(),
  new Schema({
    _id: Schema.ObjectId,
    title: String,
    module: String,
    creator: { type: Schema.ObjectId, ref: User.prototype.getSchemaName() },
    members: [{ type: Schema.ObjectId, ref: User.prototype.getSchemaName() }],
    joinRequests: [
      { type: Schema.ObjectId, ref: User.prototype.getSchemaName() },
    ],
    createdAt: Date,
    location: String,
  })
);
