/* ============================================================
   FeastFleet — Visual Search Service (Feature 4)
   See Food → Find Food → Order
   Semantic dish-name matcher against entire menu DB
   ============================================================ */

const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Dish keyword semantic map — maps visual/descriptive terms to menu search terms
const VISUAL_SEMANTICS = {
  'rice': ['rice', 'biryani', 'fried rice', 'pulao'],
  'noodles': ['noodles', 'ramen', 'pasta', 'spaghetti', 'hakka'],
  'bread': ['naan', 'roti', 'chapati', 'parotta', 'bread', 'bun'],
  'burger': ['burger', 'sandwich', 'wrap'],
  'pizza': ['pizza', 'flatbread'],
  'curry': ['curry', 'masala', 'gravy', 'stew', 'korma', 'tikka'],
  'soup': ['soup', 'broth', 'rasam', 'dal'],
  'salad': ['salad', 'green', 'slaw'],
  'chicken': ['chicken', 'poultry'],
  'beef': ['beef', 'steak', 'mutton', 'lamb'],
  'fish': ['fish', 'prawn', 'seafood', 'shrimp'],
  'paneer': ['paneer', 'cottage cheese'],
  'eggs': ['egg', 'omelette', 'omelette'],
  'dessert': ['cake', 'ice cream', 'brownie', 'sweet', 'dessert', 'pastry'],
  'coffee': ['coffee', 'latte', 'cappuccino', 'espresso'],
  'shake': ['shake', 'milkshake', 'smoothie'],
  'fried': ['fried', 'crispy', 'crunchy', '65', '555'],
  'grilled': ['grilled', 'tandoori', 'bbq', 'roasted', 'al faham'],
  'spicy': ['spicy', 'chili', 'pepper', 'masala', 'hot'],
  'biryani': ['biryani', 'dum', 'rice'],
  'sushi': ['sushi', 'maki', 'nigiri', 'tempura'],
};

// Color-to-dish semantic hints
const COLOR_HINTS = {
  'red': ['tomato', 'chili', 'masala', 'curry', 'tikka', 'schezwan'],
  'orange': ['tikka', 'tandoori', 'biryani', 'curry', 'butter chicken'],
  'green': ['salad', 'mint', 'pesto', 'veg', 'spinach', 'dal'],
  'brown': ['chocolate', 'biryani', 'coffee', 'beef', 'roasted'],
  'white': ['rice', 'milk', 'cream', 'white sauce', 'vanilla'],
  'yellow': ['turmeric', 'egg', 'dal', 'corn', 'curry'],
};

// ── SCORE AN ITEM AGAINST SEARCH TERMS ──
function scoreItem(item, searchTerms) {
  let score = 0;
  const name = (item.name || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();
  const text = name + ' ' + desc + ' ' + cat;

  searchTerms.forEach(term => {
    if (name.includes(term)) score += 30;       // Strong: name match
    else if (desc.includes(term)) score += 15;  // Medium: description match
    else if (cat.includes(term)) score += 10;   // Weak: category match
  });

  // Popularity boost
  score += Math.min((item.popularity || 0) * 2, 10);

  return score;
}

// ── EXPAND QUERY TO SEMANTIC TERMS ──
function expandQuery(dishQuery, colorHint) {
  const q = dishQuery.toLowerCase();
  const searchTerms = new Set();

  // Direct words from query
  q.split(/\s+/).forEach(w => { if (w.length > 2) searchTerms.add(w); });

  // Semantic expansion
  Object.entries(VISUAL_SEMANTICS).forEach(([key, synonyms]) => {
    if (q.includes(key) || synonyms.some(s => q.includes(s))) {
      synonyms.forEach(s => searchTerms.add(s));
      searchTerms.add(key);
    }
  });

  // Color hints
  if (colorHint) {
    const color = colorHint.toLowerCase();
    const colorTerms = COLOR_HINTS[color] || [];
    colorTerms.forEach(t => searchTerms.add(t));
  }

  return Array.from(searchTerms);
}

// ── CANDIDATE DISH OPTIONS (for visual picker UI) ──
const VISUAL_CANDIDATES = [
  { label: 'Grilled / Tandoori Chicken', query: 'grilled chicken tandoori', emoji: '🍗' },
  { label: 'Biryani / Rice Dish', query: 'biryani rice', emoji: '🍚' },
  { label: 'Burger / Sandwich', query: 'burger sandwich', emoji: '🍔' },
  { label: 'Noodles / Pasta', query: 'noodles pasta', emoji: '🍜' },
  { label: 'Pizza', query: 'pizza', emoji: '🍕' },
  { label: 'Curry / Gravy Dish', query: 'curry masala gravy', emoji: '🍛' },
  { label: 'Fried Snack / Starter', query: 'fried crispy starter', emoji: '🍟' },
  { label: 'Dessert / Sweet', query: 'dessert cake sweet', emoji: '🍰' },
  { label: 'Shake / Beverage', query: 'shake drink beverage', emoji: '🥤' },
  { label: 'Seafood', query: 'fish prawn seafood', emoji: '🦐' },
];

const runVisualSearch = async ({ dishQuery, colorHint }) => {
  try {
    const searchTerms = expandQuery(dishQuery, colorHint);

    // Score all available menu items
    const allItems = await MenuItem.find({ isAvailable: { $ne: false } }).populate('restaurant');

    const scored = allItems
      .map(item => ({ item, score: scoreItem(item, searchTerms) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    if (!scored.length) {
      return {
        success: false,
        message: 'No matching dishes found. Try different keywords.',
        candidates: VISUAL_CANDIDATES,
      };
    }

    // Group by restaurant — pick top item per restaurant
    const byRestaurant = {};
    scored.forEach(({ item, score }) => {
      const rName = item.restaurant?.name || 'Unknown';
      if (!byRestaurant[rName]) byRestaurant[rName] = { item, score, restaurant: item.restaurant };
    });

    const matches = Object.values(byRestaurant)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((entry, i) => ({
        rank: i + 1,
        restaurant: entry.restaurant?.name || 'Unknown',
        restaurantRating: entry.restaurant?.rating || 4.0,
        deliveryTime: entry.restaurant?.deliveryTime || '25-35 min',
        deliveryFee: entry.restaurant?.deliveryFee || 49,
        item: {
          name: entry.item.name,
          description: entry.item.description,
          price: entry.item.price,
          isVeg: entry.item.isVeg,
          image: entry.item.image,
          category: entry.item.category,
        },
        matchScore: entry.score,
        isClosestMatch: i === 0,
      }));

    return {
      success: true,
      detectedDish: dishQuery,
      searchTerms: searchTerms.slice(0, 8),
      matches,
      topMatch: matches[0],
      candidates: VISUAL_CANDIDATES, // for UI dish picker
    };
  } catch (err) {
    console.error('Visual search error:', err);
    throw new Error('Visual search failed: ' + err.message);
  }
};

module.exports = { runVisualSearch, VISUAL_CANDIDATES };
