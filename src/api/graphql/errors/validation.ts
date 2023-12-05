import { GraphQLError } from "graphql";

/**
 * `GraphQLError` for failed validation of the input data, e.g. via RegEx.
 * @see GraphQLError
 */
export default class ValidationGraphQlError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: "INVALID" } });

    Object.defineProperty(this, "name", { value: "ValidationError" });
  }
}
