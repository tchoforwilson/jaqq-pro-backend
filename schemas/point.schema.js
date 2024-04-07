import { Schema } from 'mongoose';

/**
 * @breif Coordinates point schema
 */
const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
  },
  name: String,
  category: String,
});

export default pointSchema;
