import Pricing from "../models/pricing.model.js";
import factory from "./handler.factory.js";

export default {
  setProviderTaskIds: (req, res, next) => {
    // Allow nested routes
    // TODO: Look for a means to add providers
    if (!req.body.task) req.body.task = req.params.taskId;
    next();
  },

  createPricing: factory.createOne(Pricing),
  getPricing: factory.getOne(Pricing, { path: "Task" }),
  getAllPricings: factory.getAll(Pricing),
  updatePricing: factory.updateOne(Pricing),
  deletePricing: factory.deleteOne(Pricing),
  countPricing: factory.count(Pricing),
};
