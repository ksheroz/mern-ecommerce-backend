const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = mongoose.Schema(
  {
    articleNo: {
      type: String,
      trim: true,
      required: true,
      maxlength: 8,
      uppercase: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
      text: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    subs: [
      {
        type: ObjectId,
        ref: "Sub",
      },
    ],
    images: {
      type: [
        {
          color: {
            type: ObjectId,
            ref: "color",
          },
          url: { type: Array },
        },
      ],
    },
    quantity: {
      type: [
        {
          color: {
            type: ObjectId,
            ref: "color",
          },
          size: {
            type: Number,
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            required: true,
          },
          available: { type: Number, required: true },
          sold: { type: Number, default: 0 },
        },
      ],
    },
    brand: {
      type: String,
      trim: true,
      uppercase: true,
      required: true,
    },
    // ratings: [
    //   {
    //     star: Number,
    //     postedBy: { type: ObjectId, ref: "User" },
    //   },
    // ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
