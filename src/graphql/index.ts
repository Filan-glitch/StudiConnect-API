import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import typeDefs from "../model/type-defs";
import { Void } from "../model/void";
import AppContext from "../model/app_context";
import HttpStatusPlugin from "./plugins/http-status";
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
import { login, logout } from "./mutations/auth";
import { RequestHandler } from "express";
import LifecyclePlugin from "./plugins/lifecycle";
import AuthenticationPlugin from "./plugins/authentication";

export const resolvers = {
  Void: Void,
  Query: {
    user,
    group,
  },
  Mutation: {
    login,
    logout,
    updateProfile,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    addMember,
    removeMember,
  },
};

export async function addApolloMiddleware(): Promise<RequestHandler> {
  const graphql = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    plugins: [LifecyclePlugin, AuthenticationPlugin, HttpStatusPlugin],
  });

  await graphql.start();

  return expressMiddleware(graphql, {
    context: async ({ req }) => {
      //console.log(JSON.stringify(req));
      // const token = req.headers["session"]?.toString();
      // const userID = await getUserIDBySession(token ?? "");
      const context: AppContext = {
        userID: "123456",
        sessionID: "655f5bb35c7955d2056cce62",
      };

      return context;
    },
  });
}
