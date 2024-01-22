import { promisify } from 'es6-promisify';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import catchSocketAsync from '../utilities/catchSocketAsync.js';
import SocketError from '../utilities/socketError.js';
import config from '../configurations/config.js';

export default catchSocketAsync(async (socket) => {
  // 1. Get token from header
  let token;
  if (socket.handshake.headers.token) {
    token = socket.handshake.headers.token;
  }

  // 2. check if token
  if (!token) return next(new SocketError('You are not allowed to login!'));

  // 3. Verify token
  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

  // 4. Check if user still exists
  const currentuser = await User.findById(decoded.id);

  if (!currentuser)
    return next(
      new SocketError('The user belonging to this token no longer exists!')
    );

  // 5. Check if user changed password after the token was issued
  if (currentuser.changedPasswordAfter(decoded.iat))
    return next(
      new SocketError('User received changed password! Please log in again,')
    );

  // 6. Update user connection
  currentuser.online = true;
  currentuser.lastConnection = new Date(Date.now());
  currentuser.connectionId = socket.id;
  await currentuser.save({ validateBeforeSave: false });

  // 7. Emit user:connected event
  socket.emit('connected', { data: currentuser });

  /**
   * @bref Current user location
   */
  socket.on('currentLocation', async (location) => {
    currentuser.currentLocation = location;
    await currentuser.save({ validateBeforeSave: false });
    socket.emit('currentLocation:updated', { data: currentuser });
  });

  /**
   * @breif When user disconnects from server
   */
  socket.on('disconnect', async () => {
    await User.findOneAndUpdate(
      { connectionId: socket.id },
      {
        online: false,
        lastConnection: new Date(Date.now()),
        connectionId: null,
      }
    );

    socket.emit('disconnected', { data: currentuser });
  });
});
