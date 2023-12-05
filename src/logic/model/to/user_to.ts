export default interface UserTO {
  id: string | undefined;
  email: string | undefined;
  username: string | undefined;
  verified: boolean | undefined;
  publicVisible: boolean | undefined;
  darkThemeEnabled: boolean | undefined;
  university: string | undefined;
  major: string | undefined;
  location: string | undefined;
  bio: string | undefined;
  mobile: string | undefined;
  discord: string | undefined;
}

export function mapUserTO(user: any): UserTO {
  return {
    id: user.id.toString(),
    email: user.email,
    username: user.username,
    verified: user.verified,
    publicVisible: user.publicVisible,
    darkThemeEnabled: user.darkThemeEnabled,
    university: user.university,
    major: user.major,
    location: user.location,
    bio: user.bio,
    mobile: user.mobile,
    discord: user.discord,
  };
}
