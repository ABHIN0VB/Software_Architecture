/* ============================================
   FEASTFLEET — Application JavaScript
   Cart, Navigation, Tracking, Auth, FAQ
   Geolocation, 1km Radius Multi-Restaurant
   ============================================ */

// ── RESTAURANT DATABASE (Kerala Coordinates) ──
const RESTAURANT_DB = {
  'AK Take Away':        { lat: 9.7118,  lng: 76.6840, area: 'Pala, Kottayam', time: '30-35 min' },
  'AK Take Away, Pala':  { lat: 9.7118,  lng: 76.6840, area: 'Pala, Kottayam', time: '30-35 min' },
  'Burger Palace':       { lat: 9.9716,  lng: 76.2846, area: 'MG Road, Kochi', time: '15-25 min' },
  'Sushi Master':        { lat: 9.9725,  lng: 76.2830, area: 'MG Road, Kochi', time: '30-40 min' },
  'Pizza Roma':          { lat: 9.9639,  lng: 76.2432, area: 'Fort Kochi', time: '25-35 min' },
  'Spice Garden':        { lat: 9.9953,  lng: 76.3025, area: 'Edappally, Kochi', time: '20-30 min' },
  'Sweet Treats':        { lat: 9.9710,  lng: 76.2855, area: 'MG Road, Kochi', time: '15-20 min' },
  'The Coffee House':    { lat: 9.9620,  lng: 76.2890, area: 'Panampilly Nagar', time: '15-25 min' },
  'Dragon Wok':          { lat: 10.0155, lng: 76.3410, area: 'Kakkanad, Kochi', time: '25-35 min' },
  'Taco Fiesta':         { lat: 9.9645,  lng: 76.2445, area: 'Fort Kochi', time: '20-30 min' },
  'Royal Biryani House': { lat: 9.9960,  lng: 76.3015, area: 'Edappally, Kochi', time: '25-35 min' },
  'FeastFleet Kitchen':  { lat: 9.9716,  lng: 76.2846, area: 'MG Road, Kochi', time: '15-25 min' }
};

// ── HAVERSINE DISTANCE (km) ──
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ── GEOLOCATION SYSTEM ──
const GeoLocation = {
  KEY: 'feastfleet_user_location',

  get() {
    const stored = localStorage.getItem(this.KEY);
    return stored ? JSON.parse(stored) : { lat: 9.7360, lng: 76.6570, locationName: 'Valavoor, Kottayam' };
  },

  save(lat, lng, locationName = 'Valavoor, Kottayam') {
    localStorage.setItem(this.KEY, JSON.stringify({ lat, lng, locationName }));
  },

  detect(callback) {
    // Update all detect buttons to show detecting state
    document.querySelectorAll('.btn-detect-location').forEach(btn => {
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-arrow-repeat spin-icon"></i> Detecting location...';
    });

    // Detect user location specifically as Valavoor, Kottayam
    setTimeout(() => {
      const latitude = 9.7360;
      const longitude = 76.6570;
      const locationName = 'Valavoor, Kottayam';

      this.save(latitude, longitude, locationName);
      if (typeof cart !== 'undefined' && cart.showToast) {
        cart.showToast('📍 Location set to Valavoor, Kottayam!');
      }

      this.updateUI(latitude, longitude, locationName);

      document.querySelectorAll('.btn-detect-location').forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Valavoor, Kottayam';
        btn.classList.add('location-set');
      });

      if (callback) callback(latitude, longitude, locationName);
    }, 350);
  },

  updateUI(lat, lng, locationName = 'Valavoor, Kottayam') {
    // Update location display text
    document.querySelectorAll('.location-text').forEach(el => {
      el.textContent = `📍 ${locationName}`;
    });

    // Update address inputs
    document.querySelectorAll('.hero-search .search-input, #location-display').forEach(el => {
      if (el.tagName === 'INPUT') {
        el.value = `📍 ${locationName}`;
      } else {
        el.textContent = `📍 ${locationName}`;
      }
    });

    // Update distance badges on restaurant cards
    updateDistanceBadges(lat, lng);
  },

  getNearestArea(lat, lng) {
    let minDist = Infinity;
    let nearest = 'Valavoor, Kottayam';
    for (const [name, data] of Object.entries(RESTAURANT_DB)) {
      const d = haversineDistance(lat, lng, data.lat, data.lng);
      if (d < minDist) {
        minDist = d;
        nearest = data.area;
      }
    }
    return nearest;
  }
};

// ── UPDATE DISTANCE BADGES ON RESTAURANT CARDS ──
function updateDistanceBadges(lat, lng) {
  document.querySelectorAll('.restaurant-card[data-restaurant-id]').forEach(card => {
    const restaurantName = card.dataset.restaurantId;
    const restaurant = RESTAURANT_DB[restaurantName];
    if (!restaurant) return;

    const distance = haversineDistance(lat, lng, restaurant.lat, restaurant.lng);
    let badge = card.querySelector('.distance-badge');

    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'meta-item distance-badge';
      const meta = card.querySelector('.card-meta');
      if (meta) meta.appendChild(badge);
    }

    const timeStr = restaurant.time ? ` (${restaurant.time})` : '';
    badge.innerHTML = `<i class="bi bi-geo-alt"></i> ${distance.toFixed(1)} km${timeStr}`;

    // Visual indicator: green if close, orange if medium, red if far
    badge.classList.remove('dist-near', 'dist-medium', 'dist-far');
    if (distance <= 6) {
      badge.classList.add('dist-near');
    } else if (distance <= 20) {
      badge.classList.add('dist-medium');
    } else {
      badge.classList.add('dist-far');
    }
  });
}

