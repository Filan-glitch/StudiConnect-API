import moment from "moment";
import UserTO, { mapUserTO } from "./user_to";

export default interface GroupTO {
  id: string | undefined;
  title: string | undefined;
  description: string | undefined;
  module: string | undefined;
  creator: UserTO | undefined;
  members: UserTO[] | undefined;
  joinRequests: UserTO[] | undefined;
  createdAt: string | undefined;
  lat: number | undefined;
  lon: number | undefined;
}

export function mapGroupTO(group: any): GroupTO {
  return {
    id: group.id?.toString(),
    title: group.title,
    description: group.description,
    module: group.module,
    creator: group.creator,
    members: group.members?.map((member: any) => mapUserTO(member)),
    joinRequests: group.joinRequests?.map((joinRequest: any) =>
      mapUserTO(joinRequest)
    ),
    createdAt:
      group.createdAt === undefined
        ? undefined
        : moment(group.createdAt).format("yyyy-MM-DD"),
    lat: group.lat,
    lon: group.lon,
  };
}
