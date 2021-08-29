const Product = require("../models/product");
const Color = require("../models/color");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    res.status(400).send("Create product failed");
  }
};

exports.getAllBrands = async (req, res) => {
  Product.find().distinct("brand", (err, result) => {
    if (result) res.json(result);
    else res.json(err);
  });
};

exports.getAllColors = async (req, res) => {
  try {
    const colors = await Color.find({});
    res.json(colors);
  } catch (error) {
    res.json(error);
  }
};

exports.getAllSizes = async (req, res) => {
  Product.find().distinct("quantity.size", (err, result) => {
    if (result) res.json(result);
    else res.json(err);
  });
};
