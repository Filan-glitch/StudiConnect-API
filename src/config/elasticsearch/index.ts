import { Client } from "@elastic/elasticsearch";

let client: Client;

/**
 * Connects to the Elasticsearch database.
 */
export async function connectElasticsearch(): Promise<void> {
  client = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  });

  // create index for groups, if it does not exist
  if (!(await client.indices.exists({ index: "groups" }))) {
    await client.indices.create(
      {
        index: "groups",
        body: {
          mappings: {
            properties: {
              group_id: { type: "text" }, // id from mongodb
              university: { type: "text" },
              major: { type: "text" },
              module: { type: "text" },
              location: { type: "geo_point" },
            },
          },
        },
      },
      { ignore: [400] }
    );
  }

  console.log("> Elasticsearch connected");
}

export function getElasticsearchClient(): Client {
  return client;
}
