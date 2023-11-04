import { GraphQLError } from "graphql";

/**
 * `GraphQLError` for failed authentication.
 * @see GraphQLError
 */
export default class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: "UNAUTHENTICATED" } });

    Object.defineProperty(this, "name", { value: "AuthenticationError" });
  }
}
