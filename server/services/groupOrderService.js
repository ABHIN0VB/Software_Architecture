/* ============================================================
   FeastFleet — Group Order Agent Service (Feature 5)
   Multi-constraint optimizer: N members, individual preferences
   ============================================================ */

const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// ── SCORE RESTAURANT + MEAL PLAN AGAINST ALL MEMBERS ──
function scoreRestaurantForGroup(rest, items, members) {
  let totalScore = 0;

  // Rating boost
  totalScore += (rest.rating || 4.0) * 10;

  const itemNames = items.map(i => (i.name + ' ' + (i.description || '')).toLowerCase());
  const itemIsVeg = items.map(i => i.isVeg);

  members.forEach(member => {
    let memberScore = 0;
    const pref = (member.preference || '').toLowerCase();
    const exclusions = (member.exclusions || '').toLowerCase();

    // Veg constraint
    if (member.isVeg) {
      const hasVegOption = itemIsVeg.some(v => v);
      if (!hasVegOption) memberScore -= 100; // disqualify if no veg option
      else memberScore += 20;
    }

    // Cuisine preference
    const cuisines = (rest.cuisine || []).join(' ').toLowerCase();
    if (pref && cuisines.includes(pref)) memberScore += 30;
    if (pref && itemNames.some(n => n.includes(pref))) memberScore += 20;

    // Spicy preference
    if (pref.includes('spicy') && itemNames.some(n => n.includes('spicy') || n.includes('chili') || n.includes('pepper'))) {
      memberScore += 15;
    }

    // Exclusions (no onion, no garlic, etc.)
    if (exclusions) {
      const excWords = exclusions.split(/[,\s]+/).filter(Boolean);
      const hasExcluded = itemNames.some(n => excWords.some(e => n.includes(e)));
      if (hasExcluded) memberScore -= 20;
    }

    totalScore += memberScore;
  });

  return totalScore;
}

// ── ASSIGN BEST DISH TO EACH MEMBER ──
function assignDishes(items, members) {
  const assignments = [];
  const usedItemIds = new Set();

  members.forEach(member => {
    const pref = (member.preference || '').toLowerCase();
    const isVeg = member.isVeg;
    const budget = member.budget || Infinity;
    const exclusions = (member.exclusions || '').toLowerCase();
    const excWords = exclusions.split(/[,\s]+/).filter(Boolean);

    // Filter eligible items for this member
    let eligible = items.filter(item => {
      const text = (item.name + ' ' + (item.description || '')).toLowerCase();
      if (isVeg && !item.isVeg) return false;
      if (item.price > budget) return false;
      if (excWords.some(e => e && text.includes(e))) return false;
      return true;
    });

    if (!eligible.length) eligible = items; // fallback to all

    // Score each item for this member
    const scored = eligible.map(item => {
      const text = (item.name + ' ' + (item.description || '')).toLowerCase();
      let score = 0;
      if (pref) {
        pref.split(/\s+/).forEach(w => { if (text.includes(w)) score += 10; });
      }
      if (!usedItemIds.has(item._id.toString())) score += 5; // prefer variety
      score += (item.popularity || 0);
      return { item, score };
    }).sort((a, b) => b.score - a.score);

    const picked = scored[0]?.item || items[0];
    usedItemIds.add(picked._id.toString());

    assignments.push({
      member: member.name,
      dish: picked.name,
      price: picked.price,
      isVeg: picked.isVeg,
      image: picked.image,
      category: picked.category,
    });
  });

  return assignments;
}

// ── MAIN GROUP ORDER FUNCTION ──
const runGroupOrder = async ({ members, totalBudget = 800, maxDeliveryMin = 35 }) => {
  try {
    const restaurants = await Restaurant.find();
    const results = [];

    const hasVegMember = members.some(m => m.isVeg);

    for (const rest of restaurants) {
      // Delivery time check
      const deliveryTimeStr = rest.deliveryTime || '30-40 min';
      const maxDelivery = parseInt(deliveryTimeStr.split('-')[1]) || 40;
      if (maxDelivery > maxDeliveryMin) continue;

      const items = await MenuItem.find({ restaurant: rest._id, isAvailable: { $ne: false } });
      if (!items.length) continue;

      // Must have veg options if any veg member
      if (hasVegMember && !items.some(i => i.isVeg)) continue;

      // Assign dishes to each member
      const assignments = assignDishes(items, members);
      const foodSubtotal = assignments.reduce((s, a) => s + a.price, 0);
      const deliveryFee = rest.deliveryFee || 49;
      const platformFee = Math.round(foodSubtotal * 0.05);
      const grandTotal = foodSubtotal + deliveryFee + platformFee;

      if (grandTotal > totalBudget * 1.15) continue; // allow 15% over as close match

      const groupScore = scoreRestaurantForGroup(rest, items, members);
      const perPersonSplit = Math.round(grandTotal / members.length);

      results.push({
        restaurant: rest.name,
        restaurantRating: rest.rating || 4.0,
        deliveryTime: rest.deliveryTime || '30-40 min',
        cuisine: rest.cuisine || [],
        assignments,
        foodSubtotal,
        deliveryFee,
        platformFee,
        grandTotal,
        perPersonSplit,
        fitsInBudget: grandTotal <= totalBudget,
        groupScore,
      });
    }

    if (!results.length) {
      return {
        success: false,
        message: 'No restaurant could satisfy all group constraints. Try relaxing dietary restrictions or increasing budget.'
      };
    }

    // Sort: fits budget first, then best group score
    results.sort((a, b) => {
      if (a.fitsInBudget && !b.fitsInBudget) return -1;
      if (!a.fitsInBudget && b.fitsInBudget) return 1;
      return b.groupScore - a.groupScore;
    });

    const best = results[0];

    return {
      success: true,
      members: members.length,
      totalBudget,
      maxDeliveryMin,
      topOptions: results.slice(0, 3),
      bestOption: best,
      summary: `Best for your group: ${best.restaurant} — ₹${best.grandTotal} total (₹${best.perPersonSplit}/person)`
    };
  } catch (err) {
    console.error('Group order error:', err);
    throw new Error('Group order failed: ' + err.message);
  }
};

module.exports = { runGroupOrder };
