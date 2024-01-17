import { Schema, model } from 'mongoose';
import User from './user.model.js';

const reviewSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, 'Review content cannot be empty!'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Review must belong to a task'],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must be made to a provider'],
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

/**
 * @breif Calculate the average user rating
 * @param {String} providerId The provider id of the current user
 */
reviewSchema.statics.calcAverageRatings = async function (providerId) {
  const stats = await this.aggregate([
    {
      $match: { provider: providerId },
    },
    {
      $group: {
        _id: '$provider',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(providerId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await User.findByIdAndUpdate(providerId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.provider);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.provider);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'task',
    select: '-__v',
  });
  next();
});

const Review = model('Review', reviewSchema);

export default Review;
