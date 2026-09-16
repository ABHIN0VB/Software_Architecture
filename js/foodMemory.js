/* ============================================================
   FeastFleet — AI Food Memory Engine (Feature 3)
   Tracks ordering behavior and generates behavioral insights
   ============================================================ */

const FoodMemory = (() => {
  const MEMORY_KEY = 'feastfleet_food_memory';
  const MAX_MEMORY_ENTRIES = 100;

  // ── READ / WRITE ──
  function getMemory() {
    try {
      return JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];
    } catch { return []; }
  }

  function saveMemory(entries) {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(entries.slice(-MAX_MEMORY_ENTRIES)));
  }

  // ── RECORD ORDER ──
  function recordOrder(order) {
    if (!order || !order.items) return;
    const memory = getMemory();
    const now = new Date();

    order.items.forEach(item => {
      memory.push({
        name: item.name,
        restaurant: item.restaurant,
        price: item.price,
        category: (item.category || '').toLowerCase(),
        isVeg: item.isVeg || false,
        timestamp: now.toISOString(),
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        hour: now.getHours(),
      });
    });

    saveMemory(memory);
  }

  // ── AUTO-RECORD FROM localStorage LAST ORDER ──
  function autoRecordLastOrder() {
    try {
      const raw = localStorage.getItem('feastfleet_last_order');
      if (!raw) return;
      const order = JSON.parse(raw);
      if (!order || !order.items) return;

      // Avoid double-recording — check if orderId was already recorded
      const recorded = JSON.parse(localStorage.getItem('feastfleet_memory_recorded_orders') || '[]');
      const orderId = order.orderId;
      if (orderId && recorded.includes(orderId)) return;

      recordOrder(order);

      if (orderId) {
        recorded.push(orderId);
        localStorage.setItem('feastfleet_memory_recorded_orders', JSON.stringify(recorded.slice(-50)));
      }
    } catch (e) { /* silent */ }
  }

  // ── ANALYZE PATTERNS ──
  function analyzePatterns() {
    const memory = getMemory();
    if (!memory.length) return null;

    const now = Date.now();
    const last7Days = memory.filter(e => (now - new Date(e.timestamp).getTime()) < 7 * 24 * 3600 * 1000);
    const last30Days = memory.filter(e => (now - new Date(e.timestamp).getTime()) < 30 * 24 * 3600 * 1000);

    // Most ordered dishes last 30 days
    const dishCount = {};
    last30Days.forEach(e => { dishCount[e.name] = (dishCount[e.name] || 0) + 1; });
    const topDishes = Object.entries(dishCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Most ordered dish recently (7 days)
    const recentDishCount = {};
    last7Days.forEach(e => { recentDishCount[e.name] = (recentDishCount[e.name] || 0) + 1; });
    const recentTopDish = Object.entries(recentDishCount).sort((a, b) => b[1] - a[1])[0];

    // Favorite restaurant
    const restCount = {};
    last30Days.forEach(e => { if (e.restaurant) restCount[e.restaurant] = (restCount[e.restaurant] || 0) + 1; });
    const topRestaurant = Object.entries(restCount).sort((a, b) => b[1] - a[1])[0];

    // Average spend
    const avgSpend = last30Days.length
      ? Math.round(last30Days.reduce((s, e) => s + (e.price || 0), 0) / last30Days.length)
      : 0;

    // Weekday vs weekend preference
    const weekdayOrders = last30Days.filter(e => !['Saturday', 'Sunday'].includes(e.dayOfWeek)).length;
    const weekendOrders = last30Days.filter(e => ['Saturday', 'Sunday'].includes(e.dayOfWeek)).length;
    const preferWeekday = weekdayOrders >= weekendOrders;

    // Peak order time
    const hourBuckets = {};
    last30Days.forEach(e => { hourBuckets[e.hour] = (hourBuckets[e.hour] || 0) + 1; });
    const peakHour = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
    let peakMeal = 'any time';
    if (peakHour) {
      const h = parseInt(peakHour[0]);
      if (h >= 6 && h < 11) peakMeal = 'breakfast';
      else if (h >= 11 && h < 15) peakMeal = 'lunch';
      else if (h >= 15 && h < 18) peakMeal = 'evening snacks';
      else if (h >= 18 && h < 23) peakMeal = 'dinner';
    }

    // Veg vs non-veg tendency
    const vegCount = last30Days.filter(e => e.isVeg).length;
    const nonVegCount = last30Days.filter(e => !e.isVeg).length;
    const dietTendency = vegCount > nonVegCount ? 'vegetarian' : 'non-vegetarian';

    // Repetition alert: same dish ordered 2+ times in 7 days
    const repetitionAlerts = Object.entries(recentDishCount)
      .filter(([, count]) => count >= 2)
      .map(([dish, count]) => ({ dish, count }));

    return {
      totalOrders: memory.length,
      last7DaysOrders: last7Days.length,
      last30DaysOrders: last30Days.length,
      topDishes,
      recentTopDish: recentTopDish ? { name: recentTopDish[0], count: recentTopDish[1] } : null,
      topRestaurant: topRestaurant ? { name: topRestaurant[0], count: topRestaurant[1] } : null,
      avgSpend,
      preferWeekday,
      peakMeal,
      dietTendency,
      repetitionAlerts,
    };
  }

  // ── GENERATE HUMAN-READABLE INSIGHT SUMMARY ──
  function generateInsight() {
    const p = analyzePatterns();
    if (!p || p.totalOrders === 0) {
      return {
        hasData: false,
        message: "No order history yet. Start ordering to build your food profile! 🍽️",
        suggestions: [],
      };
    }

    const insights = [];
    const suggestions = [];

    // Describe ordering habit
    if (p.topDishes.length > 0) {
      insights.push(`Your all-time favourite is **${p.topDishes[0][0]}** (ordered ${p.topDishes[0][1]} times).`);
    }
    if (p.topRestaurant) {
      insights.push(`You order most from **${p.topRestaurant.name}**.`);
    }
    if (p.avgSpend > 0) {
      insights.push(`Your average spend per item is **₹${p.avgSpend}**.`);
    }
    if (p.peakMeal !== 'any time') {
      insights.push(`You usually order during **${p.peakMeal}**.`);
    }
    insights.push(`You tend to prefer **${p.dietTendency}** food.`);

    // Repetition alerts → suggestions for variety
    p.repetitionAlerts.forEach(alert => {
      suggestions.push(`You've had **${alert.dish}** ${alert.count} times this week — want to try something different today? 🔄`);
    });

    // Healthy nudge if avg spend is high
    if (p.avgSpend > 300) {
      suggestions.push(`💡 Your average item spend is ₹${p.avgSpend}. Want me to find great meals under ₹200?`);
    }

    const mainMessage = insights.join(' ') + (suggestions.length ? '' : ' Try something new today!');

    return {
      hasData: true,
      message: mainMessage,
      insights,
      suggestions,
      patterns: p,
    };
  }

  // ── PROACTIVE CHATBOT PROMPT (called on page load) ──
  function getProactiveSuggestion() {
    const p = analyzePatterns();
    if (!p || p.totalOrders < 3) return null;

    // Repetition alert
    if (p.repetitionAlerts.length > 0) {
      const alert = p.repetitionAlerts[0];
      return `🧠 **Memory Insight**: You've ordered **${alert.dish}** ${alert.count}x this week. Want me to suggest something new and equally satisfying?`;
    }

    // Peak meal time nudge
    const now = new Date();
    const hour = now.getHours();
    if (p.peakMeal === 'lunch' && hour >= 11 && hour < 14) {
      return `🧠 **Memory Insight**: It's lunch time — your usual pick is **${p.topDishes[0]?.[0] || 'something hearty'}**. Want the usual or shall I suggest something new?`;
    }

    if (p.peakMeal === 'dinner' && hour >= 18 && hour < 21) {
      return `🧠 **Memory Insight**: It's dinner time! Based on your history, you prefer **${p.dietTendency}** food. Want a recommendation?`;
    }

    return null;
  }

  // ── PUBLIC API ──
  return {
    recordOrder,
    autoRecordLastOrder,
    analyzePatterns,
    generateInsight,
    getProactiveSuggestion,
    getMemory,
    clearMemory: () => localStorage.removeItem(MEMORY_KEY),
  };
})();

// Auto-record the last order on every page load
window.addEventListener('DOMContentLoaded', () => {
  FoodMemory.autoRecordLastOrder();
});

// Expose globally
window.FoodMemory = FoodMemory;
