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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Virtual populate
taskSchema.virtual('pricings', {
  ref: 'Pricing',
  foreignField: 'task',
  localField: '_id',
});

/**
 * @breif When finding tasks, populate with service providers
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
