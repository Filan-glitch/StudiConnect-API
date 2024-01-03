import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4";
import AppContext from "./model/app_context";
import authentication from "../../logic/authentication_logic";

async function buildApolloContext(
  args: ExpressContextFunctionArgument
): Promise<AppContext> {
  let req = args.req;
  const sessionID: string | undefined = req.cookies["session"]?.toString();

  if (sessionID == undefined)
    return { userID: undefined, sessionID: undefined };

  const userID = await authentication.getUserIdBySession(sessionID);

  return {
    userID,
    sessionID,
  };
}

export default buildApolloContext;
