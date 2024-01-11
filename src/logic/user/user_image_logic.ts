import { readFileSync, existsSync, unlinkSync, writeFileSync } from "fs";

/**
 * Verifies that the user has an image.
 * @param uid id of the user
 * @returns true if the user image exists, false otherwise
 */
export function getProfileImage(uid: string): Buffer | null {
  let path = `${process.env.PUBLIC_FILES}/profile-images/${uid}.jpg`;
  if (existsSync(path)) {
    return readFileSync(path);
  } else {
    return null;
  }
}

/**
 * Writes the image of a user.
 * @param uid id of the user
 * @param content image content
 */
export function setProfileImage(uid: string, content: Buffer): void {
  let path = `${process.env.PUBLIC_FILES}/profile-images/${uid}.jpg`;
  writeFileSync(path, content);
}

/**
 * Deletes the image of a user.
 * @param uid id of the user
 */
export function deleteProfileImage(uid: string): void {
  const path = `${process.env.PUBLIC_FILES}/profile-images/${uid}.jpg`;
  if (existsSync(path)) {
    unlinkSync(path);
  }
}
