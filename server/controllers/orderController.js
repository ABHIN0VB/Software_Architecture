const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

/**
 * Place a new order
 */
exports.placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, subtotal, deliveryFee, total, restaurants } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide items for the order' });
    }

    // Auto-calculate totals if not passed
    let calculatedSubtotal = 0;
    const formattedItems = [];
    const restaurantSet = new Set();

    for (const item of items) {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty || item.quantity) || 1;
      calculatedSubtotal += price * qty;
      const restName = item.restaurant || 'FeastFleet Partner';
      restaurantSet.add(restName);

      formattedItems.push({
        menuItem: item.menuItem || item.id || null,
        restaurant: restName,
        name: item.name || 'Delicious Food',
        price: price,
        qty: qty,
        image: item.image || ''
      });

      // Increment MenuItem popularity if id is valid mongo id
      if (item.menuItem || item.id) {
        try {
          await MenuItem.findByIdAndUpdate(item.menuItem || item.id, { $inc: { popularity: qty } });
        } catch (e) {
          // Non-critical, ignore id mismatch for seed items
        }
      }
    }

    const finalSubtotal = subtotal ? Number(subtotal) : calculatedSubtotal;
    const finalDeliveryFee = deliveryFee !== undefined ? Number(deliveryFee) : 49;
    const finalTotal = total ? Number(total) : (finalSubtotal + finalDeliveryFee);

    const order = await Order.create({
      user: req.user._id || req.user.id,
      items: formattedItems,
      restaurants: restaurants || Array.from(restaurantSet),
      subtotal: finalSubtotal,
      deliveryFee: finalDeliveryFee,
      total: finalTotal,
      deliveryAddress: deliveryAddress || { address: 'MG Road, Kochi, Kerala' },
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'confirmed'
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all orders for current user
 */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id || req.user.id })
      .sort('-createdAt')
      .limit(20);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single order by ID
 */
exports.getOrder = async (req, res) => {
  try {
    const idParam = req.params.id;
    const query = {
      user: req.user._id || req.user.id
    };
    
    // Check if valid ObjectId or orderId string
    if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = idParam;
    } else {
      query.orderId = idParam;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Track order
 */
exports.trackOrder = async (req, res) => {
  try {
    const idParam = req.params.id;
    const query = {
      user: req.user._id || req.user.id
    };

    if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = idParam;
    } else {
      query.orderId = idParam;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let estimatedDeliveryTime = new Date(order.createdAt.getTime() + 40 * 60000);
    
    if (order.status === 'preparing') {
      estimatedDeliveryTime = new Date(Date.now() + 25 * 60000);
    } else if (order.status === 'on_the_way') {
      estimatedDeliveryTime = new Date(Date.now() + 10 * 60000);
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        createdAt: order.createdAt,
        restaurants: order.restaurants,
        total: order.total,
        estimatedDeliveryTime,
        deliveredAt: order.deliveredAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
