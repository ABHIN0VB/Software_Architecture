const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

reviewSchema.post('save', async function(doc, next) {
  try {
    const Restaurant = mongoose.model('Restaurant');
    const result = await this.model('Review').aggregate([
      { $match: { restaurant: doc.restaurant } },
      { $group: { _id: '$restaurant', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (result.length > 0) {
      await Restaurant.findByIdAndUpdate(doc.restaurant, {
        rating: Math.round(result[0].avgRating * 10) / 10,
        reviewCount: result[0].count
      });
    }
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
