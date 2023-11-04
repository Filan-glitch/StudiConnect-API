import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../model/app_context";
import User from "../../model/user";
import { queryOneByID } from "../../mongo/queries";
import AuthenticationError from "../errors/authentication";
import NotFoundError from "../errors/not-found";

export async function user(
  _parent: unknown,
  args: { id: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<User> {
  const { id } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationError("Sie sind nicht angemeldet.");
  }

  let result = await queryOneByID(User, id, info);
  if (result == null) {
    throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
  }

  return result;
}
