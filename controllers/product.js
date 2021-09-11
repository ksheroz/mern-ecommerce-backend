const Product = require("../models/product");
const Color = require("../models/color");
const User = require("../models/user");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    req.body.slug = slugify(req.body.title);
    req.body.discountedPrice = {
      price: Math.round(req.body.price * ((100 - req.body.discount) / 100)),
      discount: req.body.discount,
    };
    const newProduct = await new Product(req.body).save();
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.listAll = async (req, res) => {
  let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate("category")
    .populate("subs")
    .populate({ path: "quantity.color_Id", select: "name" })
    .sort([["createdAt", "desc"]])
    .exec();
  res.json(products);
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndRemove({
      slug: req.params.slug,
    }).exec();
    res.json(deleted);
  } catch (err) {
    console.log(err);
    return res.staus(400).send("Product delete failed");
  }
};

exports.read = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category")
    .populate("subs")
    .populate({ path: "quantity.color_Id", select: "name" })
    .exec();
  res.json(product);
};

exports.update = async (req, res) => {
  try {
    console.log(req.body);
    req.body.discountedPrice = {
      price: Math.round(
        req.body.price * ((100 - req.body.discountedPrice) / 100)
      ),
      discount: req.body.discountPrice,
    };
    // if (req.body.title) {
    //   req.body.slug = slugify(req.body.title);
    // }
    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log("Product Update Error ----> ", err);
    res.status(400).json({
      err: err.message,
    });
  }
};

exports.getAllBrands = async (req, res) => {
  Product.find().distinct("brand", (err, result) => {
    if (result) res.json(result);
    else res.json(err);
  });
};

exports.getAllColors = async (req, res) => {
  Color.find({}, (err, result) => {
    if (result) res.json(result);
    else res.json(err);
  });
};

exports.getAllSizes = async (req, res) => {
  await Product.find().distinct("quantity.size", (err, result) => {
    if (result) res.json(result);
    else res.json(err);
  });
};

exports.addColor = async (req, res) => {
  const { color } = req.body;
  console.log(color);
  await Color.findOneAndUpdate(
    { name: color.toLowerCase() },
    { name: color },
    { upsert: true, new: true },
    (err, result) => {
      if (err) {
        res.json(err);
        return;
      }
      console.log(result);
      res.json(result);
    }
  );
};

// Without Pagination
// exports.list = async (req, res) => {
//   try {
//     // createdAt/updatedAt, desc/asc, 3
//     const { sort, order, limit } = req.body;
//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .populate({ path: "quantity.color_Id", select: "name" })
//       .sort([[sort, order]])
//       .limit(limit)
//       .exec();

//     res.json(products);
//   } catch (err) {
//     console.log(err);
//   }
// };

// With Pagination
exports.list = async (req, res) => {
  // console.table(req.body);
  try {
    // createdAt/updatedAt, desc/asc, 3
    const { sort, order, page } = req.body;
    const currentPage = page ? page : 1;
    const perPage = 4; // 4

    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subs")
      .populate({ path: "quantity.color_Id", select: "name" })
      .sort([[sort, order]])
      .limit(perPage)
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

exports.productsCount = async (req, res) => {
  let total = await Product.find({}).estimatedDocumentCount().exec();
  res.json(total);
};

exports.getColors = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    "quantity.color_Id"
  );
  let c = [];
  product &&
    product.quantity.map((q) => {
      if (c.includes(q.color_Id.name) === false) {
        c.push(q.color_Id.name);
      }
    });
  res.json(c);
};

exports.getSizes = async (req, res) => {
  Product.find({ slug: req.params.slug }).distinct(
    "quantity.size",
    (err, result) => {
      if (result) res.json(result);
      else res.json(err);
    }
  );
};

exports.rating = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();
  const user = await User.findOne({ email: req.user.email }).exec();
  const { star, comments } = req.body;

  // who is updating?
  // check if currently logged in user has already added rating for this product?
  let existingRatingObject = product.ratings.find(
    (ele) => ele.postedBy.toString() === user._id.toString()
  );

  // if user has not left a rating already, push it
  if (existingRatingObject === undefined) {
    let ratingAdded = await Product.findByIdAndUpdate(
      product._id,
      {
        $push: { ratings: { star, postedBy: user._id, comments } },
      },
      { new: true }
    ).exec();
    console.log("ratingAdded", ratingAdded);
    res.json(ratingAdded);
  } else {
    // if user has already left rating, update it
    const ratingUpdated = await Product.updateOne(
      {
        ratings: { $elemMatch: existingRatingObject },
      },
      { $set: { "ratings.$.star": star, "ratings.$.comments": comments } },
      { new: true }
    ).exec();
    console.log("ratingUpdated", ratingUpdated);
    res.json(ratingUpdated);
  }
};

exports.listRelated = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(3)
    .populate("category")
    .populate("subs")
    .populate({ path: "quantity.color_Id", select: "name" })
    .populate("ratings.postedBy")
    .exec();

  res.json(related);
};

// Search / Filter

const handleQuery = async (req, res, query) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("quantity.color_Id", "name")
    .populate("ratings.postedBy", "_id name")
    .exec();

  res.json(products);
};

const handlePrice = async (req, res, price) => {
  try {
    let products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("quantity.color_Id", "name")
      .populate("ratings.postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("quantity.color_Id", "name")
      .populate("ratings.postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleStar = (req, res, stars) => {
  Product.aggregate([
    {
      $project: {
        document: "$$ROOT",
        // title: "$title",
        floorAverage: {
          $floor: { $avg: "$ratings.star" }, // floor value of 3.33 will be 3
        },
      },
    },
    { $match: { floorAverage: stars } },
  ])
    .limit(12)
    .exec((err, aggregates) => {
      if (err) console.log("Aggregate err", err);
      Product.find({ _id: aggregates })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("quantity.color_Id", "name")

        .populate("ratings.postedBy", "_id name")
        .exec((err, products) => {
          if (err) console.log("Product aggregate err", err);
          res.json(products);
        });
    });
};

const handleSub = async (req, res, sub) => {
  const products = await Product.find({ subs: sub })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("quantity.color_Id", "name")
    .populate("ratings.postedBy", "_id name")
    .exec();

  res.json(products);
};

const handleColor = async (req, res, color) => {
  const products = await Product.find({ color })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("quantity.color_Id", "name")
    .populate("ratings.postedBy", "_id name")
    .exec();

  res.json(products);
};

const handleBrand = async (req, res, brand) => {
  const products = await Product.find({ brand })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("quantity.color_Id", "name")
    .populate("ratings.postedBy", "_id name")
    .exec();

  res.json(products);
};

exports.searchFilters = async (req, res) => {
  const { query, price, category, stars, sub, color, brand } = req.body;

  if (query) {
    console.log("query --->", query);
    await handleQuery(req, res, query);
  }

  // price [20, 200]
  if (price !== undefined) {
    console.log("price ---> ", price);
    await handlePrice(req, res, price);
  }

  if (category) {
    console.log("category ---> ", category);
    await handleCategory(req, res, category);
  }

  if (stars) {
    console.log("stars ---> ", stars);
    await handleStar(req, res, stars);
  }

  if (sub) {
    console.log("sub ---> ", sub);
    await handleSub(req, res, sub);
  }

  if (color) {
    console.log("color ---> ", color);
    await handleColor(req, res, color);
  }

  if (brand) {
    console.log("brand ---> ", brand);
    await handleBrand(req, res, brand);
  }
};
