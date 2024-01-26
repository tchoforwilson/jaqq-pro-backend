import { Schema, model } from 'mongoose';
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
    location: {
      type: pointSchema,
      required: [true, 'Specify task location'],
    },
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
    select: '_id label',
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
  const earthRadius = 6371; // Radius of the earth in kilometers
  const [lon1, lat1] = this.location.coordinates;
  const [lon2, lat2] = providerCurrentLocation.coordinates;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c * 1000; // Distance in meters

  console.log(distance);

  return distance <= 2;
};

const Task = model('Task', taskSchema);

export default Task;
