const mongoose = require("mongoose");
const expertTipsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please tell us about title!"],
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Please provide the description!"],
    trim: true,
  },
  images: [String],
  author: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const expertTips = mongoose.model("expertTips", expertTipsSchema);
module.exports = expertTips;
