/**
 * @breif Filter out unwanted fields in an object
 * @param {Object} obj -> Provided object
 * @param  {...any} allowedFields -> Allowed fields array
 * @returns {Object}
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * @breif A pretty old plugin to reload database schema
 * document record. This method reload the document so that
 * the fields have the values assigned to the document.
 * @param {Schema} schema -> document schema
 * @return {Object}
 */
const reloadRecord = (schema) => {
  schema.methods.reload = async function () {
    const record = await this.constructor.findById(this);
    Object.assign(this, record);
    return record;
  };
};

export default {
  filterObj,
  reloadRecord,
};
