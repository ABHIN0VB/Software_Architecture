const router = require('express').Router();
const { getMenuItem, getMenuByRestaurant } = require('../controllers/menuController');

router.get('/item/:id', getMenuItem);
router.get('/:restaurantId', getMenuByRestaurant);

module.exports = router;
