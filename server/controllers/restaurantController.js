const Restaurant = require('../models/Restaurant');

/**
 * Calculate Haversine distance between two points in km
 */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

/**
 * Get all restaurants
 */
exports.getRestaurants = async (req, res) => {
  try {
    let query;

    const reqQuery = { ...req.query };

    const removeFields = ['cuisine', 'search', 'sort', 'lat', 'lng'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    
    let dbQuery = Restaurant.find(JSON.parse(queryStr));

    if (req.query.cuisine) {
      dbQuery = dbQuery.where('cuisine').in([req.query.cuisine]);
    }

    if (req.query.search) {
      dbQuery = dbQuery.find({ name: { $regex: req.query.search, $options: 'i' } });
    }

    if (req.query.sort === 'rating') {
      dbQuery = dbQuery.sort('-rating');
    }

    const restaurants = await dbQuery;

    // If lat and lng are provided, calculate distance
    if (req.query.lat && req.query.lng) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      
      const restaurantsWithDistance = restaurants.map(r => {
        const rObj = r.toObject();
        if (r.location && r.location.coordinates) {
            rObj.distance = getDistance(lat, lng, r.location.coordinates[1], r.location.coordinates[0]);
        } else if (r.lat && r.lng) {
            rObj.distance = getDistance(lat, lng, r.lat, r.lng);
        }
        return rObj;
      });
      
      return res.status(200).json({
        success: true,
        count: restaurantsWithDistance.length,
        data: restaurantsWithDistance
      });
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get nearby restaurants
 */
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
    }

    const restaurants = await Restaurant.find();
    
    const nearbyRestaurants = restaurants.map(r => {
      const rObj = r.toObject();
      if (r.location && r.location.coordinates) {
          rObj.distance = getDistance(
              parseFloat(lat), 
              parseFloat(lng), 
              r.location.coordinates[1], 
              r.location.coordinates[0]
          );
      } else if (r.lat && r.lng) {
          rObj.distance = getDistance(parseFloat(lat), parseFloat(lng), r.lat, r.lng);
      }
      return rObj;
    })
    .filter(r => r.distance != null && r.distance <= parseFloat(radius))
    .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: nearbyRestaurants.length,
      data: nearbyRestaurants
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single restaurant
 */
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
