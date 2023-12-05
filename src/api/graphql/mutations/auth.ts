import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import { authenticate, logout } from "../../../logic/authentication_logic";
import SessionTO from "../../../logic/model/to/session_to";

export async function login_resolver(
  _parent: unknown,
  args: { token: string },
  _context: AppContext,
  _info: GraphQLResolveInfo
): Promise<SessionTO> {
  const { token } = args;

  return authenticate(token);
}

export async function logout_resolver(
  _parent: unknown,
  _args: unknown,
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  let { sessionID } = context;

  if (sessionID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet");
  }

  await logout(sessionID);
}
