import { Schema, model } from 'mongoose';

const pricingSchema = new Schema(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: [true, 'providers can set their minimum price for a task'],
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
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

const Pricing = model('Pricing', pricingSchema);

export default Pricing;
