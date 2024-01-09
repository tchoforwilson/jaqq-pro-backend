/**
 * @breif Method to handle asynchronous error exceptions
 * for none request response methods
 * @param {Function} fn -> function
 */
export default (fn) => {
  return (...args) => {
    return (next) => {
      fn(...args).catch(next);
    };
  };
};
