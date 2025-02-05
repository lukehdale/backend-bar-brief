const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    author: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const tagSchema = new Schema({
  tagName: {
    type: String,
  },
  tagCount: {
    type: Number,
  },
  tagCategory: {
    type: String,
  },
});

const barSchema = new Schema({
  place_id: { type: String, required: true, unique: true },
  business_status: {
    type: String,
  },
  geometry: {
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  icon: {
    type: String,
  },
  icon_background_color: {
    type: String,
  },
  icon_mask_base_uri: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
  },
  photos: [
    {
      height: { type: Number },
      width: { type: Number },
      photo_reference: { type: String },
    },
  ],
  price_level: { type: Number },
  types: { type: [String] },
  vicinity: { type: String },
  comments: [commentSchema],
  tags: [tagSchema],
});

const Bar = mongoose.model("Bar", barSchema);

module.exports = Bar;
