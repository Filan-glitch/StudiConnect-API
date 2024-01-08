import moment from "moment";
import UserTO, { mapUserTO } from "./user_to";
import GroupTO, { mapGroupTO } from "./group_to";

export default interface MessageTO {
  id: string | undefined;
  content: string | undefined;
  sender: UserTO | undefined;
  group: GroupTO | undefined;
  sendAt: string | undefined;
}

export function mapMessageTO(message: any): MessageTO {
  let sendAt: string | undefined;

  if (message.sendAt !== undefined) {
    if (typeof message.sendAt === "string") {
      sendAt = message.sendAt;
    } else {
      sendAt = moment(message.sendAt).format("yyyy-MM-DD HH:mm:ss");
    }
  }

  return {
    id: message.id?.toString(),
    content: message.content,
    sender:
      message.sender === undefined ? undefined : mapUserTO(message.sender),
    group: message.group === undefined ? undefined : mapGroupTO(message.group),
    sendAt,
  };
}
