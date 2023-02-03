const mongoose = require("mongoose");
const videoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your video name!"],
    unique: true,
  },
  catagory: {
    type: String,
    enum: ["beginner", "intermediate", "advance"],
    required: [true, "A video must have the catagory!"],
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  video: {
    type: String,
    required: [true, "there must be a video"],
  },
  series: {
    type: String,
    enum: ["seb-workout-series", "circut-workout-series"],
    required: [true, "A video must have the workout series type"],
  },
  videoUploadedAt: {
    type: Date,
    default: Date.now(),
  },
  description: String,
});
const video = mongoose.model("video", videoSchema);
module.exports = video;
