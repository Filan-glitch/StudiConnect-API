import { getElasticsearchClient } from "../../config/elasticsearch";
import Location from "../../logic/model/location";

/**
 * Searches for groups in the Elasticsearch database.
 * @param university The university to search for.
 * @param major The major to search for.
 * @param module The module to search for.
 * @param location The location to search for.
 * @param radius The radius to search for.
 * @returns The groups found.
 */
export async function searchGroupsFromElasticsearch(
  university: string,
  major: string,
  module: string,
  location: Location,
  radius: number
): Promise<any[]> {
  const client = getElasticsearchClient();

  // return empty array if no search parameters are given
  if (
    university.trim() === "" ||
    major.trim() === "" ||
    module.trim() === "" ||
    radius === 0
  ) {
    return [];
  }

  const response = await client.search({
    index: "groups",
    body: {
      size: 10,
      query: {
        bool: {
          should: [
            // fuzzy search for university, major and module
            {
              query_string: {
                query: `${university}~2*`,
                fields: ["university"],
                boost: 0.3,
              },
            },
            {
              query_string: {
                query: `${major}~2*`,
                fields: ["major"],
                boost: 0.1,
              },
            },
            {
              query_string: {
                query: `${module}~2*`,
                fields: ["module"],
                boost: 5,
              },
            },
          ],
          filter: {
            geo_distance: {
              // match location
              distance: `${radius}km`,
              location: {
                lat: location.lat,
                lon: location.lon,
              },
            },
          },
        },
      },
    },
  });

  // convert result format
  let results = response.hits.hits.map((hit: any) => {
    return {
      group_id: hit._source.group_id,
      university: hit._source.university,
      major: hit._source.major,
      module: hit._source.module,
      score: hit._score,
    };
  });

  return results;
}

/**
 * Creates a new group in the Elasticsearch database.
 * @param group_id The id of the group from mongodb.
 * @param university The university of the group.
 * @param major The major of the group.
 * @param module The module of the group.
 * @param lat The latitude of the group.
 * @param lon The longitude of the group.
 * @returns The id of the created group.
 */
export async function createGroupIndex(
  group_id: string,
  university: string,
  major: string,
  module: string,
  lat: number,
  lon: number
): Promise<string> {
  const client = getElasticsearchClient();

  const response = await client.index({
    index: "groups",
    body: {
      group_id,
      university,
      major,
      module,
      location: {
        lat,
        lon,
      },
    },
  });

  return response._id;
}

/**
 * Delete a group from the Elasticsearch database.
 * @param group_id The id of the group to delete.
 */
export async function deleteGroupIndex(group_id: string): Promise<void> {
  const client = getElasticsearchClient();

  await client.deleteByQuery({
    index: "groups",
    body: {
      query: {
        match: {
          group_id,
        },
      },
    },
  });
}
