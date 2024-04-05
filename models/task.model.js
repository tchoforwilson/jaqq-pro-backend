import { Schema, model } from 'mongoose';
import { getDistance } from 'geolib';
import pointSchema from '../schemas/point.schema.js';
import eTaskStatus from '../utilities/enums/e.task-status.js';

const taskSchema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    prevProviders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: [...Object.values(eTaskStatus)],
      default: eTaskStatus.PENDING,
    },
    location: pointSchema,
    pricing: {
      minPrice: {
        type: Number,
        required: [true, 'Minimum price required'],
      },
      maxPrice: {
        type: Number,
        required: [true, 'Maximum price required'],
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

// User select values
const userSelect =
  'firstname lastname email phone photo location online connectionId lastConnection';

taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'service',
    select: '_id title',
  })
    .populate({
      path: 'user',
      select: userSelect,
    })
    .populate({
      path: 'provider',
      select: userSelect,
    });

  next();
});

/**
 * @breif Check if provider current location is close to that of task location
 * @param {Object} providerCurrentLocation
 * @returns {Boolean} true distance are 2 meters apart else false
 */
taskSchema.methods.atTaskLocation = function (providerCurrentLocation) {
  // 1. Get coordinates
  const coord1 = {
    latitude: this.location.coordinates[0],
    longitude: this.location.coordinates[1],
  };
  const coord2 = {
    latitude: providerCurrentLocation.coordinates[0],
    longitude: providerCurrentLocation.coordinates[1],
  };

  // 2. Calculate the distance in meters
  const distance = getDistance(coord1, coord2);

  // 3. Check if the distance is less than 2 meters
  return distance <= 2;
};

const Task = model('Task', taskSchema);

export default Task;
