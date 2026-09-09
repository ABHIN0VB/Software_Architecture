/* ============================================
   FEASTFLEET — API Client & Auth UI
   ============================================ */
// Support both local file opening (defaults to localhost:5000) and web server deployment
const API_BASE = window.location.origin.startsWith('http') && !window.location.origin.includes('5500')
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

class API {
  // ── TOKEN MANAGEMENT ──
  static getToken() { return localStorage.getItem('feastfleet_token'); }
  static setToken(token) { localStorage.setItem('feastfleet_token', token); }
  static removeToken() { localStorage.removeItem('feastfleet_token'); }

  static getUser() {
    const user = localStorage.getItem('feastfleet_user');
    return user ? JSON.parse(user) : null;
  }
  static setUser(user) {
    if (user) localStorage.setItem('feastfleet_user', JSON.stringify(user));
    else localStorage.removeItem('feastfleet_user');
  }
  static isLoggedIn() { return !!this.getToken(); }

  // ── CORE REQUEST ──
  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      if (response.status === 401) {
        this.removeToken();
        this.setUser(null);
        updateAuthUI();
      }
      return data;
    } catch (error) {
      console.warn('API Error (falling back gracefully):', error);
      throw error;
    }
  }

  static async get(endpoint) { return this.request(endpoint, { method: 'GET' }); }
  static async post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  static async put(endpoint, data) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }

  // ── AUTH ──
  static async register(name, email, password, phone) {
    const data = await this.post('/auth/register', { name, email, password, phone });
    if (data.success) {
      this.setToken(data.token);
      this.setUser(data.user || data.data);
      updateAuthUI();
    }
    return data;
  }

  static async login(email, password) {
    const data = await this.post('/auth/login', { email, password });
    if (data.success) {
      this.setToken(data.token);
      this.setUser(data.user || data.data);
      updateAuthUI();
    }
    return data;
  }

  static logout() {
    this.removeToken();
    this.setUser(null);
    updateAuthUI();
    window.location.href = 'index.html';
  }

  static async getProfile() { return this.get('/auth/profile'); }

  // ── DATA ──
  static async getRestaurants(filters = {}) {
    const params = new URLSearchParams();
    for (const key in filters) { if (filters[key]) params.append(key, filters[key]); }
    return this.get(`/restaurants${params.toString() ? '?' + params : ''}`);
  }
  static async getRestaurant(id) { return this.get(`/restaurants/${id}`); }
  static async getNearbyRestaurants(lat, lng, radius) { return this.get(`/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5}`); }
  static async getMenu(restaurantId) { return this.get(`/menu/${restaurantId}`); }
  static async placeOrder(orderData) { return this.post('/orders', orderData); }
  static async getOrders() { return this.get('/orders'); }
  static async getOrder(id) { return this.get(`/orders/${id}`); }
  static async trackOrder(id) { return this.get(`/orders/${id}/track`); }
  static async submitReview(data) { return this.post('/reviews', data); }
  static async getReviews(restaurantId) { return this.get(`/reviews/restaurant/${restaurantId}`); }

  // ── AI ──
  static async getRecommendations() { return this.get('/ai/recommendations'); }
  static async smartSearch(query, lat, lng) {
    let url = `/ai/search?q=${encodeURIComponent(query)}`;
    if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
    return this.get(url);
  }
  static async chatMessage(message, activeOrder) {
    const payload = { message };
    if (activeOrder) payload.activeOrder = activeOrder;
    return this.post('/ai/chat', payload);
  }
  static async predictIngredients(name, description, cuisine) {
    return this.post('/ai/predict-ingredients', { name, description, cuisine });
  }
}

// ── UPDATE NAVBAR AUTH UI ──
function updateAuthUI() {
  document.querySelectorAll('.nav-auth').forEach(container => {
    if (API.isLoggedIn()) {
      const user = API.getUser();
      const name = user ? (user.name || 'User') : 'User';
      const email = user ? (user.email || '') : '';
      const phone = user ? (user.phone || '') : '';
      const initials = name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

      container.innerHTML = `
        <div class="user-profile-nav">
          <button class="profile-avatar-btn" type="button" aria-label="User Menu" onclick="toggleUserDropdown(event)">
            <div class="profile-avatar">${initials}</div>
          </button>
          <div class="profile-dropdown" id="nav-profile-dropdown">
            <div class="profile-dropdown-header">
              <div class="profile-avatar-lg">${initials}</div>
              <div style="overflow:hidden;">
                <div class="profile-name" title="${name}">Welcome, ${name}! 👋</div>
                <div class="profile-email" title="${email}">${email || phone || 'FeastFleet Member'}</div>
              </div>
            </div>
            <div class="profile-dropdown-divider"></div>
            <a href="orders.html" class="profile-dropdown-item">
              <i class="bi bi-clock-history"></i> Order History
            </a>
            <a href="tracking.html" class="profile-dropdown-item">
              <i class="bi bi-geo-alt"></i> Track Live Order
            </a>
            <a href="cart.html" class="profile-dropdown-item">
              <i class="bi bi-bag-check"></i> My Cart
            </a>
            <a href="contact.html" class="profile-dropdown-item">
              <i class="bi bi-headset"></i> Support & Help
            </a>
            <div class="profile-dropdown-divider"></div>
            <a href="#" class="profile-dropdown-item logout" onclick="API.logout(); return false;">
              <i class="bi bi-box-arrow-right"></i> Log Out
            </a>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `<a href="login.html" class="btn-nav-login">Sign In</a>`;
    }
  });
}

function toggleUserDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('nav-profile-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-profile-nav')) {
    document.querySelectorAll('.profile-dropdown').forEach(d => d.classList.remove('show'));
  }
});

// Run automatically on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
  updateAuthUI();
}
