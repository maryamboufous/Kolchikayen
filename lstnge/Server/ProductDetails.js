const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  customCategory: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  donation: { type: Boolean, required: true },
  isDon: { type: Boolean, required: true },
  condition: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    country: { type: String, required: true },
    city: { type: String, required: true }
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
  images: [String], // Store image URLs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

mongoose.model('Product', productSchema);
