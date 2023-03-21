'use strict';
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
    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * @breif When finding tasks,populate with service providers
 */
taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'providers',
    select: '-__v -passwordChangedAt',
  });

  next();
});

const Task = model('Task', taskSchema);

export default Task;