// ── CART SYSTEM ──
class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('feastfleet_cart')) || [];
    this.updateBadge();
  }

  save() {
    localStorage.setItem('feastfleet_cart', JSON.stringify(this.items));
    this.updateBadge();
  }

  // Get unique restaurant names currently in cart
  getRestaurantsInCart() {
    const restaurants = [...new Set(this.items.map(i => i.restaurant))];
    return restaurants;
  }

  // Check if a new restaurant is within 1km of ALL restaurants already in cart
  isWithinRadius(newRestaurant, radiusKm = 1) {
    const cartRestaurants = this.getRestaurantsInCart();

    // If cart is empty or same restaurant, always allow
    if (cartRestaurants.length === 0) return { allowed: true };
    if (cartRestaurants.includes(newRestaurant)) return { allowed: true };

    const newCoords = RESTAURANT_DB[newRestaurant];
    if (!newCoords) return { allowed: true }; // Unknown restaurant, allow

    for (const existing of cartRestaurants) {
      const existingCoords = RESTAURANT_DB[existing];
      if (!existingCoords) continue;

      const distance = haversineDistance(
        newCoords.lat, newCoords.lng,
        existingCoords.lat, existingCoords.lng
      );

      if (distance > radiusKm) {
        return {
          allowed: false,
          tooFarFrom: existing,
          distance: distance.toFixed(1),
          maxRadius: radiusKm
        };
      }
    }

    return { allowed: true };
  }

  addItem(item) {
    // ── 1km RADIUS CHECK ──
    const check = this.isWithinRadius(item.restaurant);
    if (!check.allowed) {
      this.showToast(
        `⚠️ ${item.restaurant} is ${check.distance}km from ${check.tooFarFrom}. Must be within ${check.maxRadius}km!`,
        'warning'
      );
      return false;
    }

    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...item, qty: 1 });
    }
    this.save();
    this.showToast(`${item.name} added to cart!`);
    return true;
  }

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  }

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(id);
    } else {
      this.save();
    }
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  clear() {
    this.items = [];
    this.save();
  }

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('show', count > 0);
    });

    // Update floating cart
    const floatingCart = document.querySelector('.floating-cart');
    if (floatingCart) {
      floatingCart.classList.toggle('show', count > 0);
      const fcCount = floatingCart.querySelector('.fc-count');
      const fcTotal = floatingCart.querySelector('.fc-total');
      if (fcCount) fcCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
      if (fcTotal) fcTotal.textContent = `₹${this.getTotal().toFixed(2)}`;
    }
  }

  showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const borderColor = type === 'warning'
      ? 'rgba(255, 71, 87, 0.5)'
      : 'rgba(255,107,53,0.3)';
    const icon = type === 'warning'
      ? 'bi-exclamation-triangle-fill'
      : 'bi-check-circle-fill';

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="bi ${icon}"></i> ${message}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #1a1a24;
      border: 1px solid ${borderColor};
      color: #f0f0f5;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-family: 'Inter', sans-serif;
      z-index: 9999;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      max-width: 90vw;
      text-align: center;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    const duration = type === 'warning' ? 4000 : 2500;
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Initialize global cart
const cart = new Cart();

// ── NAVBAR ──
document.addEventListener('DOMContentLoaded', () => {
  // Scroll effect on navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // Mobile hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navAuth = document.querySelector('.nav-auth');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      if (navLinks) navLinks.classList.toggle('open');
      if (navAuth) navAuth.classList.toggle('open');
    });
  }

  // Set active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Scroll reveal animation
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ── DETECT LOCATION BUTTONS ──
  document.querySelectorAll('.btn-detect-location').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      GeoLocation.detect();
    });
  });

  // Restore saved location on page load
  const savedLocation = GeoLocation.get();
  if (savedLocation) {
    GeoLocation.updateUI(savedLocation.lat, savedLocation.lng);
    document.querySelectorAll('.btn-detect-location').forEach(btn => {
      btn.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Location Set';
      btn.classList.add('location-set');
    });
  }

  // ── CART PAGE RENDERING ──
  const cartItemsContainer = document.getElementById('cart-items');
  if (cartItemsContainer) {
    renderCartPage();
  }

  // ── AUTH PAGE TOGGLE ──
  const loginBtn = document.getElementById('btn-login-tab');
  const signupBtn = document.getElementById('btn-signup-tab');
  const signupFields = document.getElementById('signup-fields');
  const authSubmit = document.getElementById('auth-submit');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');

  if (loginBtn && signupBtn) {
    loginBtn.addEventListener('click', () => {
      loginBtn.classList.add('active');
      signupBtn.classList.remove('active');
      if (signupFields) signupFields.style.display = 'none';
      if (authSubmit) authSubmit.textContent = 'Sign In';
      if (authTitle) authTitle.textContent = 'Welcome Back';
      if (authSubtitle) authSubtitle.textContent = 'Sign in to your FeastFleet account';
    });

    signupBtn.addEventListener('click', () => {
      signupBtn.classList.add('active');
      loginBtn.classList.remove('active');
      if (signupFields) signupFields.style.display = 'block';
      if (authSubmit) authSubmit.textContent = 'Create Account';
      if (authTitle) authTitle.textContent = 'Join FeastFleet';
      if (authSubtitle) authSubtitle.textContent = 'Create your account and start ordering';
    });
  }

  // Auth form is handled by login.html with full API integration

  // ── FAQ ACCORDION ──
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── CONTACT FORM ──
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      cart.showToast('Message sent successfully!');
      contactForm.reset();
    });
  }

  // ── ORDER TRACKING ANIMATION ──
  const trackingPage = document.querySelector('.tracking-page');
  if (trackingPage) {
    runTrackingAnimation();
  }

  // ── RESTAURANT FILTER ──
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterRestaurants(chip.dataset.filter);
    });
  });

  // ── RESTAURANT SEARCH ──
  const searchInput = document.querySelector('.filter-bar .search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.restaurant-card').forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const cuisine = card.querySelector('.card-cuisine')?.textContent.toLowerCase() || '';
        card.style.display = (name.includes(query) || cuisine.includes(query)) ? '' : 'none';
      });
    });
  }

  // ── MENU CATEGORY TABS ──
  document.querySelectorAll('.menu-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.dataset.category;

      if (category === 'ai-ingredients') {
        // AI Mode: Show all items and reveal the AI prediction drawers
        document.querySelectorAll('.menu-item').forEach(item => {
          item.style.display = '';
          const drawer = item.querySelector('.ai-card-drawer');
          if (drawer) drawer.style.display = 'block';
        });
      } else {
        // Normal categories: Keep clean previous version
        document.querySelectorAll('.menu-item').forEach(item => {
          const drawer = item.querySelector('.ai-card-drawer');
          if (drawer) drawer.style.display = 'none';

          if (category === 'all' || item.dataset.category.includes(category)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      }
    });
  });

  // ── ADD TO CART BUTTONS ──
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const item = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        image: btn.dataset.image,
        restaurant: btn.dataset.restaurant || 'FeastFleet Kitchen'
      };
      cart.addItem(item);
    });
  });

  // ── INITIALIZE AI FOOD INGREDIENT PREDICTION ON FOOD CARDS ──
  if (typeof AIIngredientPredictor !== 'undefined') {
    AIIngredientPredictor.decorateCards();
  }
});

