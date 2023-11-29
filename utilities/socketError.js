export default class SocketError extends Error {
  /**
   * @breif SocketError class constructor
   * @param {String} message Error message
   * @param {Number} code Error code
   */
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "SocketError";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
