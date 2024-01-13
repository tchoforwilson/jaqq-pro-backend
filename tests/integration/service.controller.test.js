import { expect } from 'expect';

import Service from '../../models/service.model.js';
import {
  api,
  createAdminUser,
  BASE_URL,
  getHeader,
  closeServer,
} from '../test.config.js';
import UnitTestBases from '../utilities/unitTestBases.js';
import GenRandomVal from '../utilities/genRandVal.js';

describe('ServiceController_Tests', () => {
  const MIN_LENGTH = 5;
  const MAX_LENGTH = 40;

  let user;
  let header;
  const URL = `${BASE_URL}/services`;

  before(async () => {
    // Delete all services
    await Service.deleteMany({});

    // Create a admin user
    user = await createAdminUser();

    // Get header
    header = getHeader(user._id);
  });

  afterEach(async () => {
    // Delete all categories
    await Service.deleteMany({});
  });

  after(async () => {
    // Close server
    closeServer();
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ***************GET ALL SERVICES TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}`, () => {
    it('Test_GetAllServices It should return 200 with no services', async () => {
      // 1. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 2. Expect result
      expect(res.status).toBe(200);
    });
    it('Test_GetAllServices It should return all services', async () => {
      // 1. Generate random services
      const genServices = UnitTestBases.GenRandomServices(
        GenRandomVal.GenRandomIntegerInRange(MIN_LENGTH, MAX_LENGTH)
      );

      // 2. Populate database with random services
      await Service.insertMany(genServices);

      // 3. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 4. Expect results
      expect(res.status).toBe(200);
      const services = JSON.parse(res.text).data;
      expect(services.length).toEqual(genServices.length);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *****************CREATE SERVICE TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`POST ${URL}`, () => {
    it('Test_CreateService It should return 201 for service successfully created', async () => {
      // 1. Generate random service
      const genService = UnitTestBases.GenRandomService();

      // 2. Send request
      const res = await api
        .post(`${URL}`)
        .set('Authorization', header)
        .send(genService);

      // 3. Expect result
      expect(res.status).toBe(201);
      const service = JSON.parse(res.text).data;

      // 4. Expect properties
      expect(service).toHaveProperty('_id');
      expect(service).toHaveProperty('label');
      expect(service.label).toBe(genService.label);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ************GET SERVICE BY ID SERVICE TESTS****************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}/:id`, () => {
    it('Test_GetServiceById It should return 404 for not found', async () => {
      // 1. Generate mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.get(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect results
      expect(res.status).toBe(404);
      const error = JSON.parse(res.text);
      expect(error).toHaveProperty('message');
    });
    it('Test_GetServiceById It should return the service with the id', async () => {
      // 1. Generate a random service
      const genService = UnitTestBases.GenRandomService();

      // 2. Create service in the database collection
      const randService = await Service.create(genService);

      // 3. Send request
      const res = await api
        .get(`${URL}/${randService.id}`)
        .set('Authorization', header);

      // 4. Expect results
      expect(res.status).toBe(200);
      const service = JSON.parse(res.text).data;
      expect(service.label).toBe(genService.label);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ******************UPDATE SERVICE TESTS*********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`PATCH ${URL}/:id`, () => {
    it('Test_UpdateService It should return 404 for service not found', async () => {
      // 1. Generate mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.patch(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect results
      expect(res.status).toBe(404);
      const error = JSON.parse(res.text);
      expect(error).toHaveProperty('message');
    });
    it('Test_UpdateService It should return 200 for service successfully updated', async () => {
      // 1. Generate a random service
      const genService = UnitTestBases.GenRandomService();

      // 2. Create service in the database collection
      const randService = await Service.create(genService);

      // 3. Generate update service
      const updateService = UnitTestBases.GenRandomService();

      // 4. Send request
      const res = await api
        .patch(`${URL}/${randService.id}`)
        .set('Authorization', header)
        .send(updateService);

      // 5. Expect results
      expect(res.status).toBe(200);
      const service = JSON.parse(res.text).data;
      expect(service.label).toBe(updateService.label);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ******************DELETE SERVICE TESTS*********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`DELETE ${URL}/:id`, () => {
    it('Test_DeleteService It should return 404 for service not found', async () => {
      // 1. Generate mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.delete(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect results
      expect(res.status).toBe(404);
      const error = JSON.parse(res.text);
      expect(error).toHaveProperty('message');
    });
    it('Test_DeleteService It should return 200 for service successfully deleted', async () => {
      // 1. Generate a random service
      const genService = UnitTestBases.GenRandomService();

      // 2. Create service in the database collection
      const randService = await Service.create(genService);

      // 3. Send request
      const res = await api
        .delete(`${URL}/${randService.id}`)
        .set('Authorization', header);

      // 4. Expect results
      expect(res.status).toBe(204);
    });
  });
});
