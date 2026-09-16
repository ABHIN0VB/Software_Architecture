const recommendationService = require('../services/recommendationService');
const searchService = require('../services/searchService');
const chatbotService = require('../services/chatbotService');
const ingredientService = require('../services/ingredientService');
const { runFoodAgent } = require('../services/foodAgentService');
const { runBudgetOptimizer } = require('../services/budgetOptimizerService');
const { runGroupOrder } = require('../services/groupOrderService');
const { runVisualSearch } = require('../services/visualSearchService');

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
};/**
 * Personal Food Agent — understands natural language constraints
 * @route POST /api/ai/food-agent
 */
exports.foodAgent = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    const result = await runFoodAgent(message);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Food agent failed', error: error.message });
  }
};

/**
 * AI Budget Optimizer — finds best meal combo within a budget
 * @route POST /api/ai/budget-optimize
 */
exports.budgetOptimize = async (req, res) => {
  try {
    const { budget, people, cuisine, mealStructure } = req.body;
    if (!budget) return res.status(400).json({ success: false, message: 'Budget is required' });
    const result = await runBudgetOptimizer({ budget: parseFloat(budget), people: parseInt(people) || 1, cuisine, mealStructure });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Budget optimizer failed', error: error.message });
  }
};

/**
 * Group Order Agent — multi-constraint optimizer for group dining
 * @route POST /api/ai/group-order
 */
exports.groupOrder = async (req, res) => {
  try {
    const { members, totalBudget, maxDeliveryMin } = req.body;
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: 'members array is required' });
    }
    const result = await runGroupOrder({ members, totalBudget: parseFloat(totalBudget) || 800, maxDeliveryMin: parseInt(maxDeliveryMin) || 35 });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Group order failed', error: error.message });
  }
};

/**
 * Visual Food Search — find dishes by description/image context
 * @route POST /api/ai/visual-search
 */
exports.visualSearch = async (req, res) => {
  try {
    const { dishQuery, colorHint } = req.body;
    if (!dishQuery) return res.status(400).json({ success: false, message: 'dishQuery is required' });
    const result = await runVisualSearch({ dishQuery, colorHint });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Visual search failed', error: error.message });
  }
};
