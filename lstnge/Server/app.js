
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const mongoUrl = 'mongodb+srv://maryam:Merybouf123@cluster0.najmn7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoUrl).then(() => {
  console.log("Database Connected");
}).catch((e) => {
  console.error("Database Connection Error: ", e);
});

require('./userDetails');
require('./ProductDetails');
require('./LikedProduct');

const User = mongoose.model("UserInfo");
const Product = mongoose.model("Product");
const LikedProduct = mongoose.model("LikedProduct");

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// In-memory storage for verification codes
const verificationCodes = {};

app.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  verificationCodes[email] = verificationCode;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification of Kolchikayn App code is: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
      return res.status(500).json({ status: 'error', data: error.message });
    }
    console.log("Email sent: " + info.response);
    res.status(200).json({ status: 'ok', data: { verificationCode } });
  });
});




// Uploades Images from Form:
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Start App
app.get("/", (req, res) => {
  res.send({ status: "started" });
});




// Add Product in Listings
app.post('/add-product', upload.array('images', 5), async (req, res) => {
  console.log("Received Add Product request");

  const { id, name, category, description, price, donation, isAvailable, country, userId, condition, email, phone } = req.body;
  const images = req.files.map(file => file.path);

  console.log("Request Body:", req.body);

  try {
    const existingProduct = await Product.findOne({ name, category, userId });
    if (existingProduct) {
      return res.status(400).json({ status: 'error', message: 'Product already exists!' });
    }

    const newProduct = new Product({
      id,
      name,
      category,
      description,
      price,
      donation, // Ensure donation is included
      condition,
      email,
      phone,
      country,
      userId,
      images
    });

    console.log("New Product:", newProduct);

    const savedProduct = await newProduct.save();
    console.log("Saved Product:", savedProduct);

    const user = await User.findById(userId);
    console.log("User Found:", user);

    if (user) {
      user.products_to_sell.push(savedProduct._id);
      await user.save();
      console.log("User after adding product:", user);
      res.send({ status: "ok", data: "Product added successfully" });
    } else {
      console.error("User not found:", userId);
      res.send({ status: "error", data: "User not found" });
    }
  } catch (error) {
    console.error("Error adding product:", error);
    res.send({ status: "error", data: error.message });
  }
});


// Get products by category
app.get('/products/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});


// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find().populate('userId', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Like Product
app.post('/like-product', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const likedProduct = new LikedProduct({ userId, productId });
    await likedProduct.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    user.liked_products.push(productId);
    await user.save();

    res.json({ status: 'ok', message: 'Product liked successfully' });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

// Unlike Product
app.post('/unlike-product', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    await LikedProduct.findOneAndDelete({ userId, productId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    user.liked_products.pull(productId);
    await user.save();

    res.json({ status: 'ok', message: 'Product unliked successfully' });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

// Get product by ID
app.get('/products/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).populate('userId', 'name');
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'ok', product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});


app.delete('/products/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // Delete the product from the products collection
    await Product.findByIdAndDelete(productId);

    // Delete the product reference from users' collections
    await User.updateMany({}, { $pull: { products_to_sell: productId } });

    // Delete any liked products related to this product
    await LikedProduct.deleteMany({ productId });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Server error');
  }
});


app.delete('/products/products/:id', async(req, res) =>{
  const productId = req.param.id;

  try{
    //delete product from collection
    await Product.findByIdAndDelete(productId);
    await User.updateMany({}, { $pull:{product:productId}});
    res.status(204).send();

  }
  catch(error){
    console.error('Error deleting product:', error);
    res.status(500).send('Server error');
  }
});

// Edit Product
app.put('/edit-product/:id', upload.array('images', 5), async (req, res) => {
  const productId = req.params.id;
  const { name, category, description, price, isAvailable, country, userId } = req.body;
  const images = req.files.map(file => file.path);

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found!' });
    }

    if (product.userId.toString() !== userId) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized!' });
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (description) product.description = description;
    if (price) product.price = price;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (country) product.country = country;
    if (images.length > 0) product.images = images;

    await product.save();
    res.send({ status: 'ok', data: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send({ status: 'error', data: 'Error updating product' });
  }
});


//uuser infos are done i guess 
// Get user by ID
app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Update user details
app.put('/users/:userId', async (req, res) => {
  const { userId } = req.params; // Changed line
  const { name, lastName, dateOfBirth, mobile, address, postalCode, country, email, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (name) user.name = name;
    if(lastName) user.lastName = lastName;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;
    if (postalCode) user.postalCode = postalCode;
    if (country) user.country = country;
    if (email) user.email = email;
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ status: 'ok', user });
  } catch (error) {
    console.error('Error updating user info :', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});


// Get liked products of a user
app.get('/user/:userId/liked-products', async (req, res) => {
  const { userId } = req.params;
  const { complete } = req.query; // Read the query parameter

  try {
    if (complete === 'true') {
      // Populate productId to get full product details
      const populatedLikedProducts = await LikedProduct.find({ userId }).populate('productId');
      res.json(populatedLikedProducts.map(lp => lp.productId));
    } else {
      // Return only productId
      const likedProducts = await LikedProduct.find({ userId }).select('productId');
      res.json(likedProducts.map(lp => lp.productId));
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
//Get Products for store
// Server/app.js
app.get('/products/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const products = await Product.find({ userId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user products', error });
  }
});


// Add Product to Cart
app.post('/add-to-cart', async (req, res) => {
  const { userId, productId } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.added_to_cart.push(productId);
    await user.save();

    res.json({ status: 'ok', message: 'Product added to cart successfully' });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});


// Get cart products for a user
app.get('/user/:userId/cart-products', async (req, res) => {
  const { userId } = req.params;
  const { complete } = req.query;

  try {
    const user = await User.findById(userId).populate({
      path: 'added_to_cart',
      populate: {
        path: 'userId',
        select: 'name',
      },
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    let cartProducts = user.added_to_cart;

    if (complete === 'true') {
      cartProducts = await Product.find({ _id: { $in: user.added_to_cart } });
    }

    res.json(cartProducts);
  } catch (error) {
    console.error('Error fetching cart products:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});


// Remove cart product from user
app.delete('/user/:userId/cart-products/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  console.log(`Removing product ${productId} from user ${userId} cart`);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.added_to_cart.pull(productId);
    await user.save();

    console.log(`Product ${productId} removed from user ${userId} cart`);
    res.json({ status: 'ok', message: 'Product removed from cart successfully' });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});







// Sign Up
app.post('/signup', async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      mobile,
      password: encryptedPassword,
    });

    await user.save();
    res.status(200).json({ status: 'ok', data: user });
  } catch (error) {
    console.error("Error creating user: ", error);
    res.status(500).json({ status: 'error', data: error.message });
  }
});




// Login with Liked session
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const likedProducts = await LikedProduct.find({ userId: user._id }).select('productId');
        res.send({ status: "ok", data: { ...user.toObject(), likedProducts } });
      } else {
        res.send({ status: "error", data: "Invalid password" });
      }
    } else {
      res.send({ status: "error", data: "User not found" });
    }
  } catch (error) {
    res.send({ status: "error", data: "An error occurred during login" });
  }
});

app.listen(5001, () => {
  console.log("Node js server started");
});