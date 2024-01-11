import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import logic from "../../../logic/authentication_logic";
import SessionTO from "../../../logic/model/to/session_to";

/**
 * GraphQL resolver for the `login` mutation.
 * This mutation validates the token and creates a new session.
 * If the user does not exist, it will be created.
 * @param _parent -not used-
 * @param args The arguments of the mutation.
 * @param _context The context of the request.
 * @param _info The GraphQL resolve info.
 * @returns The session token and user id.
 */
export async function login(
  _parent: unknown,
  args: { token: string },
  _context: AppContext,
  _info: GraphQLResolveInfo
): Promise<SessionTO> {
  const { token } = args;

  return logic.authenticate(token);
}

/**
 * GraphQL resolver for the `loginAsGuest` mutation.
 * This mutation creates a new session for a guest.
 * @param _parent -not used-
 * @param _args The arguments of the mutation.
 * @param _context The context of the request.
 * @param _info The GraphQL resolve info.
 * @returns The session token and user id.
 */
export async function loginAsGuest(
  _parent: unknown,
  _args: unknown,
  _context: AppContext,
  _info: GraphQLResolveInfo
): Promise<SessionTO> {
  return logic.authenticateGuest();
}

/**
 * GraphQL resolver for the `logout` mutation.
 * This mutation deletes the session.
 * @param _parent -not used-
 * @param _args The arguments of the mutation.
 * @param context The context of the request.
 * @param _info The GraphQL resolve info.
 * @throws AuthenticationGraphQlError if the user is not logged in.
 */
export async function logout(
  _parent: unknown,
  _args: unknown,
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  let { sessionID } = context;

  if (sessionID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet");
  }

  await logic.logout(sessionID);
}
