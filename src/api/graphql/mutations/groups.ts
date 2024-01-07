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

/**
 * GraphQL resolver for the `createGroup` mutation.
 * This mutation creates a new group.
 * @param _parent -not used-
 * @param args The arguments of the mutation.
 * @param context The context of the request.
 * @param info The GraphQL resolve info.
 * @returns The created group.
 * @throws AuthenticationGraphQlError if the user is not logged in.
 * @throws NotFoundGraphQlError if the user does not exist.
 */
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

  // Check if the user is logged in.
  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  let groupID;
  try {
    groupID = await logic.createGroup(
      title,
      description,
      module,
      { lat, lon },
      userID
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    }
    throw error;
  }

  return logic.findGroupByID(groupID, info);
}

/**
 * GraphQL resolver for the `updateGroup` mutation.
 * This mutation updates a group.
 * @param _parent -not used-
 * @param args The arguments of the mutation.
 * @param context The context of the request.
 * @param info The GraphQL resolve info.
 * @returns The updated group.
 * @throws AuthenticationGraphQlError if the user is not logged in.
 * @throws NotFoundGraphQlError if the group does not exist.
 * @throws NoPermissionGraphQlError if the user is not a member of the group.
 */
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

/**
 * GraphQL resolver for the `deleteGroup` mutation.
 * This mutation deletes a group.
 * @param _parent -not used-
 * @param args The arguments of the mutation.
 * @param context The context of the request.
 * @param _info The GraphQL resolve info.
 * @throws AuthenticationGraphQlError if the user is not logged in.
 * @throws NotFoundGraphQlError if the group does not exist.
 * @throws NoPermissionGraphQlError if the user is not a member of the group.
 */
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

/**
 * GraphQL resolver for the `joinGroup` mutation.
 * This mutation adds a join request for a group.
 * @param _parent -not used-
 * @param args The arguments of the mutation.
 * @param context The context of the request.
 * @param _info The GraphQL resolve info.
 * @throws AuthenticationGraphQlError if the user is not logged in or the user is not .
 * @throws NotFoundGraphQlError if the group does not exist.
 * @throws DuplicateGraphQlError if the user is already a member of the group or the user did already send a join request.
 */
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
    } else if (error instanceof DuplicateError) {
      throw new DuplicateGraphQlError(error.message);
    }
    throw error;
  }
}

/**
 * GraphQL resolver for the `leaveGroup` mutation.
 * This mutation adds a member to a group.
 * @param _parent -not used-
 * @param args The arguments of the mutation.
 * @param context The context of the request.
 * @param _info The GraphQL resolve info.
 * @throws AuthenticationGraphQlError if the user is not logged in or no member of the group.
 * @throws NotFoundGraphQlError if the group does not exist.
 * @throws DuplicateGraphQlError if the user is already a member of the group.
 */
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

/**
 * GraphQL resolver for the `removeMember` mutation.
 * This mutation removes a member from a group.
 * @param _parent -not used-
 * @param args The arguments of the mutation.
 * @param context The context of the request.
 * @param _info The GraphQL resolve info.
 * @throws AuthenticationGraphQlError if the user is not logged in or no member of the group.
 * @throws NotFoundGraphQlError if the group does not exist.
 */
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

/**
 * GraphQL resolver for the `removeJoinRequest` mutation.
 * This mutation removes/declines a join request from a group.
 * @param _parent -not used-
 * @param args The arguments of the mutation.
 * @param context The context of the request.
 * @param _info The GraphQL resolve info.
 * @throws AuthenticationGraphQlError if the user is not logged in or no member of the group.
 * @throws NotFoundGraphQlError if the group or the join request does not exist.
 */
export async function removeJoinRequest(
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
    await logic.removeJoinRequest(id, user, userID);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    } else if (error instanceof NoPermissionError) {
      throw new AuthenticationGraphQlError(error.message);
    }
    throw error;
  }
}
