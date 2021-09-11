const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");

exports.userCart = async (req, res) => {
  // console.log(req.body); // {cart: []}
  const { cart } = req.body;
  console.log(cart);

  let products = [];

  const user = await User.findOne({ email: req.user.email }).exec();

  // check if cart with logged in user id already exists
  let cartExistsByThisUser = await Cart.findOne({ orderdBy: user._id }).exec();

  if (cartExistsByThisUser) {
    cartExistsByThisUser.remove();
    console.log("Removed old cart!");
  }
  cart.map((p, i) => {
    let object = {};

    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.color = cart[i].color;
    object.size = cart[i].size;
    // get price for creating total

    cart[i].discountedPrice.discount !== 0 &&
      (object.price = cart[i].discountedPrice.price);
    cart[i].discountedPrice.discount === 0 && (object.price = cart[i].price);
    products.push(object);
  });

  // console.log('products', products)

  let cartTotal = 0;
  for (let i = 0; i < products.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count;
  }

  // console.log("cartTotal", cartTotal);

  let newCart = await new Cart({
    products,
    cartTotal,
    orderdBy: user._id,
  }).save();

  console.log("New cart", newCart);
  res.json({ ok: true });
};

exports.getUserCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();

  let cart = await Cart.findOne({ orderdBy: user._id })
    .populate("products.product", "_id title price totalAfterDiscount")
    .exec();

  const { products, cartTotal, totalAfterDiscount } = cart;
  res.json({ products, cartTotal, totalAfterDiscount });
};

exports.emptyCart = async (req, res) => {
  console.log("Empty cart");
  const user = await User.findOne({ email: req.user.email }).exec();

  const cart = await Cart.findOneAndRemove({ orderdBy: user._id }).exec();
  res.json(cart);
};

exports.saveAddress = async (req, res) => {
  await User.findOneAndUpdate(
    { email: req.user.email },
    { address: req.body.address }
  ).exec();

  res.json({ ok: true });
};

exports.applyCouponToUserCart = async (req, res) => {
  const { coupon } = req.body;
  console.log("Coupon: ", coupon);

  const validCoupon = await Coupon.findOne({ name: coupon }).exec();
  if (validCoupon === null) {
    return res.json({
      err: "Invalid coupon",
    });
  }
  console.log("Valid coupon", validCoupon);

  const user = await User.findOne({ email: req.user.email }).exec();

  let { products, cartTotal } = await Cart.findOne({ orderdBy: user._id })
    .populate("products.product", "_id title price")
    .exec();

  console.log("cartTotal", cartTotal, "discount%", validCoupon.discount);

  // calculate the total after discount
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2); // 99.99

  Cart.findOneAndUpdate(
    { orderdBy: user._id },
    { totalAfterDiscount },
    { new: true }
  );

  res.json(totalAfterDiscount);
};
