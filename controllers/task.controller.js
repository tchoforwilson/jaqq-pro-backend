import cron from 'node-cron';
import { io } from '../app.js';
import factory from './handler.factory.js';
import User from '../models/user.model.js';
import Task from '../models/task.model.js';
import eUserRole from '../utilities/enums/e.user-role.js';
import eTaskStatus from '../utilities/enums/e.task-status.js';
import catchAsync from '../utilities/catchAsync.js';
import {
  CONST_ZEROU,
  MAX_PROVIDER_DISTANCE,
} from '../utilities/constants/index.js';

/**
 * @breif Set task user id
 */
const setTaskUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

/**
 * @breif Assigntask to provider who is online
 * @param {Object} task
 */
const assignedTaskToProvider = async (task) => {
  try {
    // 1. Search for online service providers
    const providers = await User.aggregate([
      {
        $geoNear: {
          key: 'location',
          near: {
            type: 'Point',
            coordinates: [
              task.location.coordinates[0],
              task.location.coordinates[1],
            ],
          },
          distanceField: 'distance',
          maxDistance: MAX_PROVIDER_DISTANCE,
          spherical: true,
        },
      },
      {
        $match: {
          online: true,
          role: eUserRole.PROVIDER,
          services: { $in: [task.service._id] },
        },
      },
      {
        $project: {
          distance: 1,
        },
      },
    ]);

    // 2. Assign the task to a provider if found
    if (providers.length > CONST_ZEROU) {
      task.provider = providers[CONST_ZEROU]._id;
      task.status = eTaskStatus.ASSIGNED;

      // 3. Save updated task
      await task.save();

      // 4. Emit message
      io.emit('task:assigned', { message: 'Task assigned!', data: task });
    } else {
      io.emit('task:no-provider', { message: 'No provider found yet!' });
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * @breif Reassign all pending tasks
 */
const reassignTasks = async () => {
  try {
    // 1. Get all taskes with pending status
    const tasks = await Task.find({ status: eTaskStatus.PENDING }).select(
      'status location'
    );

    // 2. If there are any tasks, assign them
    if (tasks.length > CONST_ZEROU) {
      for (const task of tasks) {
        assignedTaskToProvider(task);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// Set a timeout to check for provider response
cron.schedule('*/2 * * * *', async () => {
  try {
    await reassignTasks();

    const assignedTasks = await Task.find({
      status: eTaskStatus.ASSIGNED,
    })
      .select('status location user')
      .populate('provider'); // Populate the provider field

    for (const assignTask of assignedTasks) {
      const assignedProvider = assignTask.provider;

      if (
        !assignedProvider ||
        !assignedProvider.online ||
        assignedProvider.role !== eUserRole.PROVIDER
      ) {
        // Update task status
        await Task.findByIdAndUpdate(assignTask._id, {
          provider: null,
          status: eTaskStatus.PENDING,
          $addToSet: {
            prevProviders: assignedProvider._id,
          },
        });

        // Emit response to user
        io.emit('task:unassigned', {
          data: assignTask,
          message: `Task ${assignTask.service.title} status updated to unassigned.`,
        });
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

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
  createTask,
  getAllTasks: factory.getAll(Task),
  getTask: factory.getOne(Task),
  updateTask: factory.updateOne(Task),
  deleteTask,
};
