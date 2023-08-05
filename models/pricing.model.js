import { Schema, model } from "mongoose";

const pricingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User can set their minimum price for a task"],
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Pricing should have a task"],
    },
    minPrice: {
      type: Number,
      required: [true, "Pricing must minimum price"],
    },
  },
  { timestamps: true }
);

// NB: This is to make sure a provider sets only one price for a task
pricingSchema.index({ provider: 1, task: 1 }, { unique: true });

/**
 * @breif When finding a pricing, add provider to the search result
 */
pricingSchema.pre(/^find/, function (next) {
  // Populate with task
  this.populate({
    path: "task",
    select: "label",
  });
  // Populate with provider
  this.populate({
    path: "user",
    select: "firstName lastName photo phone",
  });
  next();
});

const Pricing = model("Pricing", pricingSchema);

export default Pricing;
