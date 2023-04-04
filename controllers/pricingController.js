import Pricing from '../models/pricingModel.js';
import factory from './handlerFactory.js';

export default {
  setProviderTaskIds: (req, res, next) => {
    // Allow nested routes
    if (!req.body.provider) req.body.provider = req.params.providerId;
    if (!req.body.task) req.body.task = req.params.taskId;
    next();
  },

  createPricing: factory.createOne(Pricing),
  getPricing: factory.getOne(Pricing),
  getAllPricings: factory.getAll(Pricing),
  updatePricing: factory.updateOne(Pricing),
  deletePricing: factory.deleteOne(Pricing),
};
