const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error, log } = require("console");

app.use(express.json());
app.use(cors());

// DataBase Connection with MongoDB
mongoose.connect(
  "mongodb+srv://raghudarvemula:royalmovies@cluster0.lw1jbbv.mongodb.net/e-commerce"
);

// API creation
app.get("/", (req, res) => {
  res.send("Hello World! hhiihihih");
});

//Image storage engine

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

//creating upload end points for images
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Schema for Creating products

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_prices: {
    type: Number,
    required: true,
  },
  old_prices: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }

  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_prices: req.body.new_price,
    old_prices: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("saved");
  res.json({
    suc: true,
    name: req.body.name,
  });
});

// Creating API for deleting products
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({
    id: req.body.id,
  });
  console.log("removed");

  res.json({
    success: true,
    name: req.body.name,
  });
});

// creating API for getting all products
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All products fethced");
  //console.log(products);
  res.send(products);
});

// schema creation for users

const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// creating end point  for registiring the user
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: false,
      errors: "user already exits with the same email",
    });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  res.json({ succes: true, token });
});

// end point for User-Login
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;

    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({
        succes: true,
        token,
      });
    } else {
      res.json({
        succes: false,
        errors: "wrong password",
      });
    }
  } else {
    res.json({ succes: false, errors: "Wrong Email ID" });
  }
});

// end point for new collection data
app.get("/newcollection", async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8); // this gives newly added 8 products
  console.log("new collection fetched");
  res.send(newcollection);
  console.log(newcollection);
});

//creating middleware to fetch user
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "please authenticate using valid account" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({ errors: "wrong token" });
    }
  }
};

//end point for adding cartdata with account
app.post("/addtocart", fetchuser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findByIdAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added");
});

// end point for deleting cartdata
app.post("/removefromcart", fetchuser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findByIdAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed");
});

// creating endpoint to get the cart data
app.post("/getcart", fetchuser, async (req, res) => {
  console.log("get Cart");
  let userData = await Users.findOne({ _id: req.body.id });
  console.log(userData.cartData);
  if (userData.cartData) {
    res.json(userData.cartData);
  }
});

app.listen(port, (e) => {
  if (!e) {
    console.log(`Example app listening on port ${port}`);
  } else {
    console.log("error:" + e);
  }
});
