import { Schema } from "mongoose";

/**
 * @breif Coordinates point schema
 */
const pointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
  },
});

export default pointSchema;
