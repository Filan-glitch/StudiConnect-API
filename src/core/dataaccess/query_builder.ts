import { FieldNode, GraphQLResolveInfo, SelectionNode } from "graphql";
import { PopulateOptions } from "mongoose";
import EntityConfig from "./entity_config";

/**
 * Queries the database for the given entity with the fields requested via GraphQL.
 * @param entity base entity of the request
 * @param params query parameters
 * @param info info object from the resolver
 * @returns result from the query with only the requested fields
 */
export function query(
  entity: EntityConfig,
  params: any,
  info: GraphQLResolveInfo
): Promise<any> {
  if (info.fieldNodes.length !== 1) {
    throw new Error("Invalid number of requests");
  }

  let { populate, select } = _populateFields(
    info.fieldNodes[0].selectionSet?.selections,
    entity
  );

  const query = entity.model
    .find(params)
    .populate(populate)
    .select(select.join(" "));

  return query;
}

/**
 * Queries a single entity by id with the fields requested via GraphQL.
 * @param entity base entity of the request
 * @param params query parameters
 * @param info info object from the resolver
 * @returns result from the query with only the requested fields
 */
export async function queryOneByID(
  entity: EntityConfig,
  id: string,
  info: GraphQLResolveInfo
): Promise<any> {
  if (info.fieldNodes.length !== 1) {
    throw new Error("Invalid number of requests");
  }

  let { populate, select } = _populateFields(
    info.fieldNodes[0].selectionSet?.selections,
    entity
  );

  const result = await entity.model
    .findById(id)
    .populate(populate)
    .select(select.join(" "))
    .exec();

  return result;
}

/**
 * Converts the GraphQL query into populate and select options for the mongoose query.
 * @param nodes requested nodes from the GraphQL query
 * @param rootEntity base entity of the request
 * @returns configuration for the populate and select options of the query
 */
function _populateFields(
  nodes: readonly SelectionNode[] | undefined,
  rootEntity: EntityConfig
): { populate: PopulateOptions[]; select: string[] } {
  if (nodes === undefined) {
    return {
      populate: [],
      select: [],
    };
  }

  let populateOptions: PopulateOptions[] = [];
  let selectOptions: string[] = [];

  for (const _node of nodes) {
    let node = _node as FieldNode;
    const fieldName = node.name.value;

    // Skip fields that should be excluded
    if (
      rootEntity.fieldsToExclude.includes(fieldName) ||
      fieldName === "__typename"
    ) {
      continue;
    }

    // Check if the field is a field to populate
    const entity = rootEntity.fieldsToPopulate.find(
      (x: any) => x.path === fieldName
    );

    if (node.selectionSet === undefined || entity === undefined) {
      // If the field is not a field to populate, add it to the select options
      selectOptions.push(fieldName);
    } else {
      // If the field is a field to populate, resolve the details recursively
      let { populate, select } = _populateFields(
        node.selectionSet.selections,
        entity.model
      );

      populateOptions.push({
        path: fieldName,
        model: entity.model.schemaName,
        populate,
        select: select.join(" "),
      });
    }
  }

  return {
    populate: populateOptions,
    select: selectOptions,
  };
}
