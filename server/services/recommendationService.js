const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

/**
 * Generates personalized recommendations for a user based on their order history
 * @param {string} userId - The user ID
 * @returns {Promise<{menuItems: Array, restaurants: Array}>}
 */
const getRecommendations = async (userId) => {
  try {
    let mostPopularItems = [];
    let popularRestaurants = [];

    if (!userId) {
      mostPopularItems = await MenuItem.find({}).sort({ popularity: -1, rating: -1 }).limit(8).populate('restaurant');
      popularRestaurants = await Restaurant.find({}).sort({ rating: -1, totalRatings: -1 }).limit(4);
      return { menuItems: mostPopularItems, restaurants: popularRestaurants };
    }

    const orders = await Order.find({ user: userId, status: 'delivered' }).populate({
      path: 'items.menuItem',
      model: 'MenuItem',
      populate: { path: 'restaurant', model: 'Restaurant' }
    });

    if (!orders || orders.length === 0) {
      mostPopularItems = await MenuItem.find({}).sort({ popularity: -1, rating: -1 }).limit(8).populate('restaurant');
      popularRestaurants = await Restaurant.find({}).sort({ rating: -1, totalRatings: -1 }).limit(4);
      return { menuItems: mostPopularItems, restaurants: popularRestaurants };
    }

    const cuisines = {};
    const categories = {};
    let totalPrice = 0;
    let totalItemsCount = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = item.menuItem;
        if (menuItem) {
          totalPrice += menuItem.price * item.quantity;
          totalItemsCount += item.quantity;
          
          if (menuItem.category) {
            categories[menuItem.category] = (categories[menuItem.category] || 0) + item.quantity;
          }
          
          if (menuItem.restaurant && menuItem.restaurant.cuisine) {
            const cuisine = menuItem.restaurant.cuisine;
            cuisines[cuisine] = (cuisines[cuisine] || 0) + item.quantity;
          }
        }
      });
    });

    const avgPrice = totalItemsCount > 0 ? totalPrice / totalItemsCount : 0;
    const topCuisines = Object.keys(cuisines).sort((a, b) => cuisines[b] - cuisines[a]).slice(0, 3);
    const topCategories = Object.keys(categories).sort((a, b) => categories[b] - categories[a]).slice(0, 3);

    const priceFilter = avgPrice > 0 ? { price: { $gte: avgPrice * 0.5, $lte: avgPrice * 1.5 } } : {};

    const recommendedItems = await MenuItem.find({
      $or: [
        { category: { $in: topCategories } },
        priceFilter
      ]
    }).sort({ popularity: -1, rating: -1 }).limit(8).populate('restaurant');

    const recommendedRestaurants = await Restaurant.find({
      $or: [
        { cuisine: { $in: topCuisines } },
        { rating: { $gte: 4.0 } }
      ]
    }).sort({ rating: -1 }).limit(4);

    return {
      menuItems: recommendedItems,
      restaurants: recommendedRestaurants
    };

  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw new Error('Failed to fetch recommendations');
  }
};

module.exports = { getRecommendations };
