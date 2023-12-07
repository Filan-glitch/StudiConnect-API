import { getElasticsearchClient } from "../../config/elasticsearch";

export async function searchGroupsFromElasticsearch(
  university: string,
  major: string,
  module: string
): Promise<any[]> {
  const client = getElasticsearchClient();

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
              },
            },
            {
              query_string: {
                query: `${major}~2*`,
                fields: ["major"],
              },
            },
            {
              query_string: {
                query: `${module}~2*`,
                fields: ["module"],
              },
            },
          ],
        },
      },
    },
  });

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
  module: string
): Promise<string> {
  const client = getElasticsearchClient();

  const response = await client.index({
    index: "groups",
    body: {
      group_id,
      university,
      major,
      module,
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