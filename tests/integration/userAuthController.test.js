import { expect } from "expect";

import User from "../../models/userModel.js";
import GenRandVal from "../utilities/genRandVal.js";
import unitTestBases from "../utilities/unitTestBases.js";
import { api, closeServer, BASE_URL } from "../testConfig.js";
import UnitTestBases from "../utilities/unitTestBases.js";

const URL = `${BASE_URL}/users`;

const secretMinLength = 8;
const secretMaxLength = 16;

describe("UserAuthControllers_Tests", () => {
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
  describe("Register_Tests", () => {
    it("Test_Register It should return 201 registered user object", async () => {
      // 1. Generate random valid user
      const genUser = unitTestBases.GenRandomValidUserWithPassword();

      // 2. Send request
      const res = await api.post(`${URL}/register`).send(genUser);

      // 3. Expect  results
      expect(res.status).toBe(201);
      const data = JSON.parse(res.text);

      expect(data).toHaveProperty("token"); // check for token

      const member = data.data.member;
      expect(member).toHaveProperty("_id");
    });
  });

  /**
   * ***********************************************************
   * **********************************************************
   * ********** LOGIN TESTS***********************************
   * ********************************************************
   * ********************************************************
   */
  describe("Login_Tests", () => {
    it("Test_Login It should return 400 if no contact or password is provided", async () => {
      // 1. Send request
      const res = await api
        .post(`${URL}/login`)
        .send({ contact: "", password: "" });

      // 2. Expect response
      expect(res.status).toBe(400);
    });
    it("Test_Login It should return 400 if no password is provided", async () => {
      // 1. Generate random email
      const email = GenRandVal.GenRandomValidEmail();

      // 2. Generate random telephone
      const telephone = GenRandVal.GenRandomValidTelephone();

      // 3. Generate random Boolean
      const bRes = GenRandVal.GenRandomBoolean();

      // 4. Create contact
      const contact = bRes ? telephone : email;

      const res = await api.post(`${URL}/login`).send({ contact });
      expect(res.status).toBe(400);
    });
    it("Test_Login It should return 400 if no contact is provided", async () => {
      // 1. Generate random integer for password length
      const len = GenRandVal.GenRandomIntegerInRange(
        secretMinLength,
        secretMaxLength
      );

      // 2. Generate random string as password
      const password = GenRandVal.GenRandomValidString(len);

      const res = await api.post(`${URL}/login`).send({ password });
      expect(res.status).toBe(400);
    });
    it("Test_Login It should return 401 if no user is not found", async () => {
      // 1. Generate random integer for password length
      const len = GenRandVal.GenRandomIntegerInRange(
        secretMinLength,
        secretMaxLength
      );

      // 2. Generate random string as password
      const password = GenRandVal.GenRandomValidString(len);

      // 3. Generate random email
      const email = GenRandVal.GenRandomValidEmail();

      // 4. Generate random telephone
      const telephone = GenRandVal.GenRandomValidTelephone();

      // 5. Generate random boolean
      const bRes = GenRandVal.GenRandomBoolean();
      const contact = bRes ? telephone : email;

      // 6. Send request
      const res = await api.post(`${URL}/login`).send({ contact, password });

      // 7. Expect result
      expect(res.status).toBe(401);
    });
    it("Test_Login It should return 200 if the user is successfully login", async () => {
      // 1. Generate random user with password
      const user = UnitTestBases.GenRandomValidUserWithPassword();

      // 2. Create user
      await User.create(user);

      // 3. Generate random boolean
      const bRes = GenRandVal.GenRandomBoolean();
      const contact = bRes ? user.contact.telephone : user.email;

      // 4. Send request
      const res = await api
        .post(`${URL}/login`)
        .send({ contact, password: user.password });

      // 5. Expect result
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data).toHaveProperty("token");
      const member = data.data.member;
      expect(member).toHaveProperty("_id");
    });
  });
  describe("Protected_Tests", () => {
    it("Test_Protected It should return 401 if no authorization token is sent", async () => {
      // 1. Send request
      const res = await api.get(`${URL}`);

      // 2. Expect result
      expect(res.status).toBe(401);
    });
  });
});
