import factory from "./handler.factory.js";
import Task from "../models/task.model.js";

/**
 * @breif Set user id when creating a new task
 * if it doesn't exist
 */
const setTaskUserIds = (req, res, next) => {
  if (req.body.userId) req.body.userId = req.user.id;
  next();
};

export default {
  setTaskUserIds,
  createTask: factory.createOne(Task),
  getTask: factory.getOne(Task, {
    path: "users",
    select: "-__v -passwordChangedAt",
  }),
  getAllTasks: factory.getAll(Task),
  updateTask: factory.updateOne(Task),
  deleteTask: factory.deleteOne(Task),
  countTasks: factory.count(Task),
  searchTask: factory.search(Task),
};
