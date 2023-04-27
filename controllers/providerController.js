import Provider from '../models/providerModel.js';
import memberController from './memberController.js';

export default {
  getMe: memberController.getMe,
  updateMe: memberController.updateMe(
    Provider,
    'firstName',
    'lastName',
    'email',
    'dateOfBirth'
  ),
  deleteMe: memberController.deleteMe(Provider),

  createProvider: memberController.createMember,
  getProvider: memberController.getMember(Provider),
  getAllProviders: memberController.getAllMembers(Provider),

  updateProvider: memberController.updateMember(Provider),
  deleteProvider: memberController.deleteMember(Provider),
};
