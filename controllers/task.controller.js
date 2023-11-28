import jwt from "jsonwebtoken";
import { promisify } from "util";
import Task from "../models/task.model.js";
import catchSocket from "../utilities/catchSocket.js";
import SocketError from "../utilities/socketError.js";

const socketProtect = catchSocket(async (socket, next) => {
  // 1. Get token
  let token;
  if (
    socket.handshake.authorization.token &&
    socket.handshake.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new SocketError(
        "The user belonging to this token does no longer exist.",
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
 * @breif Set user id when creating a new task
 * if it doesn't exist
 */
const setTaskUserIds = (req, res, next) => {
  if (req.body.userId) req.body.userId = req.user.id;
  next();
};

// export default {
//   setTaskUserIds,
//   createTask: factory.createOne(Task),
//   getTask: factory.getOne(Task, {
//     path: "users",
//     select: "-__v -passwordChangedAt",
//   }),
//   getAllTasks: factory.getAll(Task),
//   updateTask: factory.updateOne(Task),
//   deleteTask: factory.deleteOne(Task),
//   countTasks: factory.count(Task),
//   searchTask: factory.search(Task),
// };
