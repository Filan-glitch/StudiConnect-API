import ws from "ws";
import { Request } from "express";
import authentication from "../../logic/authentication_logic";
import connectionManagement from "../../core/websocket/messages";

export async function onConnectionEstablished(ws: ws, req: Request) {
  const sessionID: string | undefined = req.cookies["session"]?.toString();

  console.log(sessionID);
  if (sessionID == undefined) return;

  const userID = await authentication.getUserIdBySession(sessionID);
  console.log(userID);
  if (userID == undefined) return;

  let group = req.headers["group"]?.toString();

  console.log(group);
  if (group == undefined) return;

  connectionManagement.addConnection(userID, group, ws);

  ws.on("close", () => {
    if (group == undefined) return;
    connectionManagement.removeConnection(userID, group);
  });
}
