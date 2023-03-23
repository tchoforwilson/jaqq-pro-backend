import { Schema, model } from 'mongoose';

const pricingSchema = new Schema(
  {
    provider: {
      type: Schema.ObjectId,
      ref: 'Provider',
      required: [true, 'providers can set their minimum price for a task'],
    },
    task: {
      type: Schema.ObjectId,
      ref: 'Task',
      required: [true, 'Pricing should have a task'],
    },
    minPrice: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

// NB: This is to make sure a provider sets only one price for a task
pricingSchema.index({ provider: 1, task: 1 }, { unique: true });

/**
 * @breif When finding a pricing, add provider to the search result
 */
pricingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'provider',
    select: 'firstName lastName photo phone',
  });
  next();
});

const Pricing = model('Pricing', pricingSchema);

export default Pricing;
