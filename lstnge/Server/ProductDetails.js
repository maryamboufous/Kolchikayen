const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  donation: { type: Boolean },
  condition: { type: String, required : true},
  email: {type: String, required: true},
  phone: {type: String, required: true},
  country: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
  images: { type: [String], required: true }
});

productSchema.index({ name: 1, userId: 1 }, { unique: true });

mongoose.model('Product', productSchema);