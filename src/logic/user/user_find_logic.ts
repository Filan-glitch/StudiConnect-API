import { GraphQLResolveInfo } from "graphql";
import { queryOneByID } from "../../core/dataaccess/query_builder";
import { UserModelConfig } from "../../dataaccess/schema/user";
import NotFoundError from "../model/exceptions/not_found";
import UserTO, { mapUserTO } from "../model/to/user_to";

/**
 * Finds a user by its id.
 * @param id The id of the user.
 * @param currentUser The id of the user who issues the request.
 * @param requestInfo The GraphQLResolveInfo.
 * @returns The user with the requested fields.
 * @throws NotFoundError if the user does not exist.
 */
export async function findUserByID(
  id: string,
  currentUser: string,
  requestInfo: GraphQLResolveInfo
): Promise<UserTO> {
  let entity = await queryOneByID(UserModelConfig, id, requestInfo);

  if (entity == null) {
    throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
  }

  // hide private fields to other users
  if (id != currentUser) {
    entity.verified = undefined;
  }

  return mapUserTO(entity);
}
