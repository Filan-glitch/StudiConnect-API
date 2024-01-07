import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4";
import AppContext from "./model/app_context";
import authentication from "../../logic/authentication_logic";

/**
 * Builds the context for the Apollo GraphQL server.
 * @param args Request arguments from the Apollo GraphQL server.
 * @returns The context for the Apollo GraphQL server.
 */
async function buildApolloContext(
  args: ExpressContextFunctionArgument
): Promise<AppContext> {
  let req = args.req;

  // resolve session id
  const sessionID: string | undefined = req.cookies["session"]?.toString();

  if (sessionID == undefined)
    return { userID: undefined, sessionID: undefined };

  // check if session is valid and fetch user id
  const userID = await authentication.getUserIdBySession(sessionID);

  return {
    userID,
    sessionID,
  };
}

export default buildApolloContext;
