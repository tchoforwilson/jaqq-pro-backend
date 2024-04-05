import { promisify } from 'es6-promisify';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import config from '../configurations/config.js';
import SocketError from '../utilities/socketError.js';

const protect = async (socket, next) => {
  // 1. Get token from header
  let token;
  if (socket.handshake.headers.token) {
    token = socket.handshake.headers.token;
  }

  // 2. check if token
  if (!token) return SocketError(socket, 'You are not allowed to login!');

  // 3. Verify token
  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

  // 4. Check if user still exists
  const currentuser = await User.findById(decoded.id);

  if (!currentuser)
    return SocketError(
      socket,
      'The user belonging to this token no longer exists!'
    );

  // 5. Check if user changed password after the token was issued
  if (currentuser.changedPasswordAfter(decoded.iat)) {
    return SocketError(
      socket,
      'User received changed password! Please log in again,'
    );
  }
  // 6. Update user connection
  currentuser.online = true;
  currentuser.lastConnection = Date.now();
  currentuser.connectionId = socket.id;
  await currentuser.save({ validateBeforeSave: false });

  socket.user = currentuser;
  next();
};

export default {
  protect,
};
