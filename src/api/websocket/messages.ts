import ws from "ws";
import { Request } from "express";
import authentication from "../../logic/authentication_logic";
import connectionManagement from "../../core/websocket/messages";

export async function onConnectionEstablished(ws: ws, req: Request) {
  const sessionID: string | undefined = req.cookies["session"]?.toString();

  if (sessionID == undefined) return;

  const userID = await authentication.getUserIdBySession(sessionID);

  if (userID == undefined) return;

  // TODO: specify group

  connectionManagement.addConnection(userID, { connection: ws });

  ws.on("close", () => {
    connectionManagement.removeConnection(userID);
  });
}
