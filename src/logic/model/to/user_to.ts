import GroupTO, { mapGroupTO } from "./group_to";

/**
 * Transfer object of a user.
 */
export default interface UserTO {
  id: string | undefined;
  email: string | undefined;
  username: string | undefined;
  verified: boolean | undefined;
  university: string | undefined;
  major: string | undefined;
  lat: number | undefined;
  lon: number | undefined;
  bio: string | undefined;
  mobile: string | undefined;
  discord: string | undefined;
  groups: GroupTO[] | undefined;
}

/**
 * Maps a user entity to a transfer object.
 * @param user The user entity to map.
 * @returns The transfer object.
 */
export function mapUserTO(user: any): UserTO {
  return {
    id: user.id.toString(),
    email: user.email,
    username: user.username,
    verified: user.verified,
    university: user.university,
    major: user.major,
    lat: user.lat,
    lon: user.lon,
    bio: user.bio,
    mobile: user.mobile,
    discord: user.discord,
    groups: user.groups?.map((group: any) => mapGroupTO(group)),
  };
}
