import mongoose from "mongoose";

/**
 * Interface implemented by database entities, so that they can used by GraphQL Resolvers.
 */
export abstract class IEntity {
  abstract getFieldsToPopulate(): { path: string; model: typeof IEntity }[];

  abstract getModel(): mongoose.Model<any>;

  abstract getSchemaName(): string;
}
