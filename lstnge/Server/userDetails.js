const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String },
  dateOFBirth: { type: Date },
  address: { type: String },
  postalCode: { type: String },
  country: { type: String, enum: ['France', 'Morocco'] },
  email: { type: String, required: true, unique: true },
  mobile: { type: String},
  password: { type: String, required: true },
  products_to_sell: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  liked_products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LikedProduct' }],
  added_to_cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],  // Add this line
});

mongoose.model('UserInfo', userSchema);
