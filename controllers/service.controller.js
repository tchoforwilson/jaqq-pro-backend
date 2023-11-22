import factory from "./handler.factory.js";
import Service from "../models/service.model.js";

/**
 * @breif Controllers of services model
 */
export default {
  createService: factory.createOne(Service),
  getAllServices: factory.getAll(Service),
  updateService: factory.updateOne(Service),
  getService: factory.getOne(Service),
  deleteService: factory.deleteOne(Service),
  countServices: factory.count(Service),
};
