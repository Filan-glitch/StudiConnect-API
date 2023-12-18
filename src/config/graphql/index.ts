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
} from "../../api/graphql/mutations/groups";
import { updateProfile } from "../../api/graphql/mutations/users";
import { login, logout } from "../../api/graphql/mutations/auth";
import { RequestHandler } from "express";
import LifecyclePlugin from "../../core/graphql/plugins/lifecycle";
import AuthenticationPlugin from "../../core/graphql/plugins/authentication";
import buildApolloContext from "../../core/graphql/context_builder";

export const resolvers = {
  Void: Void,
  Query: {
    user,
    group,
    searchGroups,
  },
  User: {
    groups: groupsOfUser,
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
    includeStacktraceInErrorResponses: process.env.DEBUGGING !== undefined,
    plugins: [LifecyclePlugin, AuthenticationPlugin, HttpStatusPlugin],
  });

  await graphql.start();

  return expressMiddleware(graphql, {
    context: buildApolloContext,
  });
}
