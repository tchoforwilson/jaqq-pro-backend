import { expect } from 'expect';

import User from '../../models/user.model.js';
import GenRandVal from '../utilities/genRandVal.js';
import unitTestBases from '../utilities/unitTestBases.js';
import { api, closeServer, BASE_URL } from '../test.config.js';
import UnitTestBases from '../utilities/unitTestBases.js';

const URL = `${BASE_URL}/auth`;

const secretMinLength = 8;
const secretMaxLength = 16;

describe('AuthController_Tests', () => {
  afterEach(async () => {
    // Delete all users
    await User.deleteMany({});
  });
  after(async () => {
    // Close server
    await closeServer();
  });
  /**
   * ***********************************************************
   * **********************************************************
   * ***************REGISTER TESTS**************************
   * ********************************************************
   * ********************************************************
   */
  describe('Register_Tests', () => {
    it('Test_Register It should return 201 registered user object', async () => {
      // 1. Generate random valid user
      const genUser = unitTestBases.GenRandomValidUserWithPassword();

      // 2. Send request
      const res = await api.post(`${URL}/register`).send(genUser);

      // 3. Expect  results
      expect(res.status).toBe(201);
      const data = JSON.parse(res.text);

      expect(data).toHaveProperty('token'); // check for token

      const user = data.data.user;
      expect(user).toHaveProperty('_id');
    });
  });

  /**
   * ***********************************************************
   * **********************************************************
   * ********** LOGIN TESTS***********************************
   * ********************************************************
   * ********************************************************
   */
  describe('Login_Tests', () => {
    it('Test_Login It should return 400 if no email or password is provided', async () => {
      // 1. Send request
      const res = await api
        .post(`${URL}/login`)
        .send({ email: '', password: '' });

      // 2. Expect response
      expect(res.status).toBe(400);
    });

    it('Test_Login It should return 400 if no password is provided', async () => {
      // 1. Generate random email
      const email = GenRandVal.GenRandomValidEmail();

      // 2. Send request
      const res = await api.post(`${URL}/login`).send({ email });

      // 3. Expect response
      expect(res.status).toBe(400);
    });
    it('Test_Login It should return 400 if no email is provided', async () => {
      // 1. Generate random integer for password length
      const len = GenRandVal.GenRandomIntegerInRange(
        secretMinLength,
        secretMaxLength
      );

      // 2. Generate random string as password
      const password = GenRandVal.GenRandomValidString(len);

      // 3. Send request
      const res = await api.post(`${URL}/login`).send({ password });

      // 4. Expect response
      expect(res.status).toBe(400);
    });
    it('Test_Login It should return 401 if user is not found', async () => {
      // 1. Generate random integer for password length
      const len = GenRandVal.GenRandomIntegerInRange(
        secretMinLength,
        secretMaxLength
      );

      // 2. Generate random string as password
      const password = GenRandVal.GenRandomValidString(len);

      // 3. Generate random email
      const email = GenRandVal.GenRandomValidEmail();

      // 4. Send request
      const res = await api.post(`${URL}/login`).send({ email, password });

      // 5. Expect result
      expect(res.status).toBe(401);
    });
    it('Test_Login It should return 200 if the user is successfully login', async () => {
      // 1. Generate random user with password
      const genUser = UnitTestBases.GenRandomValidUserWithPassword();

      // 2. Create user
      await User.create(genUser);

      // 3. Send request
      const res = await api
        .post(`${URL}/login`)
        .send({ email: genUser.email, password: genUser.password });

      // 4. Expect result
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data).toHaveProperty('token');
      const user = data.data.user;
      expect(user).toHaveProperty('_id');
    });
  });
  describe('Protected_Tests', () => {
    it('Test_Protected It should return 401 if no authorization token is sent', async () => {
      // 1. Send request
      const res = await api.get(`${URL}`);

      // 2. Expect result
      expect(res.status).toBe(401);
    });
  });
});
