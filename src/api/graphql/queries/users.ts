import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import NotFoundGraphQlError from "../errors/not-found";
import UserTO from "../../../logic/model/to/user_to";
import { findUserByID } from "../../../logic/user_logic";
import NoPermissionError from "../../../logic/model/exceptions/no_permission";
import NotFoundError from "../../../logic/model/exceptions/not_found";

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
    result = await findUserByID(id, userID, info);
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
