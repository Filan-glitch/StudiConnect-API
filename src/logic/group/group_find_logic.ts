import { GraphQLResolveInfo } from "graphql";
import GroupTO, { mapGroupTO } from "../model/to/group_to";
import { queryOneByID, query } from "../../core/dataaccess/query_builder";
import { GroupModelConfig } from "../../dataaccess/schema/group";
import NotFoundError from "../model/exceptions/not_found";
import User from "../../dataaccess/schema/user";
import {
  deleteGroupIndex,
  searchGroupsFromElasticsearch,
} from "../../dataaccess/elasticsearch/groups";
import { groupImageExists } from "./group_image_logic";

/**
 * Finds a group by its id.
 * @param id The id of the group.
 * @param requestInfo The GraphQLResolveInfo.
 * @returns The group with the requested fields.
 * @throws NotFoundError if the group does not exist.
 */
export async function findGroupByID(
  id: string,
  requestInfo: GraphQLResolveInfo
): Promise<GroupTO> {
  let entity = await queryOneByID(GroupModelConfig, id, requestInfo);

  if (entity == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  let to = mapGroupTO(entity);
  to.imageExists = groupImageExists(id);
  return to;
}

/**
 * Finds a group by search criteria with elasticsearch.
 * The parameters university, major and location come from the user.
 * @param module The module of the group.
 * @param radius The radius in which the group should be searched.
 * @param userID The id of the user who issues the request.
 * @param requestInfo The GraphQLResolveInfo.
 * @returns The groups with the requested fields.
 * @throws NotFoundError if the user does not exist.
 * @throws Error if an unexpected error occurs.
 */
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

  // verify that the user has all required fields
  if (
    user.university == null ||
    user.major == null ||
    user.lat == null ||
    user.lon == null
  ) {
    throw new Error("Es ist ein unerwarteter Fehler aufgetreten.");
  }

  // search groups in elasticsearch
  let searchResults = await searchGroupsFromElasticsearch(
    user.university,
    user.major,
    module,
    { lat: user.lat, lon: user.lon },
    radius
  );

  // filter out groups with low score
  searchResults = searchResults.filter((result: any) => result.score > 1);

  let results = [];

  // find groups in mongodb
  for (let result of searchResults) {
    try {
      let group = await findGroupByID(result.group_id, requestInfo);

      results.push(group);
    } catch (e) {
      if (e instanceof NotFoundError) {
        deleteGroupIndex(result.group_id);
        continue;
      }
      throw e;
    }
  }

  return results;
}

/**
 * Finds all groups of a user.
 * @param userID The id of the user.
 * @param info The GraphQLResolveInfo.
 * @returns The groups with the requested fields.
 */
export async function findGroupsOfUser(
  userID: string,
  info: GraphQLResolveInfo
): Promise<GroupTO[]> {
  return (await query(GroupModelConfig, { members: userID }, info))
    .map((group: any) => mapGroupTO(group))
    .map((group: GroupTO) => {
      group.imageExists = groupImageExists(group.id!);
      return group;
    });
}
