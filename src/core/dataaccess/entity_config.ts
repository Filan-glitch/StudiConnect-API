import mongoose from "mongoose";

export default interface EntityConfig {
  fieldsToPopulate: {
    path: string;
    model: EntityConfig;
  }[];
  fieldsToExclude: string[];
  model: mongoose.Model<any>;

  schemaName: string;
}
