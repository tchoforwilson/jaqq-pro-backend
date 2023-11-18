/**
 * @breif Filter out unwanted fields in an object
 * @param {Object} obj -> Provided object
 * @param  {...any} allowedFields -> Allowed fields array
 * @returns {Object}
 */
export const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