// ============================================
// AI FOOD INGREDIENT PREDICTION SYSTEM
// ============================================

const AIIngredientPredictor = {
  cache: {},

  // Instant local knowledge base for immediate zero-lag rendering
  localDB: {
    'classic smash burger': {
      dishName: 'Classic Smash Burger',
      predictedIngredients: ['Two Smashed Beef Patties', 'Toasted Brioche Bun', 'Double Melted American Cheese', 'Dill Pickles', 'Caramelized Yellow Onions', 'House Secret Sauce'],
      allergens: ['Gluten', 'Dairy', 'Eggs', 'Mustard'],
      dietary: 'Non-Vegetarian, High Protein',
      flavorProfile: 'Deep Umami, Crispy Edges, Savory, Tangy',
      aiConfidence: 98
    },
    'cheese loaded burger': {
      dishName: 'Cheese Loaded Burger',
      predictedIngredients: ['Seasoned Prime Patty', 'Fried Mozzarella Stick Patty', 'Melted Sharp Cheddar', 'Garlic Herb Mayo', 'Toasted Butter Bun', 'Crisp Romaine Lettuce'],
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      dietary: 'High Protein, Rich',
      flavorProfile: 'Cheesy, Rich, Creamy, Decadent',
      aiConfidence: 97
    },
    'crispy chicken burger': {
      dishName: 'Crispy Chicken Burger',
      predictedIngredients: ['Buttermilk Fried Chicken Breast', 'Spicy Paprika Flour Coating', 'Tangy Purple Cabbage Slaw', 'Spicy Chipotle Mayo', 'Pickled Jalapenos', 'Brioche Bun'],
      allergens: ['Gluten', 'Eggs', 'Dairy'],
      dietary: 'Non-Vegetarian, Spicy',
      flavorProfile: 'Crispy, Spicy, Tangy, Zesty',
      aiConfidence: 98
    },
    'double stack': {
      dishName: 'Double Stack',
      predictedIngredients: ['Two Ground Beef Patties', 'Crispy Bacon Strips', 'Golden Beer-Battered Onion Rings', 'Hickory BBQ Sauce', 'Melted Cheddar Cheese', 'Sesame Bun'],
      allergens: ['Gluten', 'Dairy', 'Sesame', 'Soy'],
      dietary: 'Non-Vegetarian, Heavy Feast',
      flavorProfile: 'Smoky, Sweet BBQ, Savory, Crispy',
      aiConfidence: 96
    },
    'french fries': {
      dishName: 'French Fries',
      predictedIngredients: ['Russet Potatoes', 'Sea Salt', 'Crispy Double Fry Oil', 'House Herb Seasoning'],
      allergens: ['Gluten-Free (Check shared fryer)'],
      dietary: 'Vegetarian, Vegan',
      flavorProfile: 'Salty, Crispy, Golden, Comforting',
      aiConfidence: 99
    },
    'onion rings': {
      dishName: 'Onion Rings',
      predictedIngredients: ['Thick-Cut White Onions', 'Beer Batter Flour Coating', 'Golden Breadcrumbs', 'Black Pepper & Garlic', 'Creamy Herb Dip'],
      allergens: ['Gluten', 'Dairy (in dip)', 'Eggs'],
      dietary: 'Vegetarian',
      flavorProfile: 'Crispy, Sweet Onion, Herb Dip',
      aiConfidence: 97
    },
    'cola': {
      dishName: 'Cola',
      predictedIngredients: ['Carbonated Filtered Water', 'Natural Cane Caramel', 'Kola Nut Extract & Vanilla', 'Citric & Phosphoric Zing', 'Natural Flavors'],
      allergens: ['Allergen-Free'],
      dietary: 'Vegetarian, Vegan, Gluten-Free',
      flavorProfile: 'Sweet, Sparkling, Caramel, Crisp',
      aiConfidence: 99
    },
    'chocolate shake': {
      dishName: 'Chocolate Shake',
      predictedIngredients: ['Belgian Cocoa Fudge', 'Rich Vanilla Soft Serve', 'Whole Chilled Milk', 'Whipped Dairy Cream', 'Shaved Dark Chocolate Curls'],
      allergens: ['Dairy'],
      dietary: 'Vegetarian',
      flavorProfile: 'Rich Chocolate, Creamy, Sweet, Decadent',
      aiConfidence: 98
    },
    'al faham': {
      dishName: 'Al Faham Chicken',
      predictedIngredients: ['Charcoal Grilled Chicken', 'Arabic 7-Spice Baharat', 'Garlic & Ginger Paste', 'Lemon Juice & Olive Oil', 'Yogurt Marinade', 'Smoky Charcoal Infusion'],
      allergens: ['Dairy (Yogurt)'],
      dietary: 'Non-Vegetarian, High Protein, Keto-Friendly',
      flavorProfile: 'Smoky, Earthy Arabic Spices, Juicy, Mildly Tangy',
      aiConfidence: 99
    },
    'kothu parotta': {
      dishName: 'Chicken Kothu Parotta',
      predictedIngredients: ['Shredded Malabar Porotta', 'Spiced Tender Chicken', 'Farm Fresh Eggs', 'Sauteed Onions & Tomatoes', 'Green Chillies & Curry Leaves', 'Rich Chicken Salna Gravy'],
      allergens: ['Gluten', 'Eggs'],
      dietary: 'Non-Vegetarian, Street Food Legend',
      flavorProfile: 'Spicy, Flaky, Savory, Rich Gravy-Soaked',
      aiConfidence: 99
    },
    'chicken pottitherichath': {
      dishName: 'Chicken Pottitherichath',
      predictedIngredients: ['Crispy Country Chicken Pieces', 'Crushed Small Shallots (Kunjulli)', 'Fresh Green Curry Leaves', 'Cracked Black Pepper & Fennel', 'Kashmiri Chilli Flakes', 'Pure Coconut Oil'],
      allergens: ['Allergen-Free'],
      dietary: 'Non-Vegetarian, Authentic Naadan, Gluten-Free',
      flavorProfile: 'Spicy Crunch, Rich Coconut Oil Aroma, Peppery Heat',
      aiConfidence: 98
    },
    'chicken perattu': {
      dishName: 'Chicken Perattu',
      predictedIngredients: ['Tender Chicken Pieces', 'Roasted Coconut Slivers (Thenga Kothu)', 'Shallots, Ginger & Garlic', 'Malabar Garam Masala', 'Curry Leaves & Green Chillies', 'Cold-Pressed Coconut Oil'],
      allergens: ['Allergen-Free'],
      dietary: 'Non-Vegetarian, Authentic Kerala Roast',
      flavorProfile: 'Semi-Dry, Spicy, Rich Toasted Coconut, Aromatic',
      aiConfidence: 98
    },
    'chilli beef': {
      dishName: 'Chilli Beef',
      predictedIngredients: ['Tender Slow-Cooked Beef Cubes', 'Crushed Black Peppercorns', 'Dark Soy Sauce & Green Chilli Slits', 'Capsicum & Diced Onions', 'Garlic Slivers & Ginger', 'Fried Curry Leaves'],
      allergens: ['Soy'],
      dietary: 'Non-Vegetarian, High Protein',
      flavorProfile: 'Fiery Hot, Savory Umami, Tender Meat, Peppery',
      aiConfidence: 98
    },
    'dragon chicken': {
      dishName: 'Dragon Chicken',
      predictedIngredients: ['Crispy Shredded Chicken Strips', 'Red Chilli Paste & Szechuan Sauce', 'Roasted Cashew Nuts', 'Bell Peppers & Spring Onions', 'Honey Glaze & Garlic', 'White Sesame Seeds'],
      allergens: ['Gluten', 'Tree Nuts (Cashews)', 'Sesame', 'Soy'],
      dietary: 'Non-Vegetarian, Indo-Chinese Special',
      flavorProfile: 'Crunchy, Sweet & Spicy, Tangy, Nutty',
      aiConfidence: 98
    },
    'chicken 555': {
      dishName: 'Chicken 555',
      predictedIngredients: ['Crispy Chicken Fingers', 'Egg White & Cornflour Coating', 'Tangy Red Chilli Sauce', 'Slit Green Chillies & Curry Leaves', 'Ginger-Garlic Paste'],
      allergens: ['Eggs', 'Soy'],
      dietary: 'Non-Vegetarian, Party Starter',
      flavorProfile: 'Zesty, Tangy, Crispy, Medium Spicy',
      aiConfidence: 97
    },
    'chicken biryani': {
      dishName: 'Chicken Biryani',
      predictedIngredients: ['Fragrant Kaima Rice', 'Succulent Spiced Chicken', 'Golden Fried Onions (Bista)', 'Pure Ghee & Whole Spices', 'Mint & Coriander Leaves', 'Cashews & Raisins'],
      allergens: ['Dairy (Ghee)', 'Tree Nuts (Cashews)'],
      dietary: 'Non-Vegetarian, Feast Classic',
      flavorProfile: 'Aromatic, Rich Ghee Aroma, Mild Spiced, Royal',
      aiConfidence: 99
    },
    'parotta': {
      dishName: 'Kerala Parotta',
      predictedIngredients: ['Maida Wheat Flour', 'Ghee / Vegetable Oil', 'Pinch of Sugar & Sea Salt', 'Hand-Stretched Flaky Spiral Dough'],
      allergens: ['Gluten'],
      dietary: 'Vegetarian, Kerala Pride',
      flavorProfile: 'Flaky, Buttery, Soft Layers with Crispy Edges',
      aiConfidence: 99
    },
    'chilly gopi': {
      dishName: 'Chilly Gopi',
      predictedIngredients: ['Crispy Cauliflower Florets', 'Cornflour & Maida Batter', 'Dark Soy Sauce & Red Chilli Sauce', 'Green Bell Peppers & Onions', 'Minced Garlic & Ginger'],
      allergens: ['Gluten', 'Soy'],
      dietary: 'Vegetarian, Vegan',
      flavorProfile: 'Crispy, Tangy, Spicy, Garlicky',
      aiConfidence: 99
    },
    'sharjah shake': {
      dishName: 'Sharjah Shake',
      predictedIngredients: ['Frozen Robusta Banana', 'Chilled Thick Milk', 'Boost / Malt Cocoa Powder', 'Vanilla Ice Cream Scoop', 'Crushed Roasted Peanuts & Cashews'],
      allergens: ['Dairy', 'Peanuts', 'Tree Nuts'],
      dietary: 'Vegetarian, Kerala Shake Legend',
      flavorProfile: 'Rich Chocolate-Malt, Creamy Banana, Nutty Crunch',
      aiConfidence: 99
    },
    'dates shake': {
      dishName: 'Dates Shake',
      predictedIngredients: ['Soft Arabian Seedless Dates', 'Chilled Full-Cream Milk', 'Natural Wild Honey', 'Cardamom Pinch', 'Crushed Almond Slivers'],
      allergens: ['Dairy', 'Tree Nuts (Almonds)'],
      dietary: 'Vegetarian, Naturally Sweet',
      flavorProfile: 'Rich Caramel-Date Notes, Silky Smooth, Nourishing',
      aiConfidence: 99
    },
    'pista shake': {
      dishName: 'Pista Shake',
      predictedIngredients: ['Pistachio Paste & Roasted Pista Bits', 'Chilled Whole Milk', 'Pistachio Ice Cream', 'Cardamom', 'Saffron Strands'],
      allergens: ['Dairy', 'Tree Nuts (Pistachios)'],
      dietary: 'Vegetarian',
      flavorProfile: 'Nutty, Creamy, Fragrant Pistachio & Cardamom',
      aiConfidence: 98
    },
    'paneer butter masala': {
      dishName: 'Paneer Butter Masala',
      predictedIngredients: ['Soft Malai Paneer Cubes', 'Butter & Fresh Cream', 'Tomato-Cashew Puree', 'Kasuri Methi', 'Cardamom & Kashmiri Chili'],
      allergens: ['Dairy (Milk, Butter, Cream)', 'Tree Nuts (Cashews)'],
      dietary: 'Vegetarian, Rich Gravy',
      flavorProfile: 'Rich, Creamy, Sweet-Tangy, Buttery',
      aiConfidence: 99
    },
    'pepper chicken': {
      dishName: 'Pepper Chicken',
      predictedIngredients: ['Fresh Farm Chicken', 'Freshly Crushed Tellicherry Black Pepper', 'Sauteed Onions & Garlic', 'Curry Leaves & Green Chili', 'Fennel Seed Powder'],
      allergens: ['Allergen-Free'],
      dietary: 'Non-Vegetarian, High Protein',
      flavorProfile: 'Spicy Peppery Heat, Dry Roasted Aroma',
      aiConfidence: 98
    },
    'chilli parotta': {
      dishName: 'Chilli Parotta',
      predictedIngredients: ['Crispy Parotta Cubes', 'Capsicum & Diced Onions', 'Chili Sauce & Soy Sauce', 'Crushed Ginger-Garlic', 'Spring Onions'],
      allergens: ['Gluten', 'Soy'],
      dietary: 'Vegetarian, Street Food Fusion',
      flavorProfile: 'Crisp, Tangy, Spicy Gravy Coating',
      aiConfidence: 97
    }
  },

  getPrediction(name, description = '') {
    const key = (name || '').toLowerCase().trim();
    if (this.cache[key]) return this.cache[key];

    for (const [k, val] of Object.entries(this.localDB)) {
      if (key.includes(k) || k.includes(key)) {
        this.cache[key] = val;
        return val;
      }
    }

    const inferred = {
      dishName: name,
      predictedIngredients: ['Fresh Market Produce', 'Cold-Pressed Cooking Oil', 'Signature House Spices', 'Sea Salt & Black Pepper', 'Aromatic Herbs'],
      allergens: ['Please check with restaurant for allergen details'],
      dietary: 'Freshly Prepared',
      flavorProfile: 'Balanced & Savory',
      aiConfidence: 91,
      source: 'FeastFleet Smart Culinary Engine'
    };
    this.cache[key] = inferred;
    return inferred;
  },

  async fetchOnline(name, description, cuisine) {
    if (typeof API !== 'undefined' && API.predictIngredients) {
      try {
        const res = await API.predictIngredients(name, description, cuisine);
        if (res && res.success && res.data) {
          this.cache[(name || '').toLowerCase().trim()] = res.data;
          return res.data;
        }
      } catch (e) {
        // Fallback already cached
      }
    }
    return this.getPrediction(name, description);
  },

  decorateCards() {
    const items = document.querySelectorAll('.menu-item');
    if (!items || items.length === 0) return;

    items.forEach((card) => {
      // Avoid duplicate decoration
      if (card.querySelector('.btn-ai-predict')) return;

      const titleEl = card.querySelector('h4');
      if (!titleEl) return;
      const dishName = titleEl.textContent.trim();
      const descEl = card.querySelector('p');
      const desc = descEl ? descEl.textContent.trim() : '';

      const pred = this.getPrediction(dishName, desc);
      const safeDishName = dishName.replace(/'/g, "\\'");

      // ── PRESERVE PREVIOUS CARD LAYOUT: Add AI button cleanly in item-bottom next to Add to Cart ──
      const bottom = card.querySelector('.item-bottom');
      const addBtn = card.querySelector('.btn-add-cart');

      if (bottom && addBtn) {
        let actions = bottom.querySelector('.item-actions');
        if (!actions) {
          actions = document.createElement('div');
          actions.className = 'item-actions';
          bottom.appendChild(actions);
          actions.appendChild(addBtn);
        }

        // Add AI Ingredients option button
        const aiBtn = document.createElement('button');
        aiBtn.type = 'button';
        aiBtn.className = 'btn-ai-predict';
        aiBtn.setAttribute('data-dish', safeDishName);
        aiBtn.title = `Click to view AI ingredient prediction for ${dishName}`;
        aiBtn.innerHTML = `<i class="bi bi-stars"></i> AI Ingredients`;
        aiBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openAIIngredientModal(safeDishName);
        };

        actions.insertBefore(aiBtn, addBtn);
      }

      // ── PREPARE INLINE DRAWER (hidden by default, revealed only in AI Mode or when clicked) ──
      const details = card.querySelector('.item-details');
      if (details && !details.querySelector('.ai-card-drawer')) {
        const drawer = document.createElement('div');
        drawer.className = 'ai-card-drawer';
        drawer.style.display = 'none'; // Hidden by default to keep previous clean version!

        const previewList = (pred.predictedIngredients || []).slice(0, 4);
        const remaining = (pred.predictedIngredients || []).length - previewList.length;

        let chipsHtml = previewList.map(ing => `<span class="ai-chip" title="${ing}">${ing}</span>`).join('');
        if (remaining > 0) {
          chipsHtml += `<span class="ai-chip more-chip" onclick="openAIIngredientModal('${safeDishName}')" title="View all ingredients">+${remaining} more</span>`;
        }

        let allergenHtml = '';
        if (pred.allergens && pred.allergens.length > 0 && !pred.allergens[0].toLowerCase().includes('free') && !pred.allergens[0].toLowerCase().includes('none')) {
          allergenHtml = `<div class="ai-allergen-tag"><i class="bi bi-shield-exclamation"></i> Allergens: ${pred.allergens.slice(0, 2).join(', ')}</div>`;
        }

        drawer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 0.72rem; color: #FFB347; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
              <i class="bi bi-cpu-fill"></i> AI Predicted Ingredients:
            </span>
            <span class="ai-confidence-pill"><i class="bi bi-shield-check"></i> ${pred.aiConfidence}% Match</span>
          </div>
          <div class="ai-predicted-chips">
            ${chipsHtml}
          </div>
          ${allergenHtml}
        `;

        details.appendChild(drawer);
      }

      // Query online backend in background to enrich cache
      this.fetchOnline(dishName, desc);
    });
  }
};

// ── AI INGREDIENT MODAL CONTROLLER ──
window.openAIIngredientModal = async function(dishName) {
  let modal = document.getElementById('ai-ingredient-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'ai-modal-backdrop';
    modal.id = 'ai-ingredient-modal';
    modal.onclick = (e) => { if (e.target === modal) closeAIIngredientModal(); };
    modal.innerHTML = `
      <div class="ai-modal-dialog">
        <div class="ai-modal-header">
          <div class="ai-modal-title">
            <i class="bi bi-stars" style="color: #FFB347;"></i>
            <span>AI Food Ingredient Predictor</span>
          </div>
          <button class="ai-modal-close-btn" onclick="closeAIIngredientModal()" aria-label="Close modal">&times;</button>
        </div>
        <div class="ai-modal-body" id="ai-modal-body-content"></div>
        <div class="ai-modal-footer">
          <button class="btn-ask-bot" id="ai-modal-ask-bot-btn">
            <i class="bi bi-robot"></i> Ask AI Chatbot
          </button>
          <button class="btn-primary" style="padding: 8px 18px; font-size: 0.88rem;" onclick="closeAIIngredientModal()">
            Done
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  let bodyContent = document.getElementById('ai-modal-body-content');
  if (!bodyContent && modal) {
    bodyContent = modal.querySelector('#ai-modal-body-content');
  }
  if (!bodyContent) return;

  // Also reveal inline drawer on that specific card for convenience
  document.querySelectorAll('.menu-item').forEach(card => {
    const cardTitle = card.querySelector('h4')?.textContent?.trim();
    if (cardTitle && cardTitle.toLowerCase() === dishName.toLowerCase()) {
      const drawer = card.querySelector('.ai-card-drawer');
      if (drawer) drawer.style.display = 'block';
    }
  });

  const pred = AIIngredientPredictor.getPrediction(dishName);

  function renderData(data) {
    const allergenList = Array.isArray(data.allergens) ? data.allergens.join(', ') : (data.allergens || 'None reported');
    bodyContent.innerHTML = `
      <div class="ai-dish-headline">
        <div class="ai-dish-name">${data.dishName || dishName}</div>
        <span class="ai-confidence-badge"><i class="bi bi-shield-check"></i> ${data.aiConfidence || 95}% AI Match</span>
      </div>

      <div class="ai-modal-info-box">
        <div style="margin-bottom: 4px;"><strong>🏷️ Dietary:</strong> ${data.dietary || 'Standard Fresh'}</div>
        <div><strong>🌟 Flavor Notes:</strong> ${data.flavorProfile || 'Savory and authentic'}</div>
      </div>

      <div>
        <div class="ai-section-title">
          <i class="bi bi-basket3-fill" style="color:#FFB347;"></i>
          Predicted Recipe & Ingredients (${(data.predictedIngredients || []).length})
        </div>
        <div class="ai-ingredients-list-grid">
          ${(data.predictedIngredients || []).map(ing => `
            <div class="ai-ingredient-item">
              <i class="bi bi-check-circle-fill"></i>
              <span>${ing}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="ai-modal-info-box" style="background: rgba(255, 107, 53, 0.08); border-color: rgba(255, 107, 53, 0.3); color: #ff9f43;">
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; margin-bottom: 2px;">
          <i class="bi bi-exclamation-triangle-fill"></i> Allergen Intelligence
        </div>
        <div style="color: #f0f0f5; font-size: 0.85rem;">${allergenList}</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: #7e7e9a; padding-top: 4px;">
        <span><i class="bi bi-cpu"></i> Neural Ingredient Analysis</span>
        <span>${data.source || 'FeastFleet AI'}</span>
      </div>
    `;

    const botBtn = document.getElementById('ai-modal-ask-bot-btn');
    if (botBtn) {
      botBtn.onclick = () => {
        closeAIIngredientModal();
        if (window.openFeastFleetChatbot) {
          window.openFeastFleetChatbot(`What are the ingredients in ${data.dishName || dishName}?`);
        }
      };
    }
  }

  renderData(pred);
  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  modal.style.visibility = 'visible';
  modal.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';

  // Asynchronously fetch fresh data from backend
  AIIngredientPredictor.fetchOnline(dishName).then(fresh => {
    if (fresh) renderData(fresh);
  });
};

window.closeAIIngredientModal = function() {
  const modal = document.getElementById('ai-ingredient-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.style.pointerEvents = 'none';
  }
  document.body.style.overflow = '';
};

// ── GLOBAL RESILIENT EVENT DELEGATION FOR AI INGREDIENTS BUTTON ──
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-ai-predict');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    const dish = btn.getAttribute('data-dish') || btn.closest('.menu-item')?.querySelector('h4')?.textContent?.trim();
    if (dish && window.openAIIngredientModal) {
      window.openAIIngredientModal(dish);
    }
  }
});

// Auto-run if DOM is already ready
if (document.readyState !== 'loading') {
  AIIngredientPredictor.decorateCards();
}

// ── CART PAGE FUNCTIONS ──
function renderCartPage() {
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const summarySection = document.getElementById('cart-summary');

  if (cart.items.length === 0) {
    if (container) container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (summarySection) summarySection.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (summarySection) summarySection.style.display = 'block';

  // Show restaurants in cart with radius info
  const restaurants = cart.getRestaurantsInCart();
  let radiusInfo = '';
  if (restaurants.length > 1) {
    radiusInfo = `<div class="cart-radius-info">
      <i class="bi bi-geo-alt-fill"></i>
      Ordering from <strong>${restaurants.length} restaurants</strong> within 1km radius
    </div>`;
  }

  container.innerHTML = radiusInfo + cart.items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="ci-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="ci-details">
        <h4>${item.name}</h4>
        <span class="ci-restaurant">${item.restaurant}</span>
        <div class="ci-price">₹${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="updateCartItem('${item.id}', -1)">−</button>
        <span class="qty-number">${item.qty}</span>
        <button class="qty-btn" onclick="updateCartItem('${item.id}', 1)">+</button>
      </div>
      <button class="ci-remove" onclick="removeCartItem('${item.id}')">
        <i class="bi bi-trash3"></i>
      </button>
    </div>
  `).join('');

  updateCartSummary();
}

function updateCartItem(id, delta) {
  cart.updateQty(id, delta);
  renderCartPage();
}

function removeCartItem(id) {
  cart.removeItem(id);
  renderCartPage();
}

function updateCartSummary() {
  const subtotal = cart.getTotal();
  const deliveryFee = subtotal > 0 ? 49.00 : 0;
  const total = subtotal + deliveryFee;

  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = `₹${deliveryFee.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}

// ── ORDER TRACKING WITH 5:1 REAL-TIME MAPPING & RIDER ALLOCATION ──
const DELIVERY_PARTNERS_LIST = [
  'Arjun', 'Rahul', 'Aditya', 'Rohit', 'Karthik',
  'Vivek', 'Akshay', 'Nikhil', 'Sandeep', 'Ananya'
];

async function runTrackingAnimation() {
  const steps = document.querySelectorAll('.step');
  const progressLine = document.querySelector('.progress-line');
  const etaEl = document.getElementById('tracking-eta');
  const statusText = document.getElementById('tracking-status');
  const trackingEmoji = document.getElementById('tracking-emoji');
  const riderNameEl = document.getElementById('rider-name');
  const riderPhoneEl = document.getElementById('rider-phone');
  const riderTitleEl = document.getElementById('rider-status-title');
  const riderAvatarEl = document.getElementById('rider-avatar-icon');
  const liveTimeEl = document.getElementById('live-time-display');

  // Check URL for ?orderId= parameter
  const urlParams = new URLSearchParams(window.location.search);
  const targetOrderId = urlParams.get('orderId');

  let activeOrder = null;
  const lastOrderRaw = localStorage.getItem('feastfleet_last_order');
  if (lastOrderRaw) {
    try {
      activeOrder = JSON.parse(lastOrderRaw);
    } catch (e) {}
  }

  // If orderId is specified in URL, fetch details from API
  if (targetOrderId) {
    if (typeof API !== 'undefined' && API.isLoggedIn()) {
      try {
        const res = await API.getOrder(targetOrderId);
        if (res && res.success && res.data) {
          activeOrder = res.data;
          // Sync to localStorage for current tracking view
          localStorage.setItem('feastfleet_last_order', JSON.stringify(activeOrder));
        }
      } catch (err) {
        console.warn('Could not fetch target order from API:', err);
      }
    }
  }

  // Populate order card info on tracking page
  if (activeOrder) {
    const idEl = document.querySelector('.order-id');
    if (idEl) idEl.textContent = 'Order #' + (activeOrder.orderId || 'FF-ACTIVE');

    if (activeOrder.restaurants && activeOrder.restaurants.length > 0) {
      const rEl = document.getElementById('track-rest');
      if (rEl) rEl.textContent = activeOrder.restaurants.join(', ');
    }

    if (activeOrder.items && activeOrder.items.length > 0) {
      const iEl = document.getElementById('track-items');
      const totalQty = activeOrder.items.reduce((s, i) => s + (i.qty || i.quantity || 1), 0);
      if (iEl) iEl.textContent = `${totalQty} item(s) (${activeOrder.items.map(i => i.name).join(', ')})`;
    }

    if (activeOrder.total) {
      const tEl = document.getElementById('track-total');
      if (tEl) tEl.textContent = '₹' + Number(activeOrder.total).toFixed(2);
    }
  }

  // Pick or retrieve assigned delivery partner
  let assignedRider = null;
  if (activeOrder && activeOrder.deliveryPartner && activeOrder.deliveryPartner.name) {
    assignedRider = activeOrder.deliveryPartner;
  }

  if (!assignedRider) {
    const randomName = DELIVERY_PARTNERS_LIST[Math.floor(Math.random() * DELIVERY_PARTNERS_LIST.length)];
    assignedRider = {
      name: randomName,
      phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000)
    };
    if (activeOrder) {
      activeOrder.deliveryPartner = assignedRider;
      localStorage.setItem('feastfleet_last_order', JSON.stringify(activeOrder));
    }
  }

  // 25 app minutes = 5 real-time minutes = 300 seconds total
  const TOTAL_APP_MINUTES = 25;
  const TOTAL_REAL_SECONDS = 300; // 5 min in real time

  // Determine order creation time to compute remaining time
  let orderCreatedMs = Date.now();
  if (activeOrder && activeOrder.createdAt) {
    const parsed = new Date(activeOrder.createdAt).getTime();
    if (!isNaN(parsed)) {
      orderCreatedMs = parsed;
    }
  } else {
    // If order has no createdAt, stamp it now so countdown proceeds
    if (activeOrder) {
      activeOrder.createdAt = new Date().toISOString();
      localStorage.setItem('feastfleet_last_order', JSON.stringify(activeOrder));
    }
  }

  function getRemainingRealSeconds() {
    const elapsedSec = Math.max(0, Math.floor((Date.now() - orderCreatedMs) / 1000));
    return Math.max(0, TOTAL_REAL_SECONDS - elapsedSec);
  }

  // Step 0: Confirmed (0 to 60s real = 25 to 20 app min)
  // Step 1: Preparing (60 to 180s real = 20 to 10 app min)
  // Step 2: On The Way (180 to 300s real = 10 to 0 app min)
  // Step 3: Delivered (at 300s real = 0 app min)

  function updateTrackingDisplay() {
    const realSecondsLeft = getRemainingRealSeconds();
    const elapsedRealSec = TOTAL_REAL_SECONDS - realSecondsLeft;

    // 5 app min per 1 real min ratio -> appMinLeft = realSecondsLeft * (5 / 60)
    const appMinutesRemaining = Math.max(0, Math.ceil((realSecondsLeft / 60) * 5));
    const realMin = Math.floor(realSecondsLeft / 60);
    const realSec = realSecondsLeft % 60;
    const formattedRealTimer = `${String(realMin).padStart(2, '0')}:${String(realSec).padStart(2, '0')}`;

    if (liveTimeEl) {
      if (realSecondsLeft <= 0) {
        liveTimeEl.innerHTML = `<i class="bi bi-check-circle-fill" style="color:var(--green);"></i> Delivered! 🎉`;
      } else {
        liveTimeEl.innerHTML = `<i class="bi bi-clock-history"></i> ${appMinutesRemaining} min (${formattedRealTimer} real-time)`;
      }
    }
    if (etaEl) {
      if (realSecondsLeft <= 0) {
        etaEl.textContent = 'Delivered! Enjoy your meal!';
      } else {
        etaEl.textContent = `${appMinutesRemaining} min (${formattedRealTimer} real-time)`;
      }
    }

    let stepIndex = 0;

    if (elapsedRealSec < 60) {
      // 0 - 60s
      stepIndex = 0;
      if (statusText) statusText.textContent = 'Order Confirmed! Kitchen is preparing...';
      if (trackingEmoji) trackingEmoji.textContent = '📋';
      
      // Rider Allocation state
      if (elapsedRealSec < 8) {
        if (riderTitleEl) riderTitleEl.textContent = 'Allocating Delivery Partner...';
        if (riderNameEl) riderNameEl.textContent = 'Searching nearest rider in Kochi...';
        if (riderPhoneEl) riderPhoneEl.textContent = 'Pairing with optimal route';
        if (riderAvatarEl) {
          riderAvatarEl.className = 'rider-avatar allocating';
          riderAvatarEl.textContent = '🔍';
        }
      } else {
        if (riderTitleEl) riderTitleEl.textContent = 'Delivery Partner Assigned';
        if (riderNameEl) riderNameEl.textContent = `${assignedRider.name} (FeastFleet Pilot)`;
        if (riderPhoneEl) riderPhoneEl.textContent = `📞 ${assignedRider.phone} • Arriving at restaurant`;
        if (riderAvatarEl) {
          riderAvatarEl.className = 'rider-avatar';
          riderAvatarEl.textContent = '🏍️';
        }
      }

    } else if (elapsedRealSec < 180) {
      // 60 - 180s
      stepIndex = 1;
      if (statusText) statusText.textContent = 'Preparing Your Delicious Food 👨‍🍳';
      if (trackingEmoji) trackingEmoji.textContent = '👨‍🍳';
      if (riderTitleEl) riderTitleEl.textContent = 'Delivery Partner at Restaurant';
      if (riderNameEl) riderNameEl.textContent = `${assignedRider.name} is waiting for pickup`;
      if (riderPhoneEl) riderPhoneEl.textContent = `📞 ${assignedRider.phone} • Hot bag prepared`;
      if (riderAvatarEl) {
        riderAvatarEl.className = 'rider-avatar';
        riderAvatarEl.textContent = '🧑‍🍳';
      }

    } else if (elapsedRealSec < TOTAL_REAL_SECONDS) {
      // 180 - 299s
      stepIndex = 2;
      if (statusText) statusText.textContent = `${assignedRider.name} is On The Way to your location! 🏍️`;
      if (trackingEmoji) trackingEmoji.textContent = '🏍️';
      if (riderTitleEl) riderTitleEl.textContent = 'Delivery Partner Out for Delivery';
      if (riderNameEl) riderNameEl.textContent = `${assignedRider.name} is speeding towards you`;
      if (riderPhoneEl) riderPhoneEl.textContent = `📞 ${assignedRider.phone} • Reaching soon in Kochi`;
      if (riderAvatarEl) {
        riderAvatarEl.className = 'rider-avatar';
        riderAvatarEl.textContent = '🏍️';
      }

    } else {
      // 300s+
      stepIndex = 3;
      if (statusText) statusText.textContent = 'Order Delivered! Enjoy your feast! 🎉';
      if (trackingEmoji) trackingEmoji.textContent = '🎉';
      if (riderTitleEl) riderTitleEl.textContent = 'Delivered by';
      if (riderNameEl) riderNameEl.textContent = `${assignedRider.name} • Thank you for ordering!`;
      if (riderPhoneEl) riderPhoneEl.textContent = '⭐⭐⭐⭐⭐ Rate your delivery';
      if (riderAvatarEl) {
        riderAvatarEl.className = 'rider-avatar';
        riderAvatarEl.textContent = '✅';
      }
    }

    // Update Stepper steps
    steps.forEach((step, idx) => {
      step.classList.remove('active', 'completed');
      if (idx < stepIndex) {
        step.classList.add('completed');
      } else if (idx === stepIndex) {
        step.classList.add('active');
      }
    });

    // Update Progress bar width
    if (progressLine) {
      const pct = Math.min(100, (elapsedRealSec / TOTAL_REAL_SECONDS) * 100);
      progressLine.style.width = `${pct}%`;
    }

    return realSecondsLeft;
  }

  // Initial render immediately
  updateTrackingDisplay();

  // Run live countdown every second
  const timerInterval = setInterval(() => {
    const left = updateTrackingDisplay();
    if (left <= 0) {
      clearInterval(timerInterval);
    }
  }, 1000);
}

// ── FILTER RESTAURANTS ──
function filterRestaurants(filter) {
  document.querySelectorAll('.restaurant-card').forEach(card => {
    if (filter === 'all') {
      card.style.display = '';
    } else {
      card.style.display = card.dataset.cuisine === filter ? '' : 'none';
    }
  });
}

// ── PLACE ORDER ──
async function placeOrder() {
  if (cart.items.length === 0) return;

  const orderSummary = {
    items: cart.items,
    subtotal: cart.getTotal(),
    deliveryFee: 49,
    total: cart.getTotal() + 49,
    orderId: 'FF-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    restaurants: Array.from(new Set(cart.items.map(i => i.restaurant))),
    createdAt: new Date().toISOString()
  };

  // Save order for tracking page immediately
  localStorage.setItem('feastfleet_last_order', JSON.stringify(orderSummary));

  // If user is logged in, also sync to database via API
  if (typeof API !== 'undefined' && API.isLoggedIn()) {
    try {
      const res = await API.placeOrder({
        items: cart.items,
        subtotal: orderSummary.subtotal,
        deliveryFee: orderSummary.deliveryFee,
        total: orderSummary.total,
        restaurants: orderSummary.restaurants,
        deliveryAddress: { address: 'MG Road, Kochi, Kerala' }
      });
      if (res && res.success && res.data && res.data.orderId) {
        orderSummary.orderId = res.data.orderId;
        localStorage.setItem('feastfleet_last_order', JSON.stringify(orderSummary));
      }
    } catch (e) {
      console.warn('Could not sync order to API backend:', e);
    }
  }

  cart.clear();
  window.location.href = 'tracking.html';
}

// ── GLOBAL DETECT LOCATION FUNCTION ──
function detectLocation() {
  GeoLocation.detect();
}
