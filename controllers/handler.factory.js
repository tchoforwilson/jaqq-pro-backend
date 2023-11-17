import APIFeatures from "../utilities/apiFeatures.js";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";

/**
 * @breif Create a new document in a database collection
 * @param {Collection} Model -> Database collection
 * @returns {Function}
 */
const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(eStatusCode.CREATED).json({
      status: "success",
      data: doc,
    });
  });

/**
 * @breif Get a single document in the database collection
 * using the parameter request id
 * @param {Collection} Model -> Database collection
 * @param {String} popOptions -> Populate option for other collection
 * @returns {Function}
 */
const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = await Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc)
      return next(
        new AppError("No document found with that ID!", eStatusCode.NOT_FOUND)
      );

    res.status(eStatusCode.SUCCESS).json({
      status: "success",
      data: doc,
    });
  });

/**
 * @breif Update a single a documnent in the collection, from the
 * request paramter id
 * @param {Collection} Model -> Database collection
 * @returns {Function}
 */
const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(
        new AppError("No document found with that ID!", eStatusCode.NOT_FOUND)
      );

    res.status(eStatusCode.SUCCESS).json({
      status: "success",
      data: doc,
    });
  });

/**
 * @breif Retrieve all document from a collection, documents are filtered, sorted,
 * limited and paginated
 * @param {Collection} Model -> Database collection
 * @returns {Function}
 */
const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET tasks & provider on pricing
    let filter = {};
    if (req.params.taskId) filter = { task: req.params.taskId };
    if (req.params.providerId) filter = { provider: req.params.providerId };

    // EXECUTE THE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    // SEND RESPONSE
    res.status(eStatusCode.SUCCESS).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

/**
 * @breif Delete a single document in the database collection
 * @param {Collection} Model -> Database collection
 * @returns {Function}
 */
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError("No document found with that ID", eStatusCode.NOT_FOUND)
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

export default {
  createOne,
  getOne,
  updateOne,
  getAll,
  deleteOne,
};
