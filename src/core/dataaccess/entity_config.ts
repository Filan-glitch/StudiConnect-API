import mongoose from "mongoose";

/**
 * EntityConfig contains all information for a specific entity.
 */
export default interface EntityConfig {
  /**
   * List of fields to populate via object id when querying this entity.
   */
  fieldsToPopulate: {
    path: string;
    model: EntityConfig;
  }[];

  /**
   * List of fields to exclude when querying this entity.
   */
  fieldsToExclude: string[];

  /**
   * Mongoose model for this entity.
   */
  model: mongoose.Model<any>;

  /**
   * Name of the entity.
   */
  schemaName: string;
}
