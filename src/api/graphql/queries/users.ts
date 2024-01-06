import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import NotFoundGraphQlError from "../errors/not-found";
import UserTO from "../../../logic/model/to/user_to";
import logic from "../../../logic/user";
import NoPermissionError from "../../../logic/model/exceptions/no_permission";
import NotFoundError from "../../../logic/model/exceptions/not_found";
import GroupTO from "../../../logic/model/to/group_to";
import groupLogic from "../../../logic/group";

/**
 * GraphQL resolver for the `user` query.
 * This query returns the user with the given ID.
 * @param _parent -not used-
 * @param args The id of the user.
 * @param context The context of the request.
 * @param info The GraphQL resolve info.
 * @returns The user with the given ID.
 * @throws AuthenticationGraphQlError if the user is not logged in.
 * @throws NotFoundGraphQlError if the user does not exist.
 */
export async function user(
  _parent: unknown,
  args: { id: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<UserTO> {
  const { id } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  let result: UserTO;

  try {
    result = await logic.findUserByID(id, userID, info);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    } else if (error instanceof NoPermissionError) {
      throw new AuthenticationGraphQlError(error.message);
    }

    throw error;
  }

  return result;
}

/**
 * GraphQL resolver for the `groupsOfUser` query.
 * This query returns all groups of the user.
 * @param parent arguments of the parent query
 * @param _args -not used-
 * @param context The context of the request.
 * @param info The GraphQL resolve info.
 * @returns All users.
 * @throws AuthenticationGraphQlError if the user is not logged in.
 * @throws NoPermissionError if the user is not the owner of the groups.
 */
export async function groupsOfUser(
  parent: UserTO,
  _args: unknown,
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<GroupTO[]> {
  if (parent.id == undefined) {
    throw new Error("ID was not fetched");
  }

  if (parent.id != context.userID) {
    throw new NoPermissionError(
      "Sie haben keine Berechtigung, die Gruppen einzusehen."
    );
  }

  return groupLogic.findGroupsOfUser(parent.id ?? "", info);
}
