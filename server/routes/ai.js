const express = require('express');
const router = express.Router();
const { getRecommendations, smartSearch, chat, predictIngredients } = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/search', smartSearch);
router.post('/chat', optionalAuth, chat);
router.post('/predict-ingredients', predictIngredients);

module.exports = router;
