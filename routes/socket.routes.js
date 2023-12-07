import User from "../models/user.model.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";
import eStatusCode from "../utilities/enums/e.status-code.js";

const socketUserOnline = (id, connectionId) =>
  catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(id, {
      online: true,
      lastConnection: Date.now(),
      connectionId,
    });

    if (!user) {
      return next(new AppError("User not found!", eStatusCode.NOT_FOUND));
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  });

const socketUserOffline = (id) =>
  catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(id, {
      online: false,
      lastConnection: Date.now(),
    });

    if (!user) {
      return next(new AppError("User not found!", eStatusCode.NOT_FOUND));
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  });

export default {
  socketUserOnline,
  socketUserOffline,
};
