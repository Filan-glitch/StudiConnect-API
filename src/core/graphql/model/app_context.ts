/**
 * Interface for the context of Apollo GraphQL resolver.
 */
interface AppContext {
  /**
   * `ID` of the user if logged in, else `undefined`.
   */
  userID: string | undefined;

  /**
   * Session ID passed by the client via the `session` header.
   */
  sessionID: string | undefined;
}

export default AppContext;
