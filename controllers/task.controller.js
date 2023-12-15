import cron from "node-cron";
import { io } from "../app.js";
import factory from "./handler.factory.js";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import eUserRole from "../utilities/enums/e.user-role.js";
import eTaskStatus from "../utilities/enums/e.task-status.js";
import catchAsync from "../utilities/catchAsync.js";
import {
  CONST_ZEROU,
  MAX_PROVIDER_DISTANCE,
} from "../utilities/constants/index.js";

const setTaskUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// const reassignTaskUser = catchAsync(async() => {
//   // 1. Get all taskes with pending status
//   const tasks = await Task.find({ status: eTaskStatus.PENDING });

// })

// Set a timeout to check for provider response
let tasksToReassign = [];
cron.schedule(
  "*/5 * * * *",
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
          { status: eTaskStatus.PENDING }
        );

        // 4. Emit response to user about task status
        io.emit("task:unassigned", {
          data: assignTask,
          message: `Task ${assignTask.service.label} status updated to unassigned, as provider didn't respond within 5 minutes.`,
        });
        tasksToReassign.push(assignTask);
      }
      return;
    }

    // 5. Reassign task to new provider
    if (tasksToReassign.length > CONST_ZEROU) {
      for (const task of tasksToReassign) {
        const reassignResult = assignTaskToUser(task);
        io.emit("task:reassign", {
          data: reassignResult,
          message: `Task ${task.service.label} reassigned to user ${reassignResult.name}`,
        });
      }
      tasksToReassign = [];
      return;
    }
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
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: task.location.coordinates },
        $maxDistance: MAX_PROVIDER_DISTANCE,
      },
    },
  });

  // 2. Check if any provider is available
  if (onlineUsers.length === CONST_ZEROU) {
    io.emit("error:no-provider", { message: "No provider available" });
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
