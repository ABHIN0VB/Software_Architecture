const Order = require('../models/Order');
const ingredientService = require('./ingredientService');

/**
 * Processes a chat message and returns an appropriate response
 * @param {string} message - The user's message
 * @param {string} userId - Optional user ID
 * @returns {Promise<{reply: string, type: string, data?: any}>}
 */
const processMessage = async (message, userId, activeOrder) => {
  try {
    const msg = message.toLowerCase().trim();

    // AI Ingredient Prediction / Recipe inquiry
    if (msg.match(/(ingredient|ingredients|what is in|what's in|what is inside|recipe|allergens|allergy)/)) {
      // Clean query to isolate food name
      let dishName = msg
        .replace(/(what is inside|what's inside|what are the ingredients in|what are the ingredients of|what is in|what's in|tell me the ingredients of|ingredients of|ingredients in|ingredients for|ingredient of|allergens in|recipe of|recipe for|does .* have)/gi, '')
        .replace(/(the|food|item|please|can you tell me|\?)/gi, '')
        .trim();

      if (!dishName || dishName.length < 2) {
        dishName = 'Smash Burger';
      }

      // Format dishName with Title Case for display
      const formattedTitle = dishName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      const prediction = ingredientService.predictIngredients(dishName, '', '');
      const ingList = prediction.predictedIngredients.map(i => `• ${i}`).join('\n');
      const allergenList = prediction.allergens.join(', ');

      return {
        reply: `✨ **AI Ingredient Prediction for "${formattedTitle}"** (${prediction.aiConfidence}% AI Confidence)\n\n🥗 **Predicted Ingredients:**\n${ingList}\n\n⚠️ **Allergens Detected:** ${allergenList}\n🏷️ **Dietary Profile:** ${prediction.dietary}\n🌟 **Flavor Notes:** ${prediction.flavorProfile}`,
        type: 'ai_ingredient_prediction',
        data: prediction
      };
    }

    // Greeting
    if (msg.match(/\b(hi|hello|hey|greetings|hola)\b/)) {
      return {
        reply: "Hello there! 👋 Welcome to FeastFleet. How can I help you satisfy your cravings today?",
        type: 'text'
      };
    }

    // Order status / Track Order
    if (msg.match(/(where is my order|track order|track my order|order status|where.*order|track)/)) {
      // Look up in database if userId exists
      let order = null;
      if (userId) {
        order = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
      }

      // If not in DB yet, check activeOrder passed from client session
      if (!order && activeOrder) {
        order = activeOrder;
      }

      if (!order) {
        // If DB has any order from recent activity, fetch most recent
        order = await Order.findOne().sort({ createdAt: -1 });
      }

      if (!order) {
        if (!userId) {
          return {
            reply: "I'd love to help you track your order! Please sign in and place an order to track live delivery. 🔑",
            type: 'text'
          };
        }
        return {
          reply: "You're signed in, but you haven't placed an order yet! 🍕 Check out our restaurants page to get delicious food delivered.",
          type: 'text'
        };
      }

      const restNames = order.restaurants && order.restaurants.length > 0 
        ? order.restaurants.join(', ')
        : (order.items && order.items[0] ? order.items[0].restaurant : 'Restaurant');

      const rider = order.deliveryPartner ? order.deliveryPartner.name : 'Rahul';
      const riderPhone = order.deliveryPartner ? order.deliveryPartner.phone : '+91 9847123456';

      // Compute elapsed real-time from createdAt
      const createdTime = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
      const elapsedRealSec = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
      const TOTAL_REAL_SECONDS = 300; // 5 real minutes
      const realSecondsLeft = Math.max(0, TOTAL_REAL_SECONDS - elapsedRealSec);
      const appMinutesRemaining = Math.max(0, Math.ceil((realSecondsLeft / 60) * 5));
      const realMin = Math.floor(realSecondsLeft / 60);
      const realSec = realSecondsLeft % 60;
      const formattedRealTimer = `${String(realMin).padStart(2, '0')}:${String(realSec).padStart(2, '0')}`;

      let currentStatus = 'Confirmed';
      if (realSecondsLeft <= 0) {
        currentStatus = 'DELIVERED 🎉';
      } else if (elapsedRealSec >= 180) {
        currentStatus = 'OUT FOR DELIVERY 🏍️';
      } else if (elapsedRealSec >= 60) {
        currentStatus = 'PREPARING FOOD 👨‍🍳';
      } else {
        currentStatus = 'ORDER CONFIRMED 📋';
      }

      const timeText = realSecondsLeft <= 0 
        ? 'Delivered to your doorstep! 🎉' 
        : `~${appMinutesRemaining} app mins (${formattedRealTimer} real-time remaining)`;

      return {
        reply: `📦 **Live Order Tracking**\n• Order ID: #${order.orderId || 'FF-ACTIVE'}\n• Restaurant: ${restNames}\n• Status: **${currentStatus}**\n• 🛵 Delivery Partner: **${rider}** (${riderPhone})\n• ⏱️ Estimated Time: **${timeText}**\n• Total: ₹${order.total || 0}`,
        type: 'order_status',
        data: order
      };
    }

    // Menu inquiry
    if (msg.match(/(what do you have|show menu|recommend|what is good|hungry|food)/)) {
      return {
        reply: "We have awesome delicacies ready for you! 🍔 Juicy burgers at Burger Palace, authentic Biryani at Royal Biryani House, and fresh sushi at Sushi Master. What cuisine are you in the mood for?",
        type: 'menu_suggestion'
      };
    }

    // Delivery
    if (msg.match(/(delivery time|how long|delivery fee|delivery)/)) {
      return {
        reply: "Our standard delivery time in Kochi is usually 25-35 minutes! 🛵 Delivery fee is just ₹49 (or free for select promos).",
        type: 'text'
      };
    }

    // Help
    if (msg.match(/(help|support|problem|issue)/)) {
      return {
        reply: "I'm here to help! 🆘 You can ask me:\n• 'Track my order' - Check real-time order status\n• 'Show menu' - Explore popular cuisines\n• 'Delivery time' - Delivery estimates and fees\n• Or browse restaurants directly from the top menu!",
        type: 'text'
      };
    }

    // Operating hours
    if (msg.match(/(hours|open|timing|timing.*open)/)) {
      return {
        reply: "FeastFleet partner restaurants deliver from 8:00 AM to 12:00 Midnight every day in Kochi and across Kerala! 🕒",
        type: 'text'
      };
    }

    // Default response
    return {
      reply: "I'm here to assist you! Try asking 'Track my order', 'Show menu', or 'Help' to see available commands. 🍕",
      type: 'text'
    };

  } catch (error) {
    console.error('Chatbot process error:', error);
    return {
      reply: "Oops! I hit a snag while processing your request. Please try again in a moment. 🤖",
      type: 'error'
    };
  }
};

module.exports = {
  processMessage
};
