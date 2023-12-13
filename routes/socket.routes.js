import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/user.model.js";
import config from "../configurations/config.js";
import catchAsync from "../utilities/catchAsync.js";

const handleUserConnect = catchAsync(async (socket) => {
  // 1. Get token from header
  let token;
  if (socket.handshake.headers.token) {
    token = socket.handshake.headers.token;
  }

  // 2. check if token
  if (!token) {
    socket
      .to(socket.id)
      .emit("error:login", { message: "You are not allowed to login!" });
  }

  // 3. Verify token
  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

  // 4. Check if user still exists
  const currentuser = await User.findById(decoded.user._id);

  if (!currentuser) {
    socket.to(socket.id).emit("error:login", {
      message: "The user belonging to this token no longer exists!",
    });
  }

  // 5. Check if user changed password after the token was issued
  if (currentuser.changedPasswordAfter(decoded.iat)) {
    socket.to(socket.id).emit("error:login", {
      message: "User received changed password! Please log in again,",
    });
  }

  // 6. Update user connection
  currentuser.online = true;
  currentuser.lastConnection = Date.now();
  currentuser.connectionId = socket.id;
  await currentuser.save({ validateBeforeSave: false });

  // 7. Emit user:connected event
  socket.emit("user:connected", { data: currentuser });
});

const handleUserDisconnect = catchAsync(async (socket) => {
  // 1. Get user and update connection status
  await User.findOneAndUpdate(
    { connectionId: socket.id },
    { online: false, lastConnection: Date.now(), connectionId: null }
  );
});

export default {
  handleUserConnect,
  handleUserDisconnect,
};
