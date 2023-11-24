import { ApolloServerPlugin } from "@apollo/server";
import AuthenticationError from "../errors/authentication";
import AppContext from "../../model/app_context";

const whitelist: string[] = ["login"];

const AuthenticationPlugin: ApolloServerPlugin<AppContext> = {
  async requestDidStart() {
    return {
      async didResolveOperation(requestContext) {
        const resolverName = requestContext.operationName;
        const context = requestContext.contextValue;

        if (resolverName === null) {
          throw new Error("Ungültige Anfrage");
        }

        if (!whitelist.includes(resolverName) && context.userID === undefined) {
          throw new AuthenticationError("Bitte melden Sie sich an");
        }
      },
    };
  },
};

export default AuthenticationPlugin;
