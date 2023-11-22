/**
 * @breif Method to handle socket io exceptions
 *  The returned function catches any errors that the promise may reject with and passes
 * them to the next function, which is an error-handling middleware function.
 * @param {function} fn Function
 */
export default (fn) => {
  return (socket, data, next) => {
    fn(socket, data, next).catch(next);
  };
};
