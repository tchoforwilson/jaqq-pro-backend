import { Schema, model } from "mongoose";
import pointSchema from "../schemas/point.schema.js";
import eTaskStatus from "../utilities/enums/e.task-status.js";

const taskSchema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must belong to a user"],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    prevProviders: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: [...Object.values(eTaskStatus)],
      default: eTaskStatus.PENDING,
    },
    location: {
      type: pointSchema,
      required: [true, "Specify task location"],
    },
    pricing: {
      minPrice: {
        type: Number,
        required: [true, "Minimum price required"],
      },
      maxPrice: {
        type: Number,
        required: [true, "Maximum price required"],
      },
    },
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

// User select values
const userSelect =
  "firstname lastname email phone photo location online connectionId lastConnection";

taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: "service",
    select: "_id label",
  })
    .populate({
      path: "user",
      select: userSelect,
    })
    .populate({
      path: "provider",
      select: userSelect,
    });

  next();
});

const Task = model("Task", taskSchema);

export default Task;
