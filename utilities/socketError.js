/**
 * @breif Class to handle Applications errors,
 * @details Set the error message and status code
 */
export default class SocketError extends Error {
  /**
   * @brief Constructor for socket error
   * @param {String} message -> Error message
   */
  constructor(message) {
    super(message);

    this.type = 'socket';
    this.status = `${type}`.startsWith('socket') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
