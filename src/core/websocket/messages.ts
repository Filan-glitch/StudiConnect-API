import { Connection } from "./connection";

export default {
  addConnection,
  removeConnection,
  getConnection,
};

let connections: Map<string, Connection> = new Map();

function addConnection(userID: string, connection: Connection): void {
  connections.set(userID, connection);
}

function removeConnection(userID: string): void {
  connections.delete(userID);
}

function getConnection(userID: string): Connection | undefined {
  return connections.get(userID);
}
