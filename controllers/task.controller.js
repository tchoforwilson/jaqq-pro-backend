import factory from './handler.factory.js';
import Task from '../models/task.model.js';

export default {
  createTask: factory.createOne(Task),
  getTask: factory.getOne(Task, {
    path: 'providers',
    select: '-__v -passwordChangedAt',
  }),
  getAllTasks: factory.getAll(Task),
  updateTask: factory.updateOne(Task),
  deleteTask: factory.deleteOne(Task),
};
