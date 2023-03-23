import Provider from '../models/providerModel.js';
import * as memberController from './memberController.js';

export const { getMe } = memberController;
export const updateMe = memberController.updateMe(
  Provider,
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth'
);
export const deleteMe = memberController.deleteMe(Provider);

export const createProvider = memberController.createMember;
export const getProvider = memberController.getMember;
export const getAllProviders = memberController.getAllMembers;

export const updateProvider = memberController.updateMember;
export const deleteProvider = memberController.deleteMember;
