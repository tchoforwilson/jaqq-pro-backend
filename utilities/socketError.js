/**
 * @breif Function to handle socket errors
 * @details Emit the error message to the connected user
 * @param {Object} socket The socket connection object
 * @param {String} message The error message
 */

const SocketError = (socket, message) => {
  socket.broadcast.to(socket.id).emit('error', message);
  socket.emit('error', message);
};

export default SocketError;
