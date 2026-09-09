const router = require('express').Router();
const { placeOrder, getOrders, getOrder, updateOrderStatus, trackOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.get('/:id/track', protect, trackOrder);

module.exports = router;
