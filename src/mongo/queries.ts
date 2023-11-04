import { FieldNode, GraphQLResolveInfo, SelectionNode } from "graphql";
import { PopulateOptions } from "mongoose";
import { IEntity } from "../model/IEntity";

export function query<T extends IEntity>(
  entity: new () => T,
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

  const query = entity.prototype
    .getModel()
    .find(params)
    .populate(populate)
    .select(select.join(" "));

  return query;
}

export function queryOneByID<T extends IEntity>(
  entity: new () => T,
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

  const query = entity.prototype
    .getModel()
    .findById(id)
    .populate(populate)
    .select(select.join(" "));

  return query;
}

function _populateFields<T extends IEntity>(
  nodes: readonly SelectionNode[] | undefined,
  rootEntity: new () => T
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
    const entity = rootEntity.prototype
      .getFieldsToPopulate()
      .find((x: any) => x.path === fieldName);

    if (node.selectionSet === undefined || entity === undefined) {
      selectOptions.push(fieldName);
    } else {
      let { populate, select } = _populateFields(
        node.selectionSet.selections,
        entity.model
      );

      populateOptions.push({
        path: fieldName,
        model: entity.model.prototype.getSchemaName(),
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
