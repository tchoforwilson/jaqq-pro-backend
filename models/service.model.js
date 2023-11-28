import { Schema, model } from "mongoose";

const servicesSchema = new Schema(
  {
    label: {
      type: String,
      required: [true, "Service must have a name!"],
    },
    numOfProviders: Number,
    numOfTasks: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

const Service = model("Service", servicesSchema);

export default Service;
