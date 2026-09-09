const Review = require('../models/Review');
const Order = require('../models/Order');

/**
 * Create a review
 */
exports.createReview = async (req, res) => {
  try {
    const { restaurant, order, rating, comment } = req.body;

    if (!restaurant || !order || !rating) {
      return res.status(400).json({ success: false, message: 'Please provide restaurant, order, and rating' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Ensure order belongs to user
    const orderExists = await Order.findOne({ _id: order, user: req.user.id });
    if (!orderExists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Create review
    const review = await Review.create({
      user: req.user.id,
      restaurant,
      order,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get restaurant reviews
 */
exports.getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(20);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
