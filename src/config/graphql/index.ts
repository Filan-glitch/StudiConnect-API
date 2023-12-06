import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import typeDefs from "./type-defs";
import { Void } from "../../core/graphql/model/void";
import AppContext from "../../core/graphql/model/app_context";
import HttpStatusPlugin from "../../core/graphql/plugins/http-status";
import { user } from "../../api/graphql/queries/users";
import { group, searchGroups_resolver } from "../../api/graphql/queries/groups";
import {
  createGroup_resolver,
  updateGroup_resolver,
  deleteGroup_resolver,
  joinGroup_resolver,
  addMember_resolver,
  removeMember_resolver,
} from "../../api/graphql/mutations/groups";
import { updateProfile_resolver } from "../../api/graphql/mutations/users";
import {
  login_resolver,
  logout_resolver,
} from "../../api/graphql/mutations/auth";
import { RequestHandler } from "express";
import LifecyclePlugin from "../../core/graphql/plugins/lifecycle";
import AuthenticationPlugin from "../../core/graphql/plugins/authentication";
import buildApolloContext from "../../core/graphql/context_builder";

export const resolvers = {
  Void: Void,
  Query: {
    user,
    group,
    searchGroups: searchGroups_resolver,
  },
  Mutation: {
    login: login_resolver,
    logout: logout_resolver,
    updateProfile: updateProfile_resolver,
    createGroup: createGroup_resolver,
    updateGroup: updateGroup_resolver,
    deleteGroup: deleteGroup_resolver,
    joinGroup: joinGroup_resolver,
    addMember: addMember_resolver,
    removeMember: removeMember_resolver,
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
