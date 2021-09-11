const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const {
  create,
  remove,
  read,
  listAll,
  getAllBrands,
  getAllColors,
  getAllSizes,
  addColor,
  update,
  list,
  productsCount,
  getColors,
  getSizes,
  rating,
  listRelated,
  searchFilters,
} = require("../controllers/product");

// routes
router.post("/product", authCheck, adminCheck, create);
router.get("/product/brands", getAllBrands);
router.get("/product/colors", getAllColors);
router.get("/product/sizes", getAllSizes);
router.post("/product/colors/new", authCheck, adminCheck, addColor);
router.post("/products", list);
router.get("/products/total", productsCount);
router.get("/products/:count", listAll); // products/100
router.delete("/product/:slug", authCheck, adminCheck, remove);
router.get("/product/:slug", read);
router.get("/product/colors/:slug", getColors);
router.get("/product/sizes/:slug", getSizes);
router.put("/product/:slug", authCheck, adminCheck, update);
// rating
router.put("/product/star/:productId", authCheck, rating);
// related
router.get("/product/related/:productId", listRelated);
// search
router.post("/search/filters", searchFilters);

module.exports = router;
