const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

/**
 * Calculates distance between two coordinates in km using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
};

/**
 * Smart search for restaurants and menu items
 * @param {string} query - The natural language search query
 * @param {number} userLat - User latitude
 * @param {number} userLng - User longitude
 * @returns {Promise<Object>}
 */
const smartSearch = async (query, userLat, userLng) => {
  try {
    const q = query.toLowerCase();
    const appliedFilters = {};
    const itemQuery = {};
    const restaurantQuery = {};

    // Price extraction
    const underMatch = q.match(/under\s*(?:₹|rs\.?|rupees)?\s*(\d+)/i);
    const betweenMatch = q.match(/between\s*(?:₹|rs\.?|rupees)?\s*(\d+)\s*and\s*(?:₹|rs\.?|rupees)?\s*(\d+)/i);
    
    if (betweenMatch) {
      appliedFilters.price = { min: parseInt(betweenMatch[1]), max: parseInt(betweenMatch[2]) };
      itemQuery.price = { $gte: appliedFilters.price.min, $lte: appliedFilters.price.max };
    } else if (underMatch) {
      appliedFilters.price = { max: parseInt(underMatch[1]) };
      itemQuery.price = { $lte: appliedFilters.price.max };
    } else if (q.includes('cheap') || q.includes('affordable')) {
      appliedFilters.price = { max: 200 };
      itemQuery.price = { $lte: 200 };
    } else if (q.includes('expensive')) {
      appliedFilters.price = { min: 400 };
      itemQuery.price = { $gte: 400 };
    }

    // Dietary extraction
    if (q.includes('non-veg') || q.includes('non veg')) {
      appliedFilters.isVeg = false;
      itemQuery.isVeg = false;
    } else if (q.includes('veg') || q.includes('vegetarian')) {
      appliedFilters.isVeg = true;
      itemQuery.isVeg = true;
    }

    // Categories
    const categories = ['dessert', 'drinks', 'snacks', 'main course', 'starters', 'beverages'];
    const foundCategory = categories.find(c => q.includes(c));
    if (foundCategory) {
      appliedFilters.category = foundCategory;
      itemQuery.category = { $regex: new RegExp(foundCategory, 'i') };
    }

    // Cuisines
    const cuisines = ['indian', 'chinese', 'italian', 'mexican', 'american', 'japanese', 'south indian', 'north indian', 'pizza', 'burger'];
    const foundCuisine = cuisines.find(c => q.includes(c));
    if (foundCuisine) {
      appliedFilters.cuisine = foundCuisine;
      restaurantQuery.cuisine = { $regex: new RegExp(foundCuisine, 'i') };
    }

    // Moods / Adjectives
    const moods = ['spicy', 'sweet', 'healthy', 'quick', 'delicious', 'hot'];
    const foundMoods = moods.filter(m => q.includes(m));
    if (foundMoods.length > 0) {
      appliedFilters.mood = foundMoods;
    }

    const regexQuery = { $regex: new RegExp(q.split(' ').join('|'), 'i') };

    if (Object.keys(itemQuery).length === 0) {
      itemQuery.$or = [
        { name: regexQuery },
        { description: regexQuery }
      ];
    } else {
      itemQuery.name = regexQuery;
    }

    if (Object.keys(restaurantQuery).length === 0) {
      restaurantQuery.$or = [
        { name: regexQuery },
        { cuisine: regexQuery }
      ];
    }

    let menuItems = await MenuItem.find(itemQuery).populate('restaurant').limit(20);
    let restaurants = await Restaurant.find(restaurantQuery).limit(10);

    // Sort by proximity
    if (userLat && userLng) {
      restaurants = restaurants.map(r => {
        const obj = r.toObject();
        if (obj.location && obj.location.coordinates) {
          obj.distance = calculateDistance(userLat, userLng, obj.location.coordinates[1], obj.location.coordinates[0]);
        } else {
          obj.distance = 9999;
        }
        return obj;
      }).sort((a, b) => a.distance - b.distance);

      menuItems = menuItems.map(m => {
        const obj = m.toObject();
        if (obj.restaurant && obj.restaurant.location && obj.restaurant.location.coordinates) {
          obj.distance = calculateDistance(userLat, userLng, obj.restaurant.location.coordinates[1], obj.restaurant.location.coordinates[0]);
        } else {
          obj.distance = 9999;
        }
        return obj;
      }).sort((a, b) => a.distance - b.distance);
    }

    return {
      restaurants,
      menuItems,
      appliedFilters
    };
  } catch (error) {
    console.error('Error in smart search:', error);
    throw new Error('Search failed');
  }
};

module.exports = { smartSearch };
