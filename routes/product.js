const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const {
  create,
  getAllBrands,
  getAllColors,
  getAllSizes,
} = require("../controllers/product");

// routes
router.post("/product", authCheck, adminCheck, create);
router.get("/product/brands", getAllBrands);
router.get("/product/colors", getAllColors);
router.get("/product/sizes", getAllSizes);

module.exports = router;
