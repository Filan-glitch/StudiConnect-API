import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import NotFoundGraphQlError from "../errors/not-found";
import GroupTO from "../../../logic/model/to/group_to";
import { findGroupByID, searchGroups } from "../../../logic/groups_logic";
import NotFoundError from "../../../logic/model/exceptions/not_found";

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
    result = await findGroupByID(id, info);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    }

    throw error;
  }

  return result;
}

export async function searchGroups_resolver(
  _parent: unknown,
  args: { module: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<GroupTO[]> {
  const { module } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  return searchGroups(module, userID, info);
}
