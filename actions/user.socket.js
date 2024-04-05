import User from '../models/user.model.js';
import SocketError from '../utilities/socketError.js';

export default function (socket) {
  // A. CONTROLLERS
  const updateUserLocation = async (location) => {
    console.log(location);
    // 1. Get user
    const user = await User.findByIdAndUpdate(socket.user.id, location);

    // 2. Check if user exists
    if (!user) {
      return SocketError(socket, 'User not found!');
    }

    // 3. Emit user
    socket.emit('currenLocation:Updated', { data: user });
  };

  const disconnect = async () => {
    await User.findByIdAndUpdate(socket.user.id, {
      online: false,
      lastConnection: Date.now(),
      connectionId: null,
    });
  };

  // B. ROUTES
  socket.on('currentLocation', updateUserLocation);
  socket.on('disconnect', disconnect);
}
