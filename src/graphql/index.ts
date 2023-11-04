import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import typeDefs from "../model/type-defs";
import { Void } from "../model/void";
import AppContext from "../model/app_context";
import { Express } from "express-serve-static-core";
import cors from "cors";
import { json } from "body-parser";
import { httpStatusPlugin } from "./plugins/http-status";
import { user } from "./queries/users";
import { group } from "./queries/groups";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  addMember,
  removeMember,
} from "./mutations/groups";
import { updateProfile } from "./mutations/users";

export const resolvers = {
  Void: Void,
  Query: {
    user,
    group,
  },
  Mutation: {
    updateProfile,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    addMember,
    removeMember,
  },
};

export async function addApolloMiddleware(app: Express) {
  const graphql = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    plugins: [httpStatusPlugin],
  });

  await graphql.start();

  app.use(
    "/api/graphql",
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(graphql, {
      context: async ({ req }) => {
        // const token = req.headers["session"]?.toString();
        // const userID = await getUserIDBySession(token ?? "");
        const context: AppContext = {
          userID: "6543b31be1c4c473ea66428f",
          sessionID: "abc",
        };

        return context;
      },
    })
  );
}
