import factory from "./handler.factory.js";
import Task from "../models/task.model.js";

const setTaskUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export default {
  setTaskUserId,
  createTask: factory.createOne(Task),
  getAllTasks: factory.getAll(Task),
  getTask: factory.getOne(Task),
  updateTask: factory.updateOne(Task),
  deleteTask: factory.deleteOne(Task),
};
