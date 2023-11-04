import { GraphQLError } from "graphql";

/**
 * `GraphQLError` thrown, when the requested data was not found.
 * @see GraphQLError
 */
export default class NotFoundError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: "NOT_FOUND" } });

    Object.defineProperty(this, "name", { value: "NotFoundError" });
  }
}
