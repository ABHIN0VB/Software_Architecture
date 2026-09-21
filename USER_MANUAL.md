# FEASTFLEET
## Next-Generation Food Delivery Platform with Behavioral & Conversational AI
### USER MANUAL & SYSTEM DOCUMENTATION

---

**Course / Subject:** Software Architecture & Engineering  
**Project Title:** FeastFleet — AI Food Intelligence Platform  
**Team Members:** Abhinav Babu & Team  
**Roll Numbers / ID:** [Insert Roll Numbers Here]  
**Academic Year:** 2026  

---

## Table of Contents
1. [Introduction](#1-introduction)
   - 1.1 Brief Description of the Software Product
   - 1.2 Purpose of the System
   - 1.3 Intended Users
2. [System Requirements](#2-system-requirements)
   - 2.1 Hardware Requirements
   - 2.2 Software & Runtime Requirements
   - 2.3 Browser & Platform Requirements
3. [Installation & Setup](#3-installation--setup)
   - 3.1 Step-by-Step Installation Instructions
   - 3.2 Cold-Start Auto-Seeding & In-Memory MongoDB
4. [User Login & Registration](#4-user-login--registration)
   - 4.1 Account Registration
   - 4.2 User Login & Session Persistence
5. [System Features & Functionalities](#5-system-features--functionalities)
   - 5.1 Multi-Restaurant Catalog & Hyper-Local Geolocation (Valavoor, Kottayam)
   - 5.2 🤖 Feature 1: Personal Food Agent (`ai-agent.html`)
   - 5.3 💰 Feature 2: AI Food Budget Optimizer (`budget-optimizer.html`)
   - 5.4 🧠 Feature 3: AI Food Memory & Habit Profiling (`food-profile.html`)
   - 5.5 📷 Feature 4: Visual Food Search (`visual-search.html`)
   - 5.6 👥 Feature 5: AI Group Ordering Agent (`group-order.html`)
   - 5.7 AI Ingredient Predictor & Recipe Explainer Modal
   - 5.8 Floating Conversational AI Chatbot Widget (FeastBot)
   - 5.9 Multi-Restaurant Cart with 1km Radius Rule & 5:1 Tracking Simulator
6. [System Navigation](#6-system-navigation)
7. [Input and Output Specifications](#7-input-and-output-specifications)
8. [Error Handling & System Messages](#8-error-handling--system-messages)
9. [Logout & Exit Procedures](#9-logout--exit-procedures)
10. [Troubleshooting & Frequently Asked Questions (FAQ)](#10-troubleshooting--frequently-asked-questions-faq)

---

## 1. Introduction

### 1.1 Brief Description of the Software Product
**FeastFleet** is an advanced, full-stack online food delivery platform built specifically to address modern recommender fatigue and complex multi-stakeholder dining decisions. While traditional food ordering apps provide static menus and basic keyword matching, FeastFleet incorporates a multi-tiered AI suite featuring:
- A constraint-based **Personal Food Agent**
- An **AI Food Budget Optimizer**
- Long-term **Behavioral Food Memory**
- A Computer-Vision-inspired **Visual Food Search**
- An autonomous **Group Ordering Solver**

Tailored with hyper-local Kerala context—including automated Valavoor, Kottayam geolocation and real menus from outlets like **AK Take Away, Pala**—FeastFleet supports the complete purchasing lifecycle from culinary discovery to cart management with radius validation and accelerated 5:1 delivery tracking with live rider allocation.

### 1.2 Purpose of the System
- **Solve Recommender Flattening:** Prevent repetitive suggestions by maintaining an active memory of user dining habits, peak order times, and repetition fatigue.
- **Natural Language Food Shopping:** Allow users to state ambiguous or complex dietary and cost constraints (e.g., *"I have ₹250, want something spicy, high protein, but no chicken today"*) and compute optimal meal matches instantly.
- **Solve Group Dining Deadlocks:** Automatically aggregate individual cravings, dietary rules, and budgets from team members or friends into a single optimal restaurant order with automated per-person payment splits.
- **Budget Optimization:** Deliver combinatorial meal solutions (main course + sides + beverages) that mathematically maximize value under strict budget limits while factoring in delivery fees and platform costs.
- **Ingredient Transparency:** Enable customers to inspect complete ingredients, preparation methods, and allergen warnings through an AI Ingredient Predictor prior to ordering.

### 1.3 Intended Users
- **Individual Diners & Students:** Fast ordering on strict budgets, seeking high-protein or quick meals near Valavoor / Kottayam campuses.
- **Work Teams & Social Groups:** Friends and colleagues ordering lunch from a single restaurant that satisfies both vegetarian and non-vegetarian requirements without endless debate.
- **Health-Conscious & Allergy-Prone Diners:** Users requiring strict exclusion filters (e.g., zero chicken, gluten-free, dairy-conscious) and ingredient transparency.
- **Restaurant Partners & Dispatchers:** Outlets seeking unified order dispatching with intelligent proximity and multi-restaurant order bundling.

---

## 2. System Requirements

### 2.1 Hardware Requirements

| Component | Minimum Requirement | Recommended Specification |
|---|---|---|
| **Processor (CPU)** | Dual-Core 2.0 GHz x64 or ARM | Intel Core i5 / AMD Ryzen 5 or Apple Silicon |
| **System Memory (RAM)** | 4 GB RAM | 8 GB to 16 GB RAM |
| **Storage Space** | 1 GB available disk space | 5 GB SSD available space |
| **Network** | Standard broadband (1 Mbps) | High-speed Internet (10+ Mbps / 4G / 5G) |

### 2.2 Software & Runtime Requirements
- **Node.js:** Version 18.x or higher (Tested and certified on Node.js v24.x).
- **Package Manager:** npm (v9.x or higher).
- **Database:** MongoDB (v6.0+) OR Embedded MongoDB Memory Server (bundled out-of-the-box for instant zero-config startup).
- **Operating System:** Microsoft Windows 10/11, macOS (Ventura+), or Linux (Ubuntu 20.04+).

### 2.3 Browser & Platform Requirements
FeastFleet is engineered as a responsive web application supporting modern ECMAScript standards, CSS Grid, Flexbox, and HTML5 Web Storage APIs. Supported browsers:
- Google Chrome: Version 100 or later (Recommended)
- Microsoft Edge: Version 100 or later
- Mozilla Firefox: Version 100 or later
- Apple Safari: Version 15 or later (macOS / iOS)
- Mobile Browsers: Chrome for Android, Safari for iOS

---

## 3. Installation & Setup

### 3.1 Step-by-Step Installation Instructions

#### Step 1: Clone or Extract Repository
```bash
git clone https://github.com/ABHIN0VB/Software_Architecture.git
cd Software_Architecture/feastfleet
```

#### Step 2: Install Node.js Dependencies
Install all required modules (Express, Mongoose, JWT, bcryptjs, mongodb-memory-server, cors, dotenv):
```bash
npm install
```

#### Step 3: Launch the FeastFleet Server
```bash
node server/server.js
```
The server checks whether a local MongoDB instance is present. If not found, it boots an in-memory MongoDB database and executes the auto-seed script inserting 9 curated restaurants and 66 menu items.

#### Step 4: Access the Application
Open your web browser and navigate to:
```
http://localhost:5000
```

---

## 4. User Login & Registration

FeastFleet features a dual-mode session architecture: users may browse restaurants, menus, and use all 5 AI features as guests, or register for persistent session tracking.

### 4.1 Account Registration
1. Click **Sign In** at the top-right corner of the navigation bar.
2. Select the **Create an Account** tab on `login.html`.
3. Enter your Full Name, Email Address, 10-digit Phone Number, and Password.
4. Click **Sign Up**. Passwords are encrypted using `bcryptjs` and a JSON Web Token (JWT) is stored in browser `localStorage`.

### 4.2 User Login & Profile Dropdown
1. Open `login.html` with the **Sign In** tab selected.
2. Enter your registered email address and password.
3. Upon authentication, your profile avatar appears in the top navigation bar.
4. Click the avatar to access **Order History**, **Track Live Order**, **My Cart**, and **Log Out**.

> 📷 **[INSERT SCREENSHOT: User Login & Registration Screen - login.html]**

---

## 5. System Features & Functionalities

### 5.1 Multi-Restaurant Catalog & Hyper-Local Geolocation
- **Valavoor Geolocation:** Detects "Valavoor, Kottayam" (9.7360° N, 76.6570° E), positioning **AK Take Away, Pala** (4.1 km, 30–35 min delivery) at the top of recommendations.
- **Dynamic Menus:** Complete menus with categories (Al Faham, Kerala Non-Veg, Porotta/Breads, Shakes), exact prices, and dietary indicators.

> 📷 **[INSERT SCREENSHOT: Restaurant Catalog & AK Take Away Pala Menu Screen - restaurants.html]**

---

### 5.2 🤖 Feature 1: Personal Food Agent (`ai-agent.html`)
An autonomous culinary assistant that parses complex human constraints, eliminates unwanted ingredients, balances caloric/protein goals, and identifies the best matching meal within an exact budget.

**Workflow:**
1. Open `ai-agent.html` from the top navbar or homepage AI Suite.
2. Set budget using the interactive slider (₹80 to ₹800).
3. Select mood/flavor chips: 🌶️ Spicy, 🥛 Creamy, 🔥 Grilled, 🍟 Crispy, 🥗 Light, etc.
4. Choose dietary preference (Any, Vegetarian Only, Non-Vegetarian Only).
5. Toggle **💪 High Protein** if seeking fitness meals.
6. Select strict exclusions (tap **🐔 Chicken** to avoid chicken, or beef, fish, paneer, egg).
7. Click **🤖 Find My Perfect Food**.
8. The AI displays a step-by-step reasoning trace, filters all items, calculates food price + delivery fee, and highlights the **⭐ BEST MATCH**.
9. Click **🛒 Add to Cart** directly on the card to stage the meal into the cart.

> 📷 **[INSERT SCREENSHOT: Personal Food Agent with Reasoning Trace & Ranked Matches - ai-agent.html]**

---

### 5.3 💰 Feature 2: AI Food Budget Optimizer (`budget-optimizer.html`)
A combinatorial optimization engine that solves dining constraints for groups of 1 to 10 people. It computes food subtotals, restaurant delivery fees, and platform fees (5%) to maximize savings under a specified budget ceiling.

**Workflow:**
1. Navigate to `budget-optimizer.html`.
2. Set total group budget slider (e.g., ₹500) and select headcount with +/- buttons (e.g., 4 people).
3. Choose preferred cuisine (Any, Indian, Chinese, Italian, Biryani, etc.).
4. Select meal structure checkboxes: Main Course, Side Dish, Drink, Dessert.
5. Click **💰 Optimize My Budget**.
6. Evaluates all restaurants, builds the cheapest valid combo per person, and outputs ranked comparison cards showing Food Subtotal, Delivery Fee, Platform Fee, Total, and Per-Person Split.
7. Click **🛒 Add Entire Combo for N People** to push the entire group combo directly to the cart.

> 📷 **[INSERT SCREENSHOT: AI Budget Optimizer with Per-Person Split & Combo Breakdown - budget-optimizer.html]**

---

### 5.4 🧠 Feature 3: AI Food Memory & Habit Profiling (`food-profile.html`)
Addresses "recommender flattening" by tracking historical orders across dimensions such as time-of-day, day-of-week, favorite cuisines, average spend, and repetition fatigue.

**Workflow:**
1. Navigate to `food-profile.html` or ask the chatbot "My Food Profile".
2. View dynamic analytics: Total Items Ordered, Weekly Orders, Avg Spend per Item, Peak Order Time, and Favorite Restaurant.
3. **Repetition Fatigue Detection:** If you order the same dish (e.g., Biryani) 2+ times in 7 days, an alert banner warns: *"You've had Chicken Biryani 3 times this week. Want something different?"*
4. **Diet Balance:** An interactive SVG pie chart visualizes your Vegetarian vs. Non-Vegetarian consumption ratio.
5. **Category Frequency:** Progress bars show consumption breakdown across Biryani, Curries, Breads, and Shakes.
6. **Weekly Activity Timeline:** Day dots indicate order activity from Sunday through Saturday.
7. Click **Load Demo Profile** to preview active behavioral data immediately.

> 📷 **[INSERT SCREENSHOT: AI Food Memory Analytics Dashboard & Repetition Alert - food-profile.html]**

---

### 5.5 📷 Feature 4: Visual Food Search (`visual-search.html`)
Enables users to discover dishes using imagery or visual descriptors. The engine applies semantic category matching and color-hint heuristics to match visual inputs against restaurant inventory.

**Workflow:**
1. Open `visual-search.html`.
2. Drag and drop a food image into the upload box (or click to select a photo file).
3. Alternatively, select a visual category card (🍗 Grilled/Tandoori, 🍚 Biryani/Rice, 🍔 Burger, 🍜 Noodles, 🍕 Pizza, 🍛 Curry, 🍰 Dessert, 🥤 Shake).
4. Optionally select a dominant color chip (Red, Orange, Yellow, Green, Brown, White) to refine flavor matching.
5. Click **📷 Find This Dish Near Me**.
6. View ranked matches tagged with **🎯 Closest Match**, restaurant ratings, delivery fees, and an instant **🛒 Add to Cart** button.

> 📷 **[INSERT SCREENSHOT: Visual Food Search with Photo Upload & Closest Match Card - visual-search.html]**

---

### 5.6 👥 Feature 5: AI Group Ordering Agent (`group-order.html`)
A multi-constraint team dining coordinator that allows group members (e.g., Rahul, Anu, Akhil) to register individual cravings, dietary rules (veg/non-veg), and personal budgets. The optimizer determines the single best restaurant that satisfies everyone, assigns dishes, and calculates the exact per-person bill split.

**Workflow:**
1. Navigate to `group-order.html`.
2. Set Total Group Budget (e.g., ₹800) and Max Delivery Time (e.g., 35 minutes).
3. Add or modify group members (e.g., Rahul: biryani, non-veg; Anu: paneer, vegetarian; Akhil: chicken noodles).
4. Click **🤖 Find Best Restaurant for Group**.
5. The AI checks menu overlap, eliminates restaurants lacking vegetarian dishes for veg members, and displays the winning restaurant.
6. **Dish Assignments:** Displays each member's assigned dish with prices.
7. Click **🛒 Add All Dishes to Cart** to add all items labeled with member names (e.g., "Paneer Butter Masala (Anu)") directly into the cart.

> 📷 **[INSERT SCREENSHOT: AI Group Ordering Interface with Individual Assignments - group-order.html]**

---

### 5.7 AI Ingredient Predictor & Recipe Explainer Modal
Available on all menu cards across restaurants. Clicking **✨ AI Ingredients** on any dish card opens an AI modal detailing the complete culinary recipe, key spices, fresh ingredients, allergen warnings (nuts, dairy, gluten), flavor profiles, and preparation time.

> 📷 **[INSERT SCREENSHOT: AI Ingredient Predictor Modal - menu-aktakeaway.html]**

---

### 5.8 Floating Conversational AI Chatbot Widget (FeastBot)
Available on every page in the bottom-right corner. It supports natural text input as well as one-tap quick action buttons linking to Track Order, Food Agent, Budget Optimizer, Food Profile, Visual Search, and Group Order. Users can type natural queries like *"I'm hungry, ₹250, spicy, no chicken"* and receive rich interactive cards with direct `[+ Cart]` buttons inside the chat.

> 📷 **[INSERT SCREENSHOT: FeastBot Floating AI Chatbot Widget with Quick Actions]**

---

### 5.9 Multi-Restaurant Cart with 1km Radius Rule & 5:1 Tracking
- **1km Radius Rule:** Allows bundling dishes from different restaurants into a single cart, provided all restaurants are within a 1.0 km radius of each other (calculated via Haversine formula). If a restaurant is too far away, a warning toast prevents order conflict.
- **5:1 Speed Tracking:** Simulates delivery progress at 5:1 speed (25-minute delivery finishes in 5 real minutes). A randomized Kerala delivery partner (Arjun, Rahul, Aditya, Karthik) is allocated with live contact info, progressing through: Order Placed → Confirmed → Preparing Food → Out for Delivery → Delivered.

> 📷 **[INSERT SCREENSHOT: Real-Time Order Tracking Page with 5:1 Speed Clock - tracking.html]**

---

## 6. System Navigation

| Screen / Module | File / Route | Primary Function & Navigation Pathways |
|---|---|---|
| **Home Page** | `index.html` | Hero banner, Category grid, Next-Gen AI Suite cards, Featured restaurants, Search bar. |
| **Restaurant Directory** | `restaurants.html` | Browse all 9 restaurants, filter by cuisine, Geolocation detect ("Valavoor, Kottayam"). |
| **Dedicated Menus** | `menu-aktakeaway.html`, `menu.html` | Category tabs, food cards, Add-to-Cart buttons, AI Ingredient Predictor modals. |
| **Personal Food Agent** | `ai-agent.html` | Autonomous constraint solver, reasoning trace, 1-click cart insertion. |
| **Budget Optimizer** | `budget-optimizer.html` | Combinatorial group meal optimizer, per-person split calculator, combo checkout. |
| **Food Memory** | `food-profile.html` | Behavioral analytics dashboard, diet balance, weekly timeline, repetition alerts. |
| **Visual Search & Group** | `visual-search.html`, `group-order.html` | Photo/category search and multi-user collaborative dining optimizer. |
| **Cart & Tracking** | `cart.html`, `tracking.html` | Cart review, 1km radius validation, checkout, 5:1 real-time delivery animation. |

---

## 7. Input and Output Specifications

| Module | User Inputs | System Output & Response |
|---|---|---|
| **Food Agent** | Budget slider (₹), mood chips, dietary select, protein toggle, exclusion chips. | Reasoning trace, filtered dishes, total price with delivery fee, budget badge, Cart button. |
| **Budget Optimizer** | Budget (₹), Headcount (1-10), Cuisine dropdown, Meal structure checkboxes. | Ranked restaurant combos, per-person breakdown, food/delivery/platform fee breakdown, group savings. |
| **Food Memory** | Historical order records (auto-collected via cart checkout). | Analytics cards, favorite dishes leaderboard, SVG diet balance pie, weekly activity dots, fatigue alerts. |
| **Visual Search** | Image file (JPG/PNG), dish category chip, color chip, or text query. | Expanded semantic search terms, top restaurant matches with photos, prices, ratings, and cart button. |
| **Group Order** | Group budget (₹), max delivery (min), member names, cravings, dietary rules, exclusions. | Winning single restaurant, personalized dish assignment per person, total cost, per-person split. |
| **Order Tracking** | Order checkout action from `cart.html`. | Order ID (`#FF-XXXX`), status pipeline, delivery partner name & phone, real-time 5:1 countdown clock. |

---

## 8. Error Handling & System Messages

1. **Restaurant Radius Violation:**
   - *Message:* `"⚠️ [Restaurant B] is X km from [Restaurant A]. Must be within 1.0 km!"`
   - *Resolution:* Clear the cart or select items from restaurants within 1.0 km radius.
2. **Over-Budget Optimization:**
   - *Message:* `"No combinations found within ₹[Budget]"`
   - *Resolution:* Increase the budget slider or simplify the meal structure (e.g. uncheck dessert).
3. **Strict Exclusion Deadlock:**
   - *Message:* `"No matches found for your constraints"`
   - *Resolution:* Relax one or more exclusion chips (e.g., allow paneer or egg).
4. **Empty Cart Checkout:**
   - *Message:* `"Your cart is empty"`
   - *Resolution:* Add at least one item before proceeding to checkout.
5. **Server Disconnect:**
   - *Message:* `"Cannot reach server. Start it with node server/server.js"`
   - *Resolution:* Verify that `node server/server.js` is running in the terminal on port 5000.

---

## 9. Logout & Exit Procedures

1. Click your **User Profile Avatar** located at the top-right of the navigation bar.
2. From the dropdown menu, select **Log Out**.
3. The system clears the JWT token from `localStorage`, resets user state, updates the navbar to "Sign In", and redirects safely to the homepage (`index.html`).
4. Active orders and cart items remain preserved in local storage for continuous guest usability.

---

## 10. Troubleshooting & Frequently Asked Questions (FAQ)

### Q1: What if port 5000 is already in use by another application?
**A:** You can change the port in `server/server.js` by setting the `PORT` variable (e.g., `const PORT = process.env.PORT || 5001`) or terminate the conflicting process via Task Manager.

### Q2: Does FeastFleet require an internet connection to run?
**A:** The backend, AI services, database, and all business logic run 100% locally on `localhost:5000` with zero cloud dependency. An active internet connection is only needed to load CDN icons (Bootstrap Icons) and Unsplash food images.

### Q3: How does the in-memory database work if I don't have MongoDB installed?
**A:** FeastFleet includes `mongodb-memory-server`. If local MongoDB on port 27017 is not found, the server spins up an isolated, in-memory MongoDB instance automatically and seeds all 9 restaurants and 66 dishes instantly.

### Q4: How does the 5:1 delivery tracking work?
**A:** Delivery tracking maps 1 real-world minute to 5 simulated app minutes. A 25-minute delivery will progress from "Order Placed" to "Delivered 🎉" in exactly 5 real minutes, allowing seamless demonstration of the full delivery lifecycle.

### Q5: How do I test the Food Memory feature if I am running the app for the first time?
**A:** Navigate to `food-profile.html` and click the purple **Load Demo Profile** button. It will instantly inject a realistic 12-order history, rendering the complete analytics dashboard, repetition warnings, and pie charts immediately.
