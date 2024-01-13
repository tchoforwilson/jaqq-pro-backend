import request from 'supertest';
import jwt from 'jsonwebtoken';

import server from '../server.js';
import User from '../models/user.model.js';
import unitTestBases from './utilities/unitTestBases.js';
import config from '../configurations/config.js';

export const api = request(server);

export const BASE_URL = config.prefix;

/**
 * Generate a sign token
 * @param {String} id -> Token payload
 * @returns Object
 */
const signToken = (id) =>
  jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

/**
 * @breif Create a random user
 * @returns {Object} User
 */
export const createUser = async () => {
  const user = unitTestBases.GenRandomValidUser();
  user.password = 'pass1234';
  user.passwordConfirm = 'pass1234';
  return await User.create(user);
};

/**
 * @breif Create an  admin user in the database
 * @returns {Object} User
 */
export const createAdminUser = async () => {
  const user = unitTestBases.GenRandomValidUser();
  user.role = 'Admin';
  user.password = 'pass1234';
  user.passwordConfirm = 'pass1234';
  return await User.create(user);
};

/**
 * Generate a new request header token, set the authorization to Bearer.
 * This header token is generated from the user id
 * @param {String} id Current user id
 * @returns {String} token
 */
export const getHeader = (id) => {
  const token = signToken(id);
  return 'Bearer ' + token;
};

/**
 * @breif Close server a
 */
export const closeServer = async () => {
  await server.close();
};
