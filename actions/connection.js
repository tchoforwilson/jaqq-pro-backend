import userHandler from './user.socket.js';
import taskHandler from './task.socket.js';

const onConnection = async (socket) => {
  console.log('Connected.....');
  userHandler(socket);
  taskHandler(socket);
};

export default onConnection;
