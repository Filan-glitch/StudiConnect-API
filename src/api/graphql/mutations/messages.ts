import NoPermissionError from "../../../logic/model/exceptions/no_permission";
import NotFoundError from "../../../logic/model/exceptions/not_found";
import MessageTO from "../../../logic/model/to/message_to";
import AuthenticationGraphQlError from "../errors/authentication";
import NotFoundGraphQlError from "../errors/not-found";
import logic from "../../../logic/messaging_logic";
import AppContext from "../../../core/graphql/model/app_context";
import { GraphQLResolveInfo } from "graphql";

export async function sendMessage(
  _parent: unknown,
  args: { content: string; group: string },
  context: AppContext,
  info: GraphQLResolveInfo
): Promise<MessageTO> {
  const { content, group } = args;
  const { userID } = context;

  if (userID == undefined) {
    throw new AuthenticationGraphQlError("Sie sind nicht angemeldet.");
  }

  let result: MessageTO;

  try {
    result = await logic.sendMessage(content, userID, group, info);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundGraphQlError(error.message);
    } else if (error instanceof NoPermissionError) {
      throw new AuthenticationGraphQlError(error.message);
    }

    throw error;
  }

  return result;
}
