import { ApolloServerPlugin } from "@apollo/server";
import AuthenticationGraphQlError from "../../../api/graphql/errors/authentication";
import AppContext from "../model/app_context";

const whitelist: string[] = ["Login"];

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
          throw new AuthenticationGraphQlError("Bitte melden Sie sich an");
        }
      },
    };
  },
};

export default AuthenticationPlugin;
