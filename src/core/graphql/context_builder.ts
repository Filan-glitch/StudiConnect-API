import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4";
import AppContext from "./model/app_context";

async function buildApolloContext(
  args: ExpressContextFunctionArgument
): Promise<AppContext> {
  //let req = args.req
  //console.log(JSON.stringify(req));
  // const token = req.headers["session"]?.toString();
  // const userID = await getUserIDBySession(token ?? "");
  const context: AppContext = {
    userID: "6543b31be1c4c473ea66428f",
    sessionID: "655f5bb35c7955d2056cce62",
  };

  return context;
}

export default buildApolloContext;
