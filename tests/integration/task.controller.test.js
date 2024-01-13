import { expect } from 'expect';

import Service from '../../models/service.model.js';
import User from '../../models/user.model.js';
import Task from '../../models/task.model.js';
import { api, createUser, BASE_URL, getHeader } from '../test.config.js';
import UnitTestBases from '../utilities/unitTestBases.js';
import GenRandomVal from '../utilities/genRandVal.js';

describe('TaskController_Tests', () => {
  let user;
  let header;
  const URL = `${BASE_URL}/tasks`;

  const MAX_LENGTH = 34;
  const MIN_LENGTH = 8;

  before(async () => {
    user = await createUser();
    header = getHeader(user);
  });
  after(async () => {
    await User.deleteMany({});
  });

  describe(`GET ${URL}`, () => {
    it('Test_GetAllTasks It should return 200 with no task', async () => {
      // 1. Clear database collections
      await Service.deleteMany({});
      await Task.deleteMany({});

      // 2. Generate random services
      const genServices = UnitTestBases.GenRandomServices(
        GenRandomVal.GenRandomIntegerInRange(MIN_LENGTH, MAX_LENGTH)
      );

      // 3. Create random services and get ids
      const randServices = await Service.insertMany(genServices);
      let servicesIds = [];
      randServices.forEach((service) => servicesIds.push(service.id));

      // 4. Generate random tasks
      const genTasks = UnitTestBases.GenRandomValidTasks(
        servicesIds,
        GenRandomVal.GenRandomIntegerInRange(MIN_LENGTH, MAX_LENGTH)
      );

      // 5.Create random tasks
      const randTasks = await Task.insertMany(genTasks);

      // 6. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 7. Expect result
      expect(res.status).toBe(200);
    });
    it('Test_GetAllTasks It should return 200 with tasks', async () => {
      // 1. Clear database collection
      await Task.deleteMany({});

      // 2. Generate a list of tasks
      const genTasks = UnitTestBases.GenRandomValidTask();

      // 2. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 3. Expect result
      expect(res.status).toBe(200);
    });
  });
});
