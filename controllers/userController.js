import User from '../models/userModel.js';
import * as memberController from './memberController.js';

export const { getMe } = memberController;
export const updateMe = memberController.updateMe(
  User,
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth'
);
export const deleteMe = memberController.deleteMe(User);

export const createUser = memberController.createMember;
export const getUser = memberController.getMember;
export const getAllUsers = memberController.getAllMembers;

export const updateUser = memberController.updateMember;
export const deleteUser = memberController.deleteMember;
