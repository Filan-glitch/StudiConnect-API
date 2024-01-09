import { Connection } from "./connection_identifier";
import ws from "ws";

export default {
  addConnection,
  removeConnection,
  getConnection,
};

let connections: Connection[] = [];

function addConnection(userID: string, groupID: string, connection: ws): void {
  connections.push({ userID, groupID, socket: connection });
}

function removeConnection(userID: string, groupID: string): void {
  connections = connections.filter(
    (connection) =>
      connection.userID !== userID || connection.groupID !== groupID
  );
}

function getConnection(userID: string, groupID: string): ws | undefined {
  return connections.find(
    (connection) =>
      connection.userID === userID && connection.groupID === groupID
  )?.socket;
}
