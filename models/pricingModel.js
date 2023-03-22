const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        required: true
    }
  }, { timestamps: true },
);

module.exports = mongoose.model('Pricing', pricingSchema);