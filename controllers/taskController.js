'use strict';
import * as factory from './handlerFactory.js';
import Task from '../models/taskModel.js';

export const createTask = factory.createOne(Task);
export const getTask = factory.getOne(Task);
export const getAllTasks = factory.getAll(Task);
export const updateTask = factory.updateOne(Task);
export const deleteTask = factory.deleteOne(Task);
