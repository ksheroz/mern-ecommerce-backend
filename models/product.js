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
      maxlength: 2000,
      text: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    discountedPrice: {
      price: {
        type: Number,
        maxlength: 32,
      },
      discount: {
        type: Number,
        maxlength: 2,
        default: 0,
      },
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
      type: Array,
    },
    quantity: {
      type: [
        {
          color_Id: {
            type: ObjectId,
            ref: "Color",
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
    ratings: [
      {
        star: Number,
        comments: { type: String, maxlength: 280 },
        postedBy: { type: ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
