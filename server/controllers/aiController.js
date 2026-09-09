const recommendationService = require('../services/recommendationService');
const searchService = require('../services/searchService');
const chatbotService = require('../services/chatbotService');
const ingredientService = require('../services/ingredientService');

/**
 * Get personalized recommendations
 * @route GET /api/ai/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const recommendations = await recommendationService.getRecommendations(userId);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

/**
 * Smart search via natural language
 * @route GET /api/ai/search
 */
exports.smartSearch = async (req, res) => {
  try {
    const { q, lat, lng } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    const results = await searchService.smartSearch(q, userLat, userLng);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Process chatbot message
 * @route POST /api/ai/chat
 */
exports.chat = async (req, res) => {
  try {
    const { message, activeOrder } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const userId = req.user ? req.user._id : null;
    const response = await chatbotService.processMessage(message, userId, activeOrder);
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Chat processing failed',
      error: error.message
    });
  }
};

/**
 * Predict ingredients for food item(s)
 * @route POST /api/ai/predict-ingredients
 */
exports.predictIngredients = async (req, res) => {
  try {
    const { name, description, cuisine, items } = req.body;

    // Batch prediction
    if (Array.isArray(items) && items.length > 0) {
      const results = items.map(it => ingredientService.predictIngredients(it.name, it.description, it.cuisine));
      return res.status(200).json({
        success: true,
        data: results
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Dish name is required for ingredient prediction'
      });
    }

    const prediction = ingredientService.predictIngredients(name, description, cuisine);

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI ingredient prediction failed',
      error: error.message
    });
  }
};

