import cron from 'node-cron';
import { io } from '../app.js';
import factory from './handler.factory.js';
import User from '../models/user.model.js';
import Task from '../models/task.model.js';
import eUserRole from '../utilities/enums/e.user-role.js';
import eTaskStatus from '../utilities/enums/e.task-status.js';
import handleAsync from '../utilities/errors/handleAsync.js';
import catchAsync from '../utilities/catchAsync.js';
import AppError from '../utilities/appError.js';
import {
  CONST_ONEU,
  CONST_ZEROU,
  MAX_PROVIDER_DISTANCE,
} from '../utilities/constants/index.js';
import eStatusCode from '../utilities/enums/e.status-code.js';

/**
 * @breif Set task user id
 */
const setTaskUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

/**
 * @breif Reassign all pending tasks
 */
const reassignTasks = handleAsync(async () => {
  // 1. Get all taskes with pending status
  const tasks = await Task.find({ status: eTaskStatus.PENDING });

  // 2. If there are any tasks, assign them
  if (tasks.length > CONST_ZEROU) {
    for (const task of tasks) {
      assignedTaskToProvider(task);
    }
  }
});

// Set a timeout to check for provider response
cron.schedule(
  '*/2 * * * *',
  handleAsync(async () => {
    // 1. Assign all pending tasks
    reassignTasks();

    // 2. Get all assigned tasks
    const assignedTasks = await Task.find({ status: eTaskStatus.ASSIGNED });

    // 3. Search for tasks assigned to providers
    for (const assignTask of assignedTasks) {
      const assignedProvider = await User.findOne({ _id: assignTask.provider });
      if (
        !assignedProvider ||
        !assignedProvider.online ||
        assignedProvider.role !== eUserRole.PROVIDER
      ) {
        // await assignTask.save({ validateBeforeSave: false }); TODO: Check if this works properly
        // 4. Update task status
        const unAssignTask = await Task.findByIdAndUpdate(assignTask.id, {
          provider: null,
          status: eTaskStatus.PENDING,
        });

        // 5. Emit response to user about task status
        io.emit('task:unassigned', {
          data: unAssignTask,
          message: `Task ${assignTask.service.label} status updated to unassigned, as provider didn't respond within 5 minutes.`,
        });
      }
    }
  })
);

/**
 * @breif Assigntask to provider who is online
 * @param {Object} task
 */
const assignedTaskToProvider = handleAsync(async (task) => {
  // 1. Search for online service providers
  const providers = await User.find({
    online: true,
    role: eUserRole.PROVIDER,
    services: { $in: [task.service] },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: task.location.coordinates },
        $maxDistance: MAX_PROVIDER_DISTANCE,
      },
    },
  });

  // 2. Assign the task to a provider if found
  if (providers.length > CONST_ZEROU) {
    task.provider = providers[CONST_ZEROU].id;
    task.status = eTaskStatus.ASSIGNED;

    // 3. Save updated task
    await task.save();

    // 4. Emit message
    io.emit('task:assigned', { message: 'Task assigned!', data: task });
  } else {
    io.emit('task:no-provider', { message: 'No provider found yet!' });
  }
});

/**
 * @breif Create a new task
 */
const createTask = catchAsync(async (req, res, next) => {
  // 1. create Task
  const newTask = await Task.create(req.body);

  // 2. Assign task to provider
  assignedTaskToProvider(newTask)(next);

  // 3. Send back response to user
  res.status(201).json({
    status: 'Success',
    message: 'Task created successfully',
    data: newTask,
  });
});

const checkIfTaskExists = catchAsync(async (req, res, next) => {
  // 1. Get the task
  const task = await Task.findById(req.params.id);
  // 2. Check task exists
  if (!task) return next(new AppError('Task not found', eStatusCode.NOT_FOUND));
  // 3. next
  req.task = task;
  next();
});

const setInProgress = catchAsync(async (req, res, next) => {
  // 1. Get task
  const task = req.task;

  // 2. Check if user location and task are same
  const result = await task.atTaskLocation(req.user.currentLocation);
  if (!result) {
    return next(
      new AppError('Your are not yet close to task', eStatusCode.BAD_REQUEST)
    );
  }

  // 3. Update task by setting to in progess
  const updatedTask = await Task.findByIdAndUpdate(task._id, {
    status: eTaskStatus.PROGRESS,
  });

  // 4. Emit to user
  io.emit('task:in-progress', {
    message: 'Task set to in progess',
    data: updatedTask,
  });

  res.status(200).json({
    status: 'success',
    message: 'Task updated successfully to in progress',
    data: updatedTask,
  });
});

