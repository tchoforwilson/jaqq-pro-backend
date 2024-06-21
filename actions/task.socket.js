import Task from '../models/task.model.js';
import eTaskStatus from '../utilities/enums/e.task-status.js';
import eUserRole from '../utilities/enums/e.user-role.js';
import SocketError from '../utilities/socketError.js';

export default (socket) => {
  const { user } = socket;
  let providers = [];

  const updateTaskStatus = async (taskId, status) => {
    try {
      // 1. Get the task
      const task = await Task.findById(taskId);

      // 2. Check task exists
      if (!task) return SocketError(socket, 'Task not found!');

      // 3. Check if task is still pending
      if (task.status === eTaskStatus.PENDING)
        return SocketError(socket, 'Task is still pending!');

      // 4. Check if user is provider
      if (
        user.role === eUserRole.PROVIDER &&
        [eTaskStatus.APPROVED, eTaskStatus.CANCELLED].includes(status)
      ) {
        return SocketError(
          socket,
          'You are not allowed to performed this action'
        );
      }

      // 5. check the status and the user is allowed to perform
      if (
        user.role === eUserRole.USER &&
        [
          eTaskStatus.ACCEPTED,
          eTaskStatus.REJECTED,
          eTaskStatus.PROGRESS,
          eTaskStatus.READY,
        ].includes(status)
      ) {
        return SocketError(
          socket,
          'You are not allowed to performed this action'
        );
      }
      // 6. Check if task in in progress or cancelled
      if (
        status === eTaskStatus.CANCELLED &&
        task.status === eTaskStatus.PROGRESS
      ) {
        return SocketError(socket, 'Task in progress cannot be cancelled!');
      }

      // 7. Task rejected
      if (status === eTaskStatus.REJECTED) {
        providers = [...new Set([user._id, ...task.prevProviders])];
      }

      // 8. Task in progress
      if (
        status === eTaskStatus.PROGRESS &&
        !task.atTaskLocation(user.currentLocation)
      ) {
        return SocketError(socket, 'Not yet at task location!');
      }

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
          status,
          prevProviders: providers,
        },
        { new: true }
      );

      socket.broadcast
        .to(task.user.connectionId)
        .emit('task:updated', updatedTask);
      socket.broadcast
        .to(task.provider.connectionId)
        .emit('task:updated', updatedTask);
    } catch (error) {
      console.log('Error updating task status: ' + error.message);
    }
  };

  socket.on('task:status', updateTaskStatus);
};
