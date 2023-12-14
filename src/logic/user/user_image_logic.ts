import { readFileSync, existsSync, unlinkSync, writeFileSync } from "fs";

export function getProfileImage(uid: string): Buffer | null {
  let path = `${process.env.PUBLIC_FILES}/profile-images/${uid}.jpg`;
  if (existsSync(path)) {
    return readFileSync(path);
  } else {
    return null;
  }
}

export function setProfileImage(uid: string, content: Buffer): void {
  let path = `${process.env.PUBLIC_FILES}/profile-images/${uid}.jpg`;
  writeFileSync(path, content);
}

export function deleteProfileImage(uid: string): void {
  const path = `${process.env.PUBLIC_FILES}/profile-images/${uid}.jpg`;
  if (existsSync(path)) {
    unlinkSync(path);
  }
}
