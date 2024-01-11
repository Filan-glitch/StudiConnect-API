import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import typeDefs from "./type-defs";
import { Void } from "../../core/graphql/model/void";
import AppContext from "../../core/graphql/model/app_context";
import HttpStatusPlugin from "../../core/graphql/plugins/http-status";
import { user, groupsOfUser } from "../../api/graphql/queries/users";
import { group, searchGroups } from "../../api/graphql/queries/groups";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  addMember,
  removeMember,
  removeJoinRequest,
} from "../../api/graphql/mutations/groups";
import {
  deleteAccount,
  updateProfile,
} from "../../api/graphql/mutations/users";
import { login, loginAsGuest, logout } from "../../api/graphql/mutations/auth";
import { RequestHandler } from "express";
import LifecyclePlugin from "../../core/graphql/plugins/lifecycle";
import buildApolloContext from "../../core/graphql/context_builder";
import { messages } from "../../api/graphql/queries/messages";
import { sendMessage } from "../../api/graphql/mutations/messages";

/**
 * Mapping of all GraphQL resolvers.
 */
export const resolvers = {
  Void: Void,
  Query: {
    user,
    group,
    searchGroups,
    messages,
  },
  User: {
    groups: groupsOfUser,
  },

  Mutation: {
    login,
    loginAsGuest,
    logout,
    updateProfile,
    deleteAccount,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    addMember,
    removeMember,
    removeJoinRequest,
    sendMessage,
  },
};

/**
 * Adds the Apollo GraphQL middleware to the express server.
 * @returns The Apollo GraphQL middleware.
 */
export async function addApolloMiddleware(): Promise<RequestHandler> {
  // setup graphql server
  const graphql = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: process.env.DEBUGGING !== undefined,
    plugins: [LifecyclePlugin, HttpStatusPlugin],
  });

  await graphql.start();

  return expressMiddleware(graphql, {
    context: buildApolloContext,
  });
}
