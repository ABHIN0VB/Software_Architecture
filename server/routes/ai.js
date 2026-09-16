const express = require('express');
const router = express.Router();
const {
  getRecommendations, smartSearch, chat, predictIngredients,
  foodAgent, budgetOptimize, groupOrder, visualSearch
} = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/search', smartSearch);
router.post('/chat', optionalAuth, chat);
router.post('/predict-ingredients', predictIngredients);
router.post('/food-agent', foodAgent);
router.post('/budget-optimize', budgetOptimize);
router.post('/group-order', groupOrder);
router.post('/visual-search', visualSearch);

module.exports = router;
