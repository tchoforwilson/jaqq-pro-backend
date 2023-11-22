import { Schema, model } from "mongoose";

const servicesSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Service must have a name!"],
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

const Service = model("Service", servicesSchema);

export default Service;
