import { FieldNode, GraphQLResolveInfo, SelectionNode } from "graphql";
import { PopulateOptions } from "mongoose";
import EntityConfig from "./entity_config";

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

    if (
      rootEntity.fieldsToExclude.includes(fieldName) ||
      fieldName === "__typename"
    ) {
      continue;
    }

    const entity = rootEntity.fieldsToPopulate.find(
      (x: any) => x.path === fieldName
    );

    if (node.selectionSet === undefined || entity === undefined) {
      selectOptions.push(fieldName);
    } else {
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
