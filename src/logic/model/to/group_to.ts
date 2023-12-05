import moment from "moment";
import UserTO, { mapUserTO } from "./user_to";

export default interface GroupTO {
  id: string | undefined;
  title: string | undefined;
  module: string | undefined;
  creator: UserTO | undefined;
  members: UserTO[] | undefined;
  joinRequests: UserTO[] | undefined;
  createdAt: string | undefined;
  location: string | undefined;
}

export function mapGroupTO(group: any): GroupTO {
  return {
    id: group.id.toString(),
    title: group.title,
    module: group.module,
    creator: group.creator,
    members: group.members?.map((member: any) => mapUserTO(member)),
    joinRequests: group.joinRequests?.map((joinRequest: any) =>
      mapUserTO(joinRequest)
    ),
    createdAt: moment(group.createdAt).format("DD-MM-yyyy"),
    location: group.location,
  };
}
