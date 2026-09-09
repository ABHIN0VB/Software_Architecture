const MenuItem = require('../models/MenuItem');

/**
 * Get all menu items for a restaurant
 */
exports.getMenuByRestaurant = async (req, res) => {
  try {
    let query = { restaurant: req.params.restaurantId };

    if (req.query.category) {
      query.category = req.query.category;
    }

    const menuItems = await MenuItem.find(query).sort('-popularity');

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single menu item
 */
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant', 'name');

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
