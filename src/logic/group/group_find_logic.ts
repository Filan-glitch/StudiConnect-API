import { GraphQLResolveInfo } from "graphql";
import GroupTO, { mapGroupTO } from "../model/to/group_to";
import { queryOneByID } from "../../core/dataaccess/query_builder";
import { GroupModelConfig } from "../../dataaccess/schema/group";
import NotFoundError from "../model/exceptions/not_found";
import User from "../../dataaccess/schema/user";
import { searchGroupsFromElasticsearch } from "../../dataaccess/elasticsearch/groups";

export async function findGroupByID(
  id: string,
  requestInfo: GraphQLResolveInfo
): Promise<GroupTO> {
  let entity = await queryOneByID(GroupModelConfig, id, requestInfo);

  if (entity == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  return mapGroupTO(entity);
}

export async function searchGroups(
  module: string,
  radius: number,
  userID: string,
  requestInfo: GraphQLResolveInfo
): Promise<GroupTO[]> {
  let user = await User.findById(userID);

  if (user == null) {
    throw new NotFoundError("Der Nutzer konnte nicht gefunden werden.");
  }

  if (
    user.university == null ||
    user.major == null ||
    user.lat == null ||
    user.lon == null
  ) {
    throw new Error("Es ist ein unerwarteter Fehler aufgetreten.");
  }

  let searchResults = await searchGroupsFromElasticsearch(
    user.university,
    user.major,
    module,
    { lat: user.lat, lon: user.lon },
    radius
  );

  searchResults = searchResults.filter((result: any) => result.score > 1);

  let results = [];

  for (let result of searchResults) {
    let group = await findGroupByID(result.group_id, requestInfo);

    if (group == null) {
      throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
    }

    results.push(mapGroupTO(group));
  }

  return results;
}
