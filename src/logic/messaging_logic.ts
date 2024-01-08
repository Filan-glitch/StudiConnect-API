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
      sendAt: -1,
    },
  };
  return (await query(MessageModelConfig, { group }, info, config)).map(
    mapMessageTO
  );
}

async function sendMessage(
  content: string,
  sender: string,
  group: string,
  info: GraphQLResolveInfo
): Promise<MessageTO> {
  const groupEntity = await GroupModelConfig.model.findById(group);

  if (groupEntity == null) {
    throw new NotFoundError("Die Gruppe konnte nicht gefunden werden.");
  }

  if (
    !groupEntity.members
      .map((member: any) => member.toHexString())
      .includes(sender)
  ) {
    throw new NotFoundError("Sie sind kein Mitglied der Gruppe.");
  }

  let message = new MessageModelConfig.model({
    _id: new mongoose.Types.ObjectId(),
    content,
    sender,
    group,
    sendAt: new Date(),
  });
  await message.save();

  const id = message._id;

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
    if (connection != undefined) {
      connection.send(message);
    }
  }

  return mapMessageTO(await queryOneByID(MessageModelConfig, id, info));
}
