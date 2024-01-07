/**
 * @breif Method to handle asynchronous sockets error exceptions
 * @param {function} fn -> function
 */
export default (fn) => {
  return (socket, next) => {
    fn(socket, next).catch(next);
  };
};
