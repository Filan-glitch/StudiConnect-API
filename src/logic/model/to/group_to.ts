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
  imageExists: boolean | undefined;
}

export function mapGroupTO(group: any): GroupTO {
  let createdAt: string | undefined;

  if (group.createdAt !== undefined) {
    if (typeof group.createdAt === "string") {
      createdAt = group.createdAt;
    } else {
      createdAt = moment(group.createdAt).format("yyyy-MM-DD");
    }
  }

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
    createdAt,
    lat: group.lat,
    lon: group.lon,
    imageExists: undefined,
  };
}
