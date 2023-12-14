import { updateProfile } from "./user_edit_logic";
import { findUserByID } from "./user_find_logic";
import {
  deleteProfileImage,
  getProfileImage,
  setProfileImage,
} from "./user_image_logic";

export default {
  findUserByID,
  updateProfile,
  getProfileImage,
  setProfileImage,
  deleteProfileImage,
};
