import { GraphQLError } from "graphql";

/**
 * `GraphQLError` thrown, when a dataset already exists.
 * @see GraphQLError
 */
export default class DuplicateError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: "DUPLICATE" } });

    Object.defineProperty(this, "name", { value: "DuplicateError" });
  }
}
