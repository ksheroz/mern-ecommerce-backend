const mongoose = require("mongoose");

const colorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Color", colorSchema);
