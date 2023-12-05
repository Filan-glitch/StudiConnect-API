export default interface SessionTO {
  sessionID: string | undefined;
  user: string | undefined;
}

export function mapSessionTO(session: any): SessionTO {
  return {
    sessionID: session.sessionID.toString(),
    user: session.user.toString(),
  };
}
