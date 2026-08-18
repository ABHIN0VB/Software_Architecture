/* ============================================
   FEASTFLEET — Application JavaScript
   Cart, Navigation, Tracking, Auth, FAQ
   ============================================ */

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

  addItem(item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...item, qty: 1 });
    }
    this.save();
    this.showToast(`${item.name} added to cart!`);
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

  showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #1a1a24;
      border: 1px solid rgba(255,107,53,0.3);
      color: #f0f0f5;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      z-index: 9999;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
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

  // Auth form submission
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      cart.showToast('Login successful! Redirecting...');
      setTimeout(() => window.location.href = 'index.html', 1500);
    });
  }

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
      document.querySelectorAll('.menu-item').forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
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
});

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

  container.innerHTML = cart.items.map(item => `
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

// ── ORDER TRACKING ANIMATION ──
function runTrackingAnimation() {
  const steps = document.querySelectorAll('.step');
  const progressLine = document.querySelector('.progress-line');
  const etaEl = document.getElementById('tracking-eta');
  const statusText = document.getElementById('tracking-status');
  
  const statuses = [
    { text: 'Order Confirmed', eta: '25-30 min', emoji: '📋' },
    { text: 'Preparing Your Food', eta: '18-22 min', emoji: '👨‍🍳' },
    { text: 'On The Way', eta: '8-12 min', emoji: '🏍️' },
    { text: 'Delivered!', eta: 'Enjoy!', emoji: '🎉' }
  ];

  let currentStep = 0;

  function advanceStep() {
    if (currentStep >= steps.length) return;

    // Mark previous steps as completed
    for (let i = 0; i < currentStep; i++) {
      steps[i].classList.remove('active');
      steps[i].classList.add('completed');
    }

    // Mark current step as active
    steps[currentStep].classList.add('active');

    // Update progress line
    const progressPercent = currentStep / (steps.length - 1) * 100;
    if (progressLine) progressLine.style.width = `${progressPercent}%`;

    // Update status text
    if (statusText) statusText.textContent = statuses[currentStep].text;
    if (etaEl) etaEl.textContent = statuses[currentStep].eta;

    // Update tracking emoji
    const trackingEmoji = document.getElementById('tracking-emoji');
    if (trackingEmoji) trackingEmoji.textContent = statuses[currentStep].emoji;

    currentStep++;

    if (currentStep < steps.length) {
      setTimeout(advanceStep, 3000);
    }
  }

  // Start animation after a short delay
  setTimeout(advanceStep, 800);
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
function placeOrder() {
  if (cart.items.length === 0) return;
  // Save order for tracking page
  localStorage.setItem('feastfleet_last_order', JSON.stringify({
    items: cart.items,
    total: cart.getTotal() + 5,
    orderId: 'FF-' + Math.random().toString(36).substr(2, 8).toUpperCase()
  }));
  cart.clear();
  window.location.href = 'tracking.html';
}
