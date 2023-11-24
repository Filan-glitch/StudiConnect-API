import mongoose, { Schema } from "mongoose";
import User from "./user";

export default class Session {
  _id: Schema.Types.ObjectId | undefined;
  user: User | string | undefined;

  getSchemaName(): string {
    return "sessions";
  }

  getModel(): mongoose.Model<any> {
    return sessionModel;
  }
}

export const sessionModel = mongoose.model(
  Session.prototype.getSchemaName(),
  new Schema({
    _id: Schema.ObjectId,
    user: { type: Schema.ObjectId, ref: "users" },
    iat: {
      type: Date,
      default: Date.now,
      expires: 3600, // seconds
    },
  })
);
