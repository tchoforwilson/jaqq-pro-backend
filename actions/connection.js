import userHandler from './user.socket.js';

const onConnection = async (socket) => {
  userHandler(socket);
};

export default onConnection;
