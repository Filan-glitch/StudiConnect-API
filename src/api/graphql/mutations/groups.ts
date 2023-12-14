import { GraphQLResolveInfo } from "graphql";
import AppContext from "../../../core/graphql/model/app_context";
import AuthenticationGraphQlError from "../errors/authentication";
import GroupTO from "../../../logic/model/to/group_to";
import logic from "../../../logic/group";
import NotFoundGraphQlError from "../errors/not-found";
import DuplicateGraphQlError from "../errors/duplicate";
import DuplicateError from "../../../logic/model/exceptions/duplicate";
import NoPermissionError from "../../../logic/model/exceptions/no_permission";
import NotFoundError from "../../../logic/model/exceptions/not_found";

export async function createGroup(
  _parent: unknown,
  args: {
    title: string;
    description: string;
    module: string;
    lat: number;
    lon: number;
  },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<GroupTO> {
  const { title, description, module, lat, lon } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  let groupID = await logic.createGroup(
    title,
    description,
    module,
    { lat, lon },
    userID
  );

  return logic.findGroupByID(groupID, info);
}

export async function updateGroup(
  _parent: unknown,
  args: {
    id: string;
    title: string;
    description: string;
    lat: number;
    lon: number;
    module: string;
  },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<GroupTO> {
  const { id, title, description, lat, lon, module } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  try {
    await logic.updateGroup(
      id,
      title,
      description,
      { lat, lon },
      module,
      userID
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    } else if (error instanceof NoPermissionError) {
      throw new AuthenticationGraphQlError(error.message);
    }

    throw error;
  }

  return logic.findGroupByID(id, info);
}

export async function deleteGroup(
  _parent: unknown,
  args: { id: string },
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  const { id } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  try {
    await logic.deleteGroup(id, userID);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    } else if (error instanceof NoPermissionError) {
      throw new AuthenticationGraphQlError(error.message);
    }

    throw error;
  }
}

export async function joinGroup(
  _parent: unknown,
  args: { id: string },
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  const { id } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  try {
    await logic.joinGroup(id, userID);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    } else if (error instanceof NoPermissionError) {
      throw new AuthenticationGraphQlError(error.message);
    } else if (error instanceof DuplicateError) {
      throw new DuplicateGraphQlError(error.message);
    }
    throw error;
  }
}

export async function addMember(
  _parent: unknown,
  args: { id: string; user: string },
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  const { id, user } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  try {
    await logic.addMember(id, user, userID);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    } else if (error instanceof NoPermissionError) {
      throw new AuthenticationGraphQlError(error.message);
    } else if (error instanceof DuplicateError) {
      throw new DuplicateGraphQlError(error.message);
    }
    throw error;
  }
}

export async function removeMember(
  _parent: unknown,
  args: { id: string; user: string },
  context: AppContext,
  _info: GraphQLResolveInfo
): Promise<void> {
  const { id, user } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  try {
    await logic.removeMember(id, user, userID);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    } else if (error instanceof NoPermissionError) {
      throw new AuthenticationGraphQlError(error.message);
    }
    throw error;
  }
}
