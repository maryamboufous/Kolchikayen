require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const dbURI = 'mongodb://maryam:Merybouf123@ac-qxsgsof-shard-00-01.najmn7n.mongodb.net:27017,ac-qxsgsof-shard-00-00.najmn7n.mongodb.net:27017,ac-qxsgsof-shard-00-02.najmn7n.mongodb.net:27017/?authSource=admin&replicaSet=atlas-znq6hh-shard-0&retryWrites=true&w=majority&appName=Cluster0&ssl=true';

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  writeConcern: {
    w: 'majority',
    wtimeout: 5000
  }
})
  .then(() => console.log('Database Connected'))
  .catch((err) => console.error('Database connection error:', err));
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
    text: `Votre code de verification de l'Application Kolchikayn est : ${verificationCode}`,
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
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'koulchikayn', // Folder name in Cloudinary
    format: async (req, file) => 'jpeg', // supports promises as well
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage: storage });

// Start App
app.get("/", (req, res) => {
  res.send({ status: "started" });
});
/// Add Product in Listings
app.post('/add-product', upload.array('images', 12), async (req, res) => {
  const {
    id,
    name,
    category,
    customCategory,
    description,
    price,
    donation,
    isDon,
    condition,
    email,
    phone,
    country,
    city,
    userId
  } = req.body;

  const images = req.files.map(file => file.path); // Get the image URLs from Cloudinary

  const newProduct = new Product({
    id,
    name,
    category,
    customCategory: category === 'Autres' ? customCategory : '',
    description,
    price,
    donation,
    isDon,
    condition,
    email,
    phone,
    address: {
      country,
      city
    },
    userId,
    images // Save image URLs
  });

  try {
    await newProduct.save();
    res.json({ status: 'ok', message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ status: 'error', message: 'An error occurred while adding the product' });
  }
});


// Get products by category
app.get('/products/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    let products;
    if (category === 'Autres') {
      products = await Product.find({ category: 'Autres' });
    } else {
      products = await Product.find({ category });
    }

    res.status(200).json({ status: 'ok', products });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching products' });
  }
});
//User profile image
app.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  const { userId } = req.body;
  const profileImage = req.file.path;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    );

    res.json({ status: 'ok', user });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Serve images directly from MongoDB

app.get('/product-image/:productId/:imageIndex', async (req, res) => {
  const { productId, imageIndex } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product || !product.images[imageIndex]) {
      return res.status(404).send('Image not found');
    }
    res.redirect(product.images[imageIndex]); // Redirect to Cloudinary image URL
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});



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
    const product = await Product.findById(productId).populate('userId', 'name profileImage');
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
//edit
app.put('/edit-product/:productId', upload.array('images', 12), async (req, res) => {
  const { productId } = req.params;
  const {
    name,
    category,
    customCategory,
    description,
    price,
    donation,
    country,
    city,
    userId,
    condition,
    email,
    phone,
    existingImages
  } = req.body;
  const images = req.files;

  try {
    // Retrieve the existing product
    console.log('Fetching existing product...');
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      console.log('Product not found');
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    // Parse existingImages if provided
    let updatedImages = [];
    if (existingImages) {
      try {
        updatedImages = JSON.parse(existingImages);
      } catch (error) {
        console.log('Invalid JSON format for existingImages:', error);
        return res.status(400).json({ status: 'error', message: 'Invalid JSON format for existingImages' });
      }
    }

    // Combine existing images with new uploads
    if (images) {
      images.forEach(file => {
        console.log('Adding new image:', file.path);
        updatedImages.push(file.path);
      });
    }

    const updatedFields = {
      name,
      category,
      customCategory: category === 'Autres' ? customCategory : '',
      description,
      price: donation === 'true' ? 0 : parseFloat(price),
      donation: donation === 'true',
      country,
      city,
      condition,
      email,
      phone,
      userId,
      updatedAt: Date.now(),
      images: updatedImages
    };

    console.log('Updating product with fields:', updatedFields);
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedFields, { new: true });

    console.log('Product updated successfully.');
    res.json({ status: 'ok', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ status: 'error', message: 'An error occurred while updating the product' });
  }
});


// Get products by country
app.get('/products/country/:country', async (req, res) => {
  const { country } = req.params;
  console.log(`Fetching products for country: ${country}`);

  try {
    const products = await Product.find({ 'address.country': country }).populate('userId', 'name');
    console.log(`Products found: ${products.length}`);
    res.status(200).json({ status: 'ok', products });
  } catch (error) {
    console.error('Error fetching products by country:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching products' });
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
  const { name, lastName, dateOfBirth, mobile, country, postalCode, email, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (name) user.name = name;
    if(lastName) user.lastName = lastName;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (mobile) user.mobile = mobile;
    if (country) user.country = country;
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
// Search products by name
app.get('/search', async (req, res) => {
  const { query } = req.query; // Read the query parameter from the request
  try {
    const products = await Product.find({
      name: { $regex: query, $options: 'i' } // Case-insensitive match
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
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
// Check if email exists
app.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error("Error checking email: ", error);
    res.status(500).json({ status: 'error', data: error.message });
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