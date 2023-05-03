import GenRandomVal from "./genRandVal.js";

const secretMinLength = 12;
const secretMaxLength = 12;
const smallMinLength = 5;
const smallMaxLength = 30;

class UnitTest {
  /**
   * Generate random valid user
   * @returns {Object} user
   */
  GenRandomValidUser() {
    const user = {
      firstName: GenRandomVal.GenRandomValidString(smallMaxLength),
      lastName: GenRandomVal.GenRandomValidString(smallMaxLength),
      gender: GenRandomVal.GenRandomValidGender(),
      contact: { telephone: GenRandomVal.GenRandomValidTelephone() },
      email: GenRandomVal.GenRandomValidEmail(),
      dateOfBirth: GenRandomVal.GenRandomValidDate(),
      photo: GenRandomVal.GenRandomValidPhoto(),
    };
    return user;
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
   * @breif Generate random valid Provider
   * @returns {Object}
   */
  GenRandomValidProvider() {
    return this.GenRandomValidUserWithPassword();
  }

  /**
   * @breif Generate random valid providers
   * @param {Number} max -> Maximum number of providers
   * @param {Array}
   */
  GenRandomValidProviders(max) {
    const providers = new Array(max);
    for (let i = 0; i < providers.length; i++) {
      providers.push(this.GenRandomValidProvider());
    }
    return providers;
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
   * @breif Generate random valid tasks
   * @param {Array} providerIds -> ID lists of task providers
   * @return {Object}
   */
  GenRandomValidTask(providerIds) {
    const task = {};
    task.label = GenRandomVal.GenRandomValidString(smallMaxLength);
    providerIds.forEach((el) => task.providers.push(el));
    return task;
  }
  /**
   * @breif Generate random invalid task
   * @param {Array} providerIds -> Provider Ids
   * @returns {Object}
   */
  GenRandomInvalidTask(providerIds) {
    const task = {};
    task.label = GenRandomVal.GenRandomInValidString(smallMaxLength);
    providerIds.forEach((el) => task.providers.push(el));
    return task;
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
