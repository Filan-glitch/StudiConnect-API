import { Client } from "@elastic/elasticsearch";

let client: Client;

export async function connectElasticsearch(): Promise<void> {
  client = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  });

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

  testData();

  console.log("> Elasticsearch connected");
}

export function getElasticsearchClient(): Client {
  return client;
}

async function testData(): Promise<void> {
  let client = getElasticsearchClient();

  // await client.index({
  //   index: "groups",
  //   document: {
  //     group_id: "654662be1f191db17954cb26",
  //     university: "Hochschule Ruhr West",
  //     major: "Angewandte Informatik",
  //     module: "Softwaretechnik",
  //   },
  // });
}
