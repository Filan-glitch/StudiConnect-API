/**
 * Transfer object for session
 */
export default interface SessionTO {
  sessionID: string | undefined;
  user: string | undefined;
}

/**
 * Maps a session entity to a transfer object.
 * @param session The session entity to map.
 * @returns The transfer object.
 */
export function mapSessionTO(session: any): SessionTO {
  return {
    sessionID: session.sessionID.toString(),
    user: session.user.toString(),
  };
}
