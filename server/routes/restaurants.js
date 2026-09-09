const router = require('express').Router();
const { getRestaurants, getNearbyRestaurants, getRestaurant } = require('../controllers/restaurantController');

router.get('/', getRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/:id', getRestaurant);

module.exports = router;
