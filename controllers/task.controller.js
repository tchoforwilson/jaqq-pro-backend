import cron from 'node-cron';
import { io } from '../app.js';
import factory from './handler.factory.js';
import User from '../models/user.model.js';
import Task from '../models/task.model.js';
import eUserRole from '../utilities/enums/e.user-role.js';
import eTaskStatus from '../utilities/enums/e.task-status.js';
import catchAsync from '../utilities/catchAsync.js';
import AppError from '../utilities/appError.js';
import {
  CONST_ONEU,
  CONST_ZEROU,
  MAX_PROVIDER_DISTANCE,
} from '../utilities/constants/index.js';

const setTaskUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

const reassignTasks = async () => {
  // 1. Get all taskes with pending status
  const tasks = await Task.find({ status: eTaskStatus.PENDING });

  // 2. If there are any tasks, reassign them
  if (tasks.length > CONST_ZEROU) {
    for (const task of tasks) {
      await assignedTaskToProvider(task);
      io.emit('task:reassign', {
        data: task,
        message: `Task ${task.service.label} reassigned to user ${task.user.firstName}`,
      });
    }
  }
};

// Set a timeout to check for provider response
let tasksToReassign = [];
cron.schedule(
  '*/2 * * * *',
  catchAsync(async () => {
    // 1. Get all assigned tasks
    const assignedTasks = await Task.find({ status: eTaskStatus.ASSIGNED });

    // 2. Search for tasks assigned to providers
    for (const assignTask of assignedTasks) {
      const assignedProvider = await User.findOne({ _id: assignTask.provider });
      if (
        !assignedProvider ||
        !assignedProvider.online ||
        assignedProvider.role !== eUserRole.PROVIDER
      ) {
        // 3. Update task status
        assignTask.status = eTaskStatus.PENDING;
        await Task.updateOne(
          { _id: assignTask.id },
          { provider: null, status: eTaskStatus.PENDING }
        );

        // 4. Emit response to user about task status
        io.emit('task:unassigned', {
          data: assignTask,
          message: `Task ${assignTask.service.label} status updated to unassigned, as provider didn't respond within 5 minutes.`,
        });
        tasksToReassign.push(assignTask);
      }
      return;
    }

    // 5. Reassign task to new provider
    await reassignTasks();
  })
);

/**
 * @breif Assigntask to provider who is online
 * @param {Object} task
 */
const assignedTaskToProvider = async (task) => {
  // 1. Search for online task providers
  const onlineUsers = await User.find({
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

  // 2. Check if any provider is available
  if (onlineUsers.length === CONST_ZEROU) {
    io.emit('error:no-provider', { message: 'No provider available' });
    return;
  }

  // 3. Assigned task to provider who is online
  const closestUser = onlineUsers[CONST_ZEROU];

  // 4. Update task provider and status
  task.provider = closestUser._id;
  task.status = eTaskStatus.ASSIGNED;

  // 5. Save updated task
  await task.save();
};

/**
 * @breif Create a new task
 */
const createTask = catchAsync(async (req, res, next) => {
  // 1. create Task
  const newTask = await Task.create(req.body);

  // 2. Assign task to provider
  await assignedTaskToProvider(newTask);

  // 3. Send back response to user
  res.status(201).json({
    status: 'Success',
    message: 'Task created successfully',
    data: newTask,
  });
});

/**
 * @breif Change task status
 */
const toggleTaskStatus = catchAsync(async (req, res, next) => {
  // 1. Get the task
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    return next(
      new AppError(
        `Task with ID ${req.params.id} not found`,
        eStatusCode.NOT_FOUND
      )
    );
  }

  const { status } = req.body;
  task.status = status;
  // Provider rejects task
  if (status === eTaskStatus.REJECTED) {
    if (!task.prevProviders.includes(req.user._id)) {
      task.prevProviders.push(req.user.id);
    }
    task.provider = null;
    io.emit('task:rejected', {
      data: task,
      message: `Provider ${req.user.firstname} rejects task`,
    });
  }

  // Provider accepts task
  if (status === eTaskStatus.ACCEPTED) {
    const providerExist =
      task.prevProviders && task.prevProviders.indexOf(req.user._id);

    if (providerExist && providerExist >= CONST_ZEROU) {
      console.log(providerExist);
      task.prevProviders.splice(providerExist, CONST_ONEU);
    }
    task.provider = req.user._id;

    io.emit('task:accepted', { data: task });
  }

  await task.save();

  res.status(200).json({
    status: 'success',
    data: task,
  });
});

export default {
  setTaskUserId,
  createTask,
  toggleTaskStatus,
  getAllTasks: factory.getAll(Task),
  getTask: factory.getOne(Task),
  updateTask: factory.updateOne(Task),
  deleteTask: factory.deleteOne(Task),
};
