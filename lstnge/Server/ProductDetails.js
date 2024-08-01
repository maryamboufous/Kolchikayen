const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  customCategory: { type: String },  // New field for custom category
  description: { type: String, required: true },
  price: { type: Number },
  donation: { type: Boolean, required: true },
  isDon: { type: Boolean },
  condition: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    country: { type: String, required: true },
    city: { type: String, required: true }
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
  images: [Buffer]
});

productSchema.index({ name: 1, userId: 1 }, { unique: true });

mongoose.model('Product', productSchema);
