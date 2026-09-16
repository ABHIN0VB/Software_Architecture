/* ============================================================
   FeastFleet — AI Budget Optimizer Service (Feature 2)
   Constraint-satisfaction optimizer: budget + people + cuisine
   ============================================================ */

const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

const PLATFORM_FEE_RATE = 0.05; // 5% platform fee

const runBudgetOptimizer = async ({ budget, people = 1, cuisine, mealStructure = ['main', 'drink'] }) => {
  try {
    // Build restaurant query
    const restQuery = {};
    if (cuisine) restQuery.cuisine = { $regex: new RegExp(cuisine, 'i') };
    const restaurants = await Restaurant.find(restQuery).limit(20);
    if (!restaurants.length) {
      return { success: false, message: 'No restaurants found for your preferences.' };
    }

    const results = [];

    for (const rest of restaurants) {
      const allItems = await MenuItem.find({ restaurant: rest._id, isAvailable: { $ne: false } });
      if (!allItems.length) continue;

      // Categorize items
      const categorized = {
        main: allItems.filter(i => /main|curry|biryani|burger|pizza|rice|noodles|parotta|ramen|sushi|bread|pasta|wrap/i.test(i.category + ' ' + i.name)),
        side: allItems.filter(i => /side|starter|snack|fries|salad|soup|tempura/i.test(i.category + ' ' + i.name)),
        drink: allItems.filter(i => /drink|beverage|shake|coffee|juice|tea|cola|lassi/i.test(i.category + ' ' + i.name)),
        dessert: allItems.filter(i => /dessert|sweet|cake|ice cream|pastry/i.test(i.category + ' ' + i.name)),
      };

      // Fallback: if no matches for a category, use cheapest available items
      if (!categorized.main.length) categorized.main = [...allItems].sort((a, b) => b.price - a.price).slice(0, 3);
      if (!categorized.side.length) categorized.side = [...allItems].sort((a, b) => a.price - b.price).slice(0, 3);
      if (!categorized.drink.length) categorized.drink = [...allItems].sort((a, b) => a.price - b.price).slice(0, 3);

      // Build the cheapest valid meal combo per person
      const combo = {};
      let comboFoodCost = 0;
      let valid = true;

      for (const type of mealStructure) {
        const pool = categorized[type] || [];
        if (!pool.length) { valid = false; break; }
        // Cheapest option for this category
        const cheapest = pool.sort((a, b) => a.price - b.price)[0];
        combo[type] = cheapest;
        comboFoodCost += cheapest.price;
      }

      if (!valid) continue;

      const foodSubtotal = comboFoodCost * people;
      const deliveryFee = rest.deliveryFee || 49;
      const platformFee = Math.round(foodSubtotal * PLATFORM_FEE_RATE);
      const grandTotal = foodSubtotal + deliveryFee + platformFee;
      const perPerson = Math.round(grandTotal / people);
      const fitsInBudget = grandTotal <= budget;
      const savings = Math.max(0, budget - grandTotal);

      results.push({
        restaurant: rest.name,
        restaurantRating: rest.rating || 4.0,
        deliveryTime: rest.deliveryTime || '25-35 min',
        cuisine: rest.cuisine || [],
        combo,
        foodSubtotal,
        deliveryFee,
        platformFee,
        grandTotal,
        perPerson,
        fitsInBudget,
        savings,
        people,
      });
    }

    if (!results.length) {
      return { success: false, message: 'Could not build a valid meal combo. Try increasing your budget.' };
    }

    // Sort: budget-fitting first, then by lowest grand total
    results.sort((a, b) => {
      if (a.fitsInBudget && !b.fitsInBudget) return -1;
      if (!a.fitsInBudget && b.fitsInBudget) return 1;
      return a.grandTotal - b.grandTotal;
    });

    const topOptions = results.slice(0, 3);
    const bestOption = topOptions[0];

    return {
      success: true,
      budget,
      people,
      cuisine: cuisine || 'Any',
      mealStructure,
      topOptions,
      bestOption,
      summary: `Best pick: ${bestOption.restaurant} — ₹${bestOption.grandTotal} total (₹${bestOption.perPerson}/person)`
    };
  } catch (err) {
    console.error('Budget optimizer error:', err);
    throw new Error('Budget optimizer failed: ' + err.message);
  }
};

module.exports = { runBudgetOptimizer };
