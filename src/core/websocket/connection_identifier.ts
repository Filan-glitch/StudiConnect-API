import ws from "ws";

export interface Connection {
  userID: string;
  groupID: string;
  socket: ws;
}
