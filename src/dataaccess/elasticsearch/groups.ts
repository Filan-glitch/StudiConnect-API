import { getElasticsearchClient } from "../../config/elasticsearch";
import Location from "../../logic/model/location";

export async function searchGroupsFromElasticsearch(
  university: string,
  major: string,
  module: string,
  location: Location,
  radius: number
): Promise<any[]> {
  const client = getElasticsearchClient();

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

  console.log(response.hits.hits);

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
