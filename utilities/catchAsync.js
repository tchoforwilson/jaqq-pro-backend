/**
 * @breif Method to handle asynchronous error exceptions
 * @param {function} fn -> function
 */
export default (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
