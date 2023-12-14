import { GraphQLResolveInfo } from "graphql";
import { queryOneByID } from "../../core/dataaccess/query_builder";
import { UserModelConfig } from "../../dataaccess/schema/user";
import NotFoundError from "../model/exceptions/not_found";
import UserTO, { mapUserTO } from "../model/to/user_to";

export async function findUserByID(
  id: string,
  currentUser: string,
  requestInfo: GraphQLResolveInfo
): Promise<UserTO> {
  let entity = await queryOneByID(UserModelConfig, id, requestInfo);

  if (entity == null) {
    throw new NotFoundError("Der Benutzer konnte nicht gefunden werden.");
  }

  if (id != currentUser) {
    entity.verified = undefined;
  }

  return mapUserTO(entity);
}
