import { createServer } from "http";
import { WebSocketServer } from "ws";

import authentication from "../../logic/authentication_logic";
import connectionManagement from "../../core/websocket/messages";

/**
 * Setup the websocket server
 */
function websocketSetup(): void {
  const server = createServer();
  const wss = new WebSocketServer({ noServer: true });

  // Handle new connections
  wss.on("connection", function connection(ws: any) {
    ws.on("error", console.error);
  });

  // handler for http upgrade requests
  server.on(
    "upgrade",
    async function upgrade(request: any, socket: any, head: any) {
      // before upgrading the connection to a websocket, check if the user is authenticated
      const sessionID = request.headers["session"];
      const groupID = request.headers["group"];

      if (sessionID == undefined) return;
      if (groupID == undefined) return;

      const userID = await authentication.getUserIdBySession(sessionID);

      if (userID == undefined) return;

      // perform upgrade to websocket
      wss.handleUpgrade(request, socket, head, function done(ws) {
        connectionManagement.addConnection(userID, groupID, ws);
        wss.emit("connection", ws);

        ws.on("close", () => {
          if (groupID == undefined) return;
          connectionManagement.removeConnection(userID, groupID);
        });
      });
    }
  );

  server.listen(8081);
  console.log("> Started websocket server");
}

export default websocketSetup;
