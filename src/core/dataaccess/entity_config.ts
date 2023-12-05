import mongoose from "mongoose";

export default interface EntityConfig {
  fieldsToPopulate: {
    path: string;
    model: EntityConfig;
  }[];

  model: mongoose.Model<any>;

  schemaName: string;
}
