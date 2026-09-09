const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  cuisine: [String],
  description: String,
  image: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  deliveryTime: String,
  deliveryFee: Number,
  location: {
    address: String,
    area: String,
    lat: Number,
    lng: Number
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
