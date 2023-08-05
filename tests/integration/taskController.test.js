import { expect } from "expect";

import User from "../../models/userModel.js";
import { api, createUser, BASE_URL, getHeader } from "../testConfig.js";

describe("TaskController_Tests", () => {
  let user;
  let header;
  const URL = `${BASE_URL}/tasks`;

  before(async () => {
    user = await createUser();
    header = getHeader(user);
  });
  after(async () => {
    await User.deleteMany({});
  });

  describe(`GET ${URL}`, () => {
    it("Test_GetAllTasks It should return 404 for not found", async () => {
      // 1. Send request
      const res = await api.get(`${URL}`).set("Authorization", header);

      // 2. Expect result
      expect(res.status).toBe(404);
    });
  });
});
