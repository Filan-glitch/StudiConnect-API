import { GraphQLResolveInfo } from "graphql";
import { query, queryOneByID } from "../core/dataaccess/query_builder";
import { MessageModelConfig } from "../dataaccess/schema/message";
import mongoose from "mongoose";
import MessageTO, { mapMessageTO } from "./model/to/message_to";
import NotFoundError from "./model/exceptions/not_found";
import connectionManagement from "../core/websocket/messages";
import { GroupModelConfig } from "../dataaccess/schema/group";
import QueryConfig from "../core/dataaccess/query_config";

export default {
  getMessagesOfGroup,
  sendMessage,
};

/**
 * Query all messages of a group.
 * @param group ID of the group
 * @param userID ID of the current user
 * @param page page id for pagination
 * @param info GraphQLResolveInfo
 * @returns list of messages
 */
async function getMessagesOfGroup(
  group: string,
  userID: string,
  page: number,
  info: GraphQLResolveInfo
): Promise<MessageTO[]> {
  const groupEntity = await GroupModelConfig.model.findById(group);
  if (groupEntity == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  // check if the user is a member of the group
  if (
    !groupEntity.members
      .map((member: any) => member.toHexString())
      .includes(userID)
  ) {
    throw new NotFoundError("Sie sind kein Mitglied der Gruppe.");
  }

  const config: QueryConfig = {
    page,
    sort: {
      sendAt: -1, // sort by sendAt descending
    },
  };

  return (await query(MessageModelConfig, { group }, info, config)).map(
    mapMessageTO
  );
}

/**
 * Send a message to a group and broadcasts it to all members of the group via websocket.
 * @param content content of the message
 * @param sender ID of the sender
 * @param group ID of the group
 * @param info GraphQLResolveInfo
 * @returns the message
 */
async function sendMessage(
  content: string,
  sender: string,
  group: string,
  info: GraphQLResolveInfo
): Promise<MessageTO> {
  // check if group exists
  const groupEntity = await GroupModelConfig.model.findById(group);

  if (groupEntity == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  // check if the user is a member of the group
  if (
    !groupEntity.members
      .map((member: any) => member.toHexString())
      .includes(sender)
  ) {
    throw new NotFoundError("Sie sind kein Mitglied der Gruppe.");
  }

  // save message to mongodb
  let message = new MessageModelConfig.model({
    _id: new mongoose.Types.ObjectId(),
    content,
    sender,
    group,
    sendAt: new Date(),
  });
  await message.save();

  const id = message._id;

  // format message to JSON for sending it via websocket
  message = JSON.stringify(
    mapMessageTO(
      await MessageModelConfig.model
        .findById(id)
        .select("id content sender sendAt")
        .populate({ path: "sender", select: "id username" })
    )
  );

  // send message to all members of the group
  for (const member of groupEntity.members) {
    const memberID = member.toHexString();
    const connection = connectionManagement.getConnection(memberID, group);
    // check if connection is open
    if (connection != undefined && connection.readyState === 1) {
      connection.send(message);
    }
  }

  return mapMessageTO(await queryOneByID(MessageModelConfig, id, info));
}
