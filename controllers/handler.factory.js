import APIFeatures from "../utilities/apiFeatures.js";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";
import eStatusCode from "../utilities/enums/e.status-code.js";

/**
 * @breif Create a new document in a database collection
 * @param {Collection} Model -> Database collection
 * @returns {Function}
 */
const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Create a new item
    const doc = await Model.create(req.body);

    // 2. Send response
    res.status(eStatusCode.CREATED).json({
      status: "success",
      message: "Successfully created",
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
    // 1. Get doc by id
    let query = await Model.findById(req.params.id);

    // 2. Populate
    if (popOptions) query = query.populate(popOptions);

    // 3. Perform query
    const doc = await query;

    // 4. Check if item exists
    if (!doc)
      return next(
        new AppError("document not found with that ID!", eStatusCode.NOT_FOUND)
      );

    // 5. Send response
    res.status(eStatusCode.SUCCESS).json({
      status: "success",
      message: "Data receive successfully",
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
    // 1. Get item by id and update
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // 2. Check if item exists
    if (!doc)
      return next(
        new AppError("No document found with that ID!", eStatusCode.NOT_FOUND)
      );

    // 3. Send response
    res.status(eStatusCode.SUCCESS).json({
      status: "success",
      message: "Successfully updated",
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
    // 1. To allow for nested GET routes
    let filter = {};

    if (req.params.serviceId) filter = { service: req.params.serviceId };
    if (req.params.userId) filter = { user: req.params.userId };
    if (req.params.taskId) filter = { task: req.params.taskId };
    if (req.params.pricingId) filter = { pricing: req.params.pricingId };

    // 2. Build api query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // 3. EXECUTE THE QUERY
    const docs = await features.query;

    // 4. SEND RESPONSE
    res.status(eStatusCode.SUCCESS).json({
      status: "success",
      results: docs.length,
      data: docs,
    });
  });

/**
 * @breif Delete a single document in the database collection
 * @param {Collection} Model -> Database collection
 * @returns function
 */
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Get item
    const doc = await Model.findByIdAndDelete(req.params.id);

    // 2. Check if item exists
    if (!doc) {
      return next(
        new AppError("No document found with that ID", eStatusCode.NOT_FOUND)
      );
    }

    // 3. Send response
    res.status(eStatusCode.NO_CONTENT).json({
      status: "success",
      message: "Successfully deleted",
      data: null,
    });
  });

/**
 * @breif Search for documents marching request name
 * @param {Collection} Model Database collection/model
 * @returns {function}
 */
const search = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Get the query
    const { q } = req.query;

    // 2. Get the results
    const results = await Model.find({
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { label: { $regex: q, $options: "i" } },
      ],
    });

    // 3. Send the response
    res.status(200).json({
      status: "success",
      data: results,
    });
  });

/**
 * @brief Count the number of document in a collection
 * @param {Collection} Model  Database model/collection
 * @returns {Function}
 */
const count = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Build filter
    let filtered = {};
    if (req.params.userId) filtered.category = req.params.userId;
    if (req.params.taskId) filtered.store = req.params.taskId;
    if (req.params.pricingId) filtered.product = req.params.pricingId;

    // 2. Create search query
    const searchQuery = { ...filtered, ...req.query };

    // 3. Execute query
    const count = await Model.count(searchQuery);

    // 4. Send response
    res.status(200).json({
      status: "success",
      data: count,
    });
  });

export default {
  createOne,
  getOne,
  updateOne,
  getAll,
  deleteOne,
  search,
  count,
};
