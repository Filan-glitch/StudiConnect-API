import { onConnectionEstablished } from "../websocket/messages";
import { getGroupImage, setGroupImage, deleteGroupImage } from "./group-images";
import { health } from "./health";
import {
  deleteProfileImage,
  getProfileImage,
  setProfileImage,
} from "./profile-images";

export default {
  health,
  getProfileImage,
  setProfileImage,
  deleteProfileImage,
  getGroupImage,
  setGroupImage,
  deleteGroupImage,
  onConnectionEstablished,
};
