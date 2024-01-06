import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import NotFoundGraphQlError from "../errors/not-found";
import GroupTO from "../../../logic/model/to/group_to";
import logic from "../../../logic/group";
import NotFoundError from "../../../logic/model/exceptions/not_found";

/**
 * GraphQL resolver for the `group` query.
 * This query returns the group with the given ID.
 * @param _parent -not used-
 * @param args The id of the group.
 * @param context The context of the request.
 * @param info The GraphQL resolve info.
 * @returns The group with the given ID.
 * @throws AuthenticationGraphQlError if the user is not logged in.
 * @throws NotFoundGraphQlError if the group does not exist.
 */
export async function group(
  _parent: unknown,
  args: { id: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<GroupTO> {
  const { id } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  let result: GroupTO;
  try {
    result = await logic.findGroupByID(id, info);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    }

    throw error;
  }

  return result;
}

/**
 * GraphQL resolver for the `searchGroups` query.
 * This query returns all groups matching the given search criteria.
 * @param _parent -not used-
 * @param args The search criteria.
 * @param context The context of the request.
 * @param info The GraphQL resolve info.
 * @returns All groups matching the given search criteria.
 * @throws AuthenticationGraphQlError if the user is not logged in.
 */
export async function searchGroups(
  _parent: unknown,
  args: { module: string; radius: number },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<GroupTO[]> {
  const { module, radius } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  return logic.searchGroups(module, radius, userID, info);
}
