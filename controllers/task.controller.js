import cron from "node-cron";
import factory from "./handler.factory.js";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import eUserRole from "../utilities/enums/e.user-role.js";
import eTaskStatus from "../utilities/enums/e.task-status.js";
import catchAsync from "../utilities/catchAsync.js";

const setTaskUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Set a timeout to check for provider response
let tasksToReassign = [];
cron.schedule("*/5 * * * *", async () => {
  // 1. Get all assigned tasks
  const tasks = await Task.find({ status: "assigned" });

  // 2. Search for tasks assigned to providers
  for (const task of tasks) {
    const provider = await User.findOne({ _id: task.provider });
    if (!provider || !provider.online || provider.role !== eUserRole.PROVIDER) {
      // 3. Update task status
      task.status = eTaskStatus.PENDING;
      await Task.updateOne({ _id: task.id }, { status: eTaskStatus.PENDING });

      // 4. Emit response to user about task status
      // TODO: Use socket connection
      console.log(
        `Task ${task.id} status updated to unassigned, as provider didn't respond within 5 minutes.`
      );
      tasksToReassign.push(task);
    }
  }

  // 5. Reassign task to new providers
  if (tasksToReassign.length > 0) {
    for (const task of tasksToReassign) {
      const reassignResult = assignTaskToUser(task);
      console.log(`Task ${task.id} reassigned to user ${reassignResult.id}`);
    }
    tasksToReassign = [];
  }
});

/**
 * @breif Assigntask to provider who is online
 * @param {Object} task
 */
const assignedTaskToProvider = async (task) => {
  try {
    // 1. Search for online task providers
    const onlineUsers = await User.find({
      online: true,
      role: eUserRole.PROVIDER,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: task.location.coordinates },
          $maxDistance: 10000,
        },
      },
    });

    // 2. Check if any provider is available
    if (onlineUsers.length === 0) {
      // TODO: This should be a socket emitted response
      throw new Error(
        "No online providers found within 10 kilometers of the task location"
      );
    }
    // 2. Assigned task to provider who is online
    const closestUser = onlineUsers[0];

    // closestUser.tasks.push(task);
    task.provider = closestUser._id;
    task.status = eTaskStatus.ASSIGNED;
    //
    await task.save();
    // return closestUser;
  } catch (error) {
    console.log(error);
  }
};

const createTask = catchAsync(async (req, res, next) => {
  // 1. create Task
  const newTask = await Task.create(req.body);

  // 2. Assign task to provider
  await assignedTaskToProvider(newTask);

  // 3. Send back response to user
  res.status(201).json({
    status: "Success",
    message: "Task created successfully",
    data: newTask,
  });
});

export default {
  setTaskUserId,
  createTask,
  getAllTasks: factory.getAll(Task),
  getTask: factory.getOne(Task),
  updateTask: factory.updateOne(Task),
  deleteTask: factory.deleteOne(Task),
};
