import jwt from "jsonwebtoken";
import { promisify } from "util";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import APIFeatures from "../utilities/apiFeatures.js";
import catchSocket from "../utilities/catchSocket.js";
import SocketError from "../utilities/socketError.js";
import eTaskStatus from "../utilities/enums/e.task-status.js";

const protect = catchSocket(async (socket, next) => {
  // 1. Get token
  let token;
  console.log(socket);
  if (
    socket.handshake.authorization.token &&
    socket.handshake.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new SocketError(
        "You are not logged in! Please log in to get access.",
        400
      )
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

  // 3) Check if user still exists
  const currentuser = await User.findById(decoded.user._id);

  if (!currentuser) {
    return next(
      new SocketError(
        "The user belonging to this token does no longer exist.",
        eStatusCode.FORBIDDEN
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentuser.changedPasswordAfter(decoded.iat)) {
    return next(
      new SocketError(
        "User recently changed password! Please log in again.",
        eStatusCode.FORBIDDEN
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  socket.user = currentuser;
  next();
});

/**
 * @breif Middleware to restrict route access only to user of
 * a particular role
 * @param  {...any} roles -> User roles
 * @returns {Function}
 */
const restrictTo = (...roles) => {
  return (socket, next) => {
    // roles ['admin', 'user','provider']. role='user'
    if (!roles.includes(socket.user.role)) {
      return next(
        new SocketError(
          "You do not have permission to perform this action",
          403
        )
      );
    }

    next();
  };
};

/**
 * @breif Set user id when creating a new task
 * if it doesn't exist
 */
const setTaskUser = (socket, data, next) => {
  if (!data.user) data.user = socket.user;
  next();
};

const createTask = catchSocket(async (socket, data) => {
  console.log(data);
  // 1. Create a new task
  const newTask = await Task.create(data);

  // 2. Find providers who are online and their location is close to the task's location
  const providers = await User.find({
    role: "provider",
    online: true,
    location: { $near: [newTask.location] },
  });

  // 3. Assign the task to a provider if found
  if (providers.length > 0) {
    newTask.assignee = providers[0].id;
    newTask.status = eTaskStatus.ASSIGNED;

    await newTask.save();

    socket.emit("Task:Assigned", newTask);
  }

  socket.emit("Task:Created", newTask);
});

const getAllTasks = catchSocket(async (socket) => {
  // 1. For nested query

  // 2. Build query
  const features = new APIFeatures(Task.find(filter), socket.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // 3. EXECUTE THE QUERY
  const docs = await features.query;

  // 4. Emit response
  socket.emit("Tasks:GetAll", docs);
});

export default {
  protect,
  restrictTo,
  setTaskUser,
  createTask,
  getAllTasks,
};
