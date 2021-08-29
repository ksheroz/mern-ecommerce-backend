const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
require("dotenv").config();

// app
const app = express();

// port
const port = process.env.PORT || 8000;

// db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.log("DB CONNECTION ERR", err));

// middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(cors());

// routes
// app.get("/api", (req, res) => {
//   res.json({
//     data: "hey you hit node API",
//   });
// });

// routes middleware
readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)));

// listen
app.listen(port, () => console.log(`Server is running on port ${port}`));
