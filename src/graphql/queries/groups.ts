import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../model/app_context";
import Group from "../../model/group";
import { queryOneByID } from "../../mongo/queries";
import AuthenticationError from "../errors/authentication";
import NotFoundError from "../errors/not-found";

export async function group(
  _parent: unknown,
  args: { id: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<Group> {
  const { id } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  let result = await queryOneByID(Group, id, info);
  if (result == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  return result;
}
