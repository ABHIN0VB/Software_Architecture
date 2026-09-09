const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.Mixed
    },
    restaurant: String,
    name: String,
    price: Number,
    qty: Number,
    image: String
  }],
  restaurants: [String],
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
    default: 'placed'
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 49
  },
  total: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    address: String,
    lat: Number,
    lng: Number
  },
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },
  orderId: {
    type: String,
    unique: true
  },
  deliveryPartner: {
    name: String,
    phone: String,
    status: {
      type: String,
      default: 'Allocating delivery partner...'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date
});

const DELIVERY_RIDERS = [
  'Arjun', 'Rahul', 'Aditya', 'Rohit', 'Karthik',
  'Vivek', 'Akshay', 'Nikhil', 'Sandeep', 'Ananya'
];

orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'FF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  if (!this.deliveryPartner || !this.deliveryPartner.name) {
    const randomRider = DELIVERY_RIDERS[Math.floor(Math.random() * DELIVERY_RIDERS.length)];
    this.deliveryPartner = {
      name: randomRider,
      phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      status: 'Assigned'
    };
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
