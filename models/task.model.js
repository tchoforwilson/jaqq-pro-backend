import { Schema, model } from "mongoose";
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
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: [...Object.values(eTaskStatus)],
      default: eTaskStatus.PENDING,
    },
    location: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
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

const Task = model("Task", taskSchema);

export default Task;
