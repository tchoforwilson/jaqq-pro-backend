import { Schema, model } from 'mongoose';

const taskSchema = new Schema(
  {
    label: {
      type: String,
      required: [true, 'Tasks must have a label'],
    },
    providers: [
      {
        type: Schema.ObjectId,
        ref: 'Provider',
        required: [true, 'Task must have a service provider'],
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

const Task = model('Task', taskSchema);

export default Task;
