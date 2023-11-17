import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    label: {
      type: String,
      required: [true, "Tasks must have a label"],
    },
    providers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Task must have a service provider"],
      },
    ],
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