const setTaskReady = catchAsync(async (req, res, next) => {
  // 1. Get task
  const task = req.task;

  // 2. Update task status
  const updatedTask = await Task.findByIdAndUpdate(task._id, {
    status: eTaskStatus.READY,
  });

  // 3. Send response
  // a. To user
  io.emit('task:ready', { data: updatedTask, message: 'Task is ready!' });
  // b.To Provider
  res.status(200).json({
    status: 'success',
    message: 'Task set to ready!',
    data: updatedTask,
  });
});

const setTaskApproved = catchAsync(async (req, res, next) => {
  // 1. Get task
  const task = req.task;

  // 2. Update task status
  const updatedTask = await Task.findByIdAndUpdate(task._id, {
    status: eTaskStatus.APPROVED,
  });

  // 4. Move payment to user account

  // 4. Send response
  // a. To user
  io.emit('task:approved', { data: updatedTask, message: 'Task approved!' });
  // b.To Provider
  res.status(200).json({
    status: 'success',
    message: 'Task is approved!',
    data: updatedTask,
  });
});

const setTaskCancell = catchAsync(async (req, res, next) => {
  // 1. Get task
  const task = req.task;

  // 2. Check if task is in progress
  if (task.status === eTaskStatus.PROGRESS) {
    return next(
      new AppError(
        'Task is already in progress, cannot be cancelled',
        eStatusCode.BAD_REQUEST
      )
    );
  }

  // 3. Update task status
  const updatedTask = await Task.findByIdAndUpdate(task._id, {
    status: eTaskStatus.CANCELLED,
  });

  // 4. Deduce from customer account

  // 4. Send response
  // a. To user
  io.emit('task:cancelled', { data: updatedTask, message: 'Task cancelled!' });

  // b.To Provider
  res.status(200).json({
    status: 'success',
    message: 'Task is cancelled!',
    data: updatedTask,
  });
});

/**
 * @breif Change task status
 */
const toggleTaskStatus = catchAsync(async (req, res, next) => {
  // 1. Get task
  const task = req.task;

  const { status } = req.body; // get new status
  task.status = status;

  // 3. Update task base on status
  switch (status) {
    // Provider rejects task
    case status === eTaskStatus.REJECTED:
      if (!task.prevProviders.includes(req.user._id)) {
        task.prevProviders.push(req.user.id);
      }
      task.provider = null;
      io.emit('task:rejected', {
        data: task,
        message: 'Provider rejects task',
      });
      break;
    // Provider accepts task
    case status === eTaskStatus.ACCEPTED:
      const providerExist =
        task.prevProviders && task.prevProviders.indexOf(req.user._id);

      if (providerExist && providerExist >= CONST_ZEROU) {
        task.prevProviders.splice(providerExist, CONST_ONEU);
      }
      task.provider = req.user._id;

      io.emit('task:accepted', {
        data: task,
        message: 'Provider accepts to do task',
      });
      break;
    // Provider starts task
    case status === eTaskStatus.PROGRESS:
      io.emit('task:in-progress', { data: task, message: 'Task in progress!' });
      break;
    default:
      await task.save();
  }

  // 4. Save new task status
  await task.save();

  // 5. Send response
  res.status(200).json({
    status: 'success',
    data: task,
  });
});

/**
 * @breif Delete task from current task list
 */
const deleteTask = catchAsync(async (req, res, next) => {
  // 1. Get task
  const task = req.task;

  // 2. Find task and delete
  await Task.findByIdAndDelete(task.id);

  // 3. Notify the provider
  io.emit('task:deleted', {
    data: task,
    message: `This task has been deleted!`,
  });

  // 4. Send response
  res.status(204).json({
    status: 'success',
    message: 'Task has been deleted!',
    data: null,
  });
});

export default {
  setTaskUserId,
  checkIfTaskExists,
  createTask,
  setInProgress,
  setTaskReady,
  setTaskApproved,
  setTaskCancell,
  toggleTaskStatus,
  getAllTasks: factory.getAll(Task),
  getTask: factory.getOne(Task),
  updateTask: factory.updateOne(Task),
  deleteTask,
};
