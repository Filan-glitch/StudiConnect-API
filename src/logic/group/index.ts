import { createGroup, updateGroup, deleteGroup } from "./group_edit_logic";
import {
  findGroupByID,
  findGroupsOfUser,
  searchGroups,
} from "./group_find_logic";
import {
  getGroupImage,
  setGroupImage,
  deleteGroupImage,
} from "./group_image_logic";
import {
  joinGroup,
  addMember,
  removeMember,
  removeJoinRequest,
} from "./group_member_logic";

export default {
  findGroupByID,
  searchGroups,
  findGroupsOfUser,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  addMember,
  removeMember,
  removeJoinRequest,
  getGroupImage,
  setGroupImage,
  deleteGroupImage,
};
