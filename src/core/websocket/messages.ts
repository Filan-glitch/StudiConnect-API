import { Connection } from "./connection_identifier";
import ws from "ws";

export default {
  addConnection,
  removeConnection,
  getConnection,
};

let connections: Connection[] = [];

/**
 * Add a connection to the connection list.
 * @param userID ID of the user
 * @param groupID ID of the group
 * @param connection Websocket connection
 */
function addConnection(userID: string, groupID: string, connection: ws): void {
  connections.push({ userID, groupID, socket: connection });
}

/**
 * Remove a connection from the connection list.
 * @param userID ID of the user
 * @param groupID ID of the group
 */
function removeConnection(userID: string, groupID: string): void {
  connections = connections.filter(
    (connection) =>
      connection.userID !== userID || connection.groupID !== groupID
  );
}

/**
 * Get a connection from the connection list.
 * @param userID ID of the user
 * @param groupID ID of the group
 * @returns the connection or undefined, if no connection was found
 */
function getConnection(userID: string, groupID: string): ws | undefined {
  return connections.find(
    (connection) =>
      connection.userID === userID && connection.groupID === groupID
  )?.socket;
}
