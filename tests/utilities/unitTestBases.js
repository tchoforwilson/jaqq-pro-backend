import GenRandomVal from './genRandVal.js';

const secretMinLength = 8;
const secretMaxLength = 12;
const smallMinLength = 10;
const smallMaxLength = 30;

class UnitTest {
  /**
   * @breif Generates a random service
   * @returns {String}
   */
  GenRandomService() {
    return { label: GenRandomVal.GenRandomValidString(smallMaxLength) };
  }

  /**
   * @breif Generates a random number of services
   * @param {Number} count Number of services to generate
   * @returns {Array<String>}
   */
  GenRandomServices(count) {
    let services = [];
    for (let i = 0; i < count; i++) {
      services[i] = this.GenRandomService();
    }
    return services;
  }
  /**
   * Generate random valid user
   * @returns {Object} user
   */
  GenRandomValidUser() {
    return {
      firstname: GenRandomVal.GenRandomValidString(smallMaxLength),
      lastname: GenRandomVal.GenRandomValidString(smallMaxLength),
      gender: GenRandomVal.GenRandomValidGender(),
      email: GenRandomVal.GenRandomValidEmail(),
      role: GenRandomVal.GenRandomValidUserRole(),
    };
  }

  /**
   * @breif Generate random valid user with password
   * @returns {Object} user Generated user
   */
  GenRandomValidUserWithPassword() {
    const password = GenRandomVal.GenRandomValidStringInRange(
      secretMinLength,
      secretMaxLength
    );
    const user = this.GenRandomValidUser();
    Object.assign(user, { password, passwordConfirm: password });
    return user;
  }

  /**
   * Generate valid users
   * @param {Number} max -> Maximum number of user to be generated
   * @returns {Array} users -> Generated users
   */
  GenRandValidUsers(max) {
    const users = [];
    for (let i = 0; i < max; i++) {
      users.push(this.GenRandomValidUser());
    }
    return users;
  }
  /**
   * @breif Generate a random valid task
   * @param {Array} serviceId Task service id
   * @return {Object}
   */
  GenRandomValidTask(serviceId) {
    return {
      label: GenRandomVal.GenRandomValidString(smallMaxLength),
      service: serviceId,
    };
  }

  /**
   * @breif Generate a random array of tasks
   * @param {Array<String>} serviceIds
   * @param {Number} len
   * @returns {Array<Object>}
   */
  GenRandomValidTasks(serviceIds, len) {
    let tasks = [];
    for (let i = 0; i < len; i++) {
      this.GenRandomValidTask(serviceIds[i]);
    }
    return tasks;
  }

  /**
   * @breif Generate random valid pricing
   * @param {String} providerId -> Provider Id
   * @param {String} taskId -> Task id
   * @returns {Object}
   */
  GenRandomValidPricing(providerId, taskId) {
    const pricing = {};
    pricing.minPrice = GenRandomVal.GenRandomPrice();
    pricing.provider = providerId;
    pricing.task = taskId;
    return pricing;
  }
}

const UnitTestBases = new UnitTest();

export default UnitTestBases;
