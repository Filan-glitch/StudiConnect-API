import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import logic from "../../../logic/authentication_logic";
import SessionTO from "../../../logic/model/to/session_to";

export async function login(
  _parent: unknown,
  args: { token: string },
  _context: AppContext,
  _info: GraphQLResolveInfo
): Promise<SessionTO> {
  const { token } = args;

  return logic.authenticate(token);
}

export async function loginAsGuest(
  _parent: unknown,
  args: unknown,
  _context: AppContext,
  _info: GraphQLResolveInfo
): Promise<SessionTO> {
  return logic.authenticateGuest();
}

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
