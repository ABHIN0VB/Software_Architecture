/* ============================================================
   FeastFleet — Personal Food Agent Service (Feature 1)
   Multi-step reasoning: intent → search → filter → rank → cart
   ============================================================ */

const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// ── INTENT PARSER ──
function parseIntent(message) {
  const msg = message.toLowerCase();
  const intent = {
    budget: null,
    excludedProteins: [],
    preferredProteins: [],
    mood: [],
    isVeg: null,
    cuisineHints: [],
    mealType: null,
  };

  // Budget extraction: "₹250", "250 rupees", "under 300", "within 200"
  const budgetMatch = msg.match(/(?:₹|rs\.?|rupees?|under|within|budget|have|max)\s*(\d+)/i)
    || msg.match(/(\d+)\s*(?:₹|rs\.?|rupees?|bucks?)/i);
  if (budgetMatch) intent.budget = parseInt(budgetMatch[1]);

  // Protein exclusions: "no chicken", "don't want chicken", "not chicken", "avoid beef"
  const exclusionMatch = msg.match(/(?:no|don't want|not|avoid|without|except)\s+(\w+)/ig) || [];
  exclusionMatch.forEach(match => {
    const word = match.replace(/(?:no|don't want|not|avoid|without|except)\s+/i, '').trim();
    if (['chicken', 'beef', 'mutton', 'fish', 'pork', 'egg', 'paneer', 'veg', 'meat'].includes(word)) {
      intent.excludedProteins.push(word);
    }
  });

  // Dietary preference
  if (msg.includes('vegetarian') || msg.includes('veg only') || msg.includes('no meat') || msg.includes('plant based')) {
    intent.isVeg = true;
  } else if (msg.includes('non-veg') || msg.includes('non veg') || msg.includes('meat')) {
    intent.isVeg = false;
  }

  // Mood / flavor profile
  const moods = ['spicy', 'sweet', 'sour', 'mild', 'hot', 'crispy', 'grilled', 'fried', 'healthy', 'light', 'heavy', 'filling', 'creamy', 'tangy'];
  moods.forEach(m => { if (msg.includes(m)) intent.mood.push(m); });

  // High protein flag
  if (msg.includes('high protein') || msg.includes('protein') || msg.includes('gym') || msg.includes('fitness')) {
    intent.preferredProteins = ['chicken', 'beef', 'mutton', 'fish', 'egg', 'paneer', 'soya'];
  }

  // Cuisine hints
  const cuisines = ['indian', 'chinese', 'italian', 'japanese', 'mexican', 'arabic', 'kerala', 'biryani', 'pizza', 'burger', 'sushi', 'noodles'];
  cuisines.forEach(c => { if (msg.includes(c)) intent.cuisineHints.push(c); });

  // Meal type
  if (msg.includes('breakfast')) intent.mealType = 'breakfast';
  else if (msg.includes('lunch')) intent.mealType = 'lunch';
  else if (msg.includes('dinner')) intent.mealType = 'dinner';
  else if (msg.includes('snack')) intent.mealType = 'snack';
  else if (msg.includes('dessert') || msg.includes('sweet')) intent.mealType = 'dessert';

  return intent;
}

// ── SCORE AN ITEM AGAINST INTENT ──
function scoreItem(item, intent) {
  let score = 0;
  const name = (item.name || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const text = name + ' ' + desc;

  // Mood matching
  intent.mood.forEach(m => {
    if (text.includes(m)) score += 15;
  });

  // High protein score
  if (intent.preferredProteins.length > 0) {
    intent.preferredProteins.forEach(p => {
      if (text.includes(p)) score += 20;
    });
  }

  // Vegetarian match
  if (intent.isVeg === true && item.isVeg) score += 25;
  if (intent.isVeg === false && !item.isVeg) score += 25;

  // Cuisine match
  const restaurantCuisine = (item.restaurant?.cuisine || []).join(' ').toLowerCase();
  intent.cuisineHints.forEach(c => {
    if (restaurantCuisine.includes(c) || text.includes(c)) score += 20;
  });

  // Budget fit (prefer items that leave room for delivery fee)
  if (intent.budget) {
    const budget = intent.budget;
    const price = item.price;
    const deliveryFee = item.restaurant?.deliveryFee || 49;
    const totalCost = price + deliveryFee;

    if (totalCost <= budget) score += 30;
    else if (price <= budget) score += 15; // Fits if we don't count delivery
    else score -= 50; // Over budget
  }

  // Popularity boost
  score += Math.min((item.popularity || 0) * 2, 10);
  score += Math.min((item.restaurant?.rating || 0) * 3, 15);

  return score;
}

// ── MAIN FOOD AGENT FUNCTION ──
const runFoodAgent = async (message) => {
  try {
    const intent = parseIntent(message);

    // Build exclusion regex from excluded proteins
    const exclusionRegexes = intent.excludedProteins.map(p => new RegExp(p, 'i'));

    // Query menu items
    const query = {};
    if (intent.isVeg !== null) query.isVeg = intent.isVeg;
    if (intent.budget) query.price = { $lte: intent.budget };
    if (intent.mealType) query.category = { $regex: new RegExp(intent.mealType, 'i') };

    let items = await MenuItem.find(query).populate('restaurant').limit(200);

    // Filter out excluded proteins from name/description
    if (exclusionRegexes.length > 0) {
      items = items.filter(item => {
        const text = (item.name + ' ' + (item.description || '')).toLowerCase();
        return !exclusionRegexes.some(rx => rx.test(text));
      });
    }

    // Score and rank
    const scored = items
      .map(item => ({ item, score: scoreItem(item, intent) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    if (scored.length === 0) {
      return {
        success: false,
        message: 'No matches found for your constraints.',
        intent,
        suggestions: []
      };
    }

    // Group by restaurant and pick best per restaurant (max 3 restaurants)
    const byRestaurant = {};
    scored.forEach(({ item, score }) => {
      const rName = item.restaurant?.name || 'Unknown';
      if (!byRestaurant[rName]) byRestaurant[rName] = [];
      byRestaurant[rName].push({ item, score });
    });

    const topRestaurants = Object.entries(byRestaurant)
      .sort((a, b) => b[1][0].score - a[1][0].score)
      .slice(0, 3);

    const suggestions = topRestaurants.map(([restName, entries]) => {
      const best = entries[0].item;
      const deliveryFee = best.restaurant?.deliveryFee || 49;
      const total = best.price + deliveryFee;
      return {
        restaurant: restName,
        restaurantRating: best.restaurant?.rating || 4.0,
        deliveryTime: best.restaurant?.deliveryTime || '25-35 min',
        deliveryFee,
        item: {
          id: best._id,
          name: best.name,
          description: best.description,
          price: best.price,
          isVeg: best.isVeg,
          image: best.image,
          category: best.category,
        },
        totalWithDelivery: total,
        fitsInBudget: intent.budget ? total <= intent.budget : true,
        matchScore: entries[0].score,
      };
    });

    // Build natural language reasoning summary
    const reasoningParts = [];
    if (intent.budget) reasoningParts.push(`budget ₹${intent.budget}`);
    if (intent.mood.length > 0) reasoningParts.push(intent.mood.join(', '));
    if (intent.excludedProteins.length > 0) reasoningParts.push(`excluded: ${intent.excludedProteins.join(', ')}`);
    if (intent.isVeg === true) reasoningParts.push('vegetarian');
    if (intent.preferredProteins.length > 0) reasoningParts.push('high protein');

    return {
      success: true,
      intent,
      reasoning: reasoningParts.join(' • '),
      suggestions,
      topPick: suggestions[0] || null,
    };
  } catch (err) {
    console.error('Food agent error:', err);
    throw new Error('Food agent failed: ' + err.message);
  }
};

module.exports = { runFoodAgent, parseIntent };
