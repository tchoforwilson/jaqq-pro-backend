import User from '../models/userModel.js';
import memberController from './memberController.js';

export default {
  getMe: memberController.getMe,
  updateMe: memberController.updateMe(
    User,
    'firstName',
    'lastName',
    'email',
    'phone',
    'dateOfBirth'
  ),
  deleteMe: memberController.deleteMe(User),
  createUser: memberController.createMember,
  getUser: memberController.getMember(User),
  getAllUsers: memberController.getAllMembers(User),
  updateUser: memberController.updateMember(User),
  deleteUser: memberController.deleteMember(User),
};
