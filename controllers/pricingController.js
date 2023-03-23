import Pricing from '../models/pricingModel.js';
import * as factory from './handlerFactory.js';

export const setProviderTaskIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.provider) req.body.provider = req.params.providerId;
  if (!req.body.task) req.body.task = req.params.taskId;
  next();
};

export const createPricing = factory.createOne(Pricing);
export const getPricing = factory.getOne(Pricing);
export const getAllPricings = factory.getAll(Pricing);
export const updatePricing = factory.updateOne(Pricing);
export const deletePricing = factory.deleteOne(Pricing);
