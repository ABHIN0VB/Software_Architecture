/**
 * AI Food Ingredient Prediction Service
 * Analyzes dish name, description, and cuisine to predict:
 * - Ingredients list
 * - Primary base, proteins, aromatics, spices, sauces
 * - Allergens detected
 * - Dietary flags
 * - Flavor notes & AI confidence
 */

const INGREDIENT_KNOWLEDGE_BASE = {
  // Burgers & Sandwiches
  smash_burger: {
    ingredients: ['Two Smashed Beef Patties', 'Toasted Brioche Bun', 'Double Melted American Cheese', 'Dill Pickles', 'Caramelized Yellow Onions', 'House Secret Sauce'],
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Mustard'],
    dietary: 'Non-Vegetarian, High Protein',
    flavor: 'Deep Umami, Crispy Edges, Savory, Tangy',
    confidence: 98
  },
  cheese_loaded_burger: {
    ingredients: ['Seasoned Prime Patty', 'Fried Mozzarella Stick Patty', 'Melted Sharp Cheddar', 'Garlic Herb Mayo', 'Toasted Butter Bun', 'Crisp Romaine Lettuce'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    dietary: 'High Protein, Rich',
    flavor: 'Cheesy, Rich, Creamy, Decadent',
    confidence: 97
  },
  crispy_chicken_burger: {
    ingredients: ['Buttermilk Fried Chicken Breast', 'Spicy Paprika Flour Coating', 'Tangy Purple Cabbage Slaw', 'Spicy Chipotle Mayo', 'Pickled Jalapenos', 'Brioche Bun'],
    allergens: ['Gluten', 'Eggs', 'Dairy'],
    dietary: 'Non-Vegetarian, Spicy',
    flavor: 'Crispy, Spicy, Tangy, Zesty',
    confidence: 98
  },
  double_stack: {
    ingredients: ['Two Ground Beef Patties', 'Crispy Bacon Strips', 'Golden Beer-Battered Onion Rings', 'Hickory BBQ Sauce', 'Melted Cheddar Cheese', 'Sesame Bun'],
    allergens: ['Gluten', 'Dairy', 'Sesame', 'Soy'],
    dietary: 'Non-Vegetarian, Heavy Feast',
    flavor: 'Smoky, Sweet BBQ, Savory, Crispy',
    confidence: 96
  },
  french_fries: {
    ingredients: ['Russet Potatoes', 'Sea Salt', 'Vegetable Oil (Crispy Deep Fried)', 'House Herb Seasoning'],
    allergens: ['Gluten-Free (check shared fryer)'],
    dietary: 'Vegetarian, Vegan',
    flavor: 'Salty, Crispy, Golden, Comforting',
    confidence: 99
  },
  onion_rings: {
    ingredients: ['Thick-cut White Onions', 'Beer Batter Flour', 'Breadcrumbs', 'Black Pepper', 'Garlic Powder', 'Creamy Herb Dip'],
    allergens: ['Gluten', 'Dairy (in dip)', 'Eggs'],
    dietary: 'Vegetarian',
    flavor: 'Crispy, Sweet Onion, Herb Dip',
    confidence: 97
  },

  // Pizzas & Italian
  margherita_pizza: {
    ingredients: ['Slow-Fermented Dough', 'San Marzano Tomato Sauce', 'Fresh Buffalo Mozzarella', 'Extra Virgin Olive Oil', 'Fresh Basil Leaves', 'Sea Salt'],
    allergens: ['Gluten', 'Dairy'],
    dietary: 'Vegetarian',
    flavor: 'Herbaceous, Tangy Tomato, Creamy Cheese',
    confidence: 99
  },
  pepperoni_pizza: {
    ingredients: ['Hand-Tossed Pizza Crust', 'Zesty Herb Tomato Sauce', 'Shredded Mozzarella', 'Cured Pepperoni Slices', 'Oregano', 'Chili Flakes'],
    allergens: ['Gluten', 'Dairy'],
    dietary: 'Non-Vegetarian',
    flavor: 'Spicy, Savory, Salty, Cheesy',
    confidence: 98
  },
  bbq_chicken_pizza: {
    ingredients: ['Wood-Fired Pizza Base', 'Smoky Barbecue Sauce', 'Grilled Chicken Chunks', 'Red Onion Slices', 'Mozzarella & Smoked Gouda', 'Fresh Cilantro'],
    allergens: ['Gluten', 'Dairy', 'Soy'],
    dietary: 'Non-Vegetarian',
    flavor: 'Sweet & Smoky, Tangy, Savory',
    confidence: 96
  },
  veggie_supreme_pizza: {
    ingredients: ['Hand-Tossed Crust', 'Italian Herb Marinara', 'Mozzarella', 'Bell Peppers', 'Button Mushrooms', 'Black Olives', 'Red Onions', 'Sweet Corn'],
    allergens: ['Gluten', 'Dairy'],
    dietary: 'Vegetarian',
    flavor: 'Fresh, Herbaceous, Crisp Veggies, Cheesy',
    confidence: 97
  },
  penne_alfredo: {
    ingredients: ['Penne Rigate Durum Wheat Pasta', 'Heavy Fresh Cream', 'Parmesan Reggiano', 'Butter', 'Minced Garlic', 'Cracked Black Pepper', 'Parsley'],
    allergens: ['Gluten', 'Dairy'],
    dietary: 'Vegetarian',
    flavor: 'Ultra Creamy, Cheesy, Garlicky, Velvety',
    confidence: 98
  },
  spaghetti_bolognese: {
    ingredients: ['Spaghetti Pasta', 'Slow-Simmered Minced Meat', 'Tomatoes & Tomato Paste', 'Celery, Carrots & Onions', 'Garlic & Olive Oil', 'Parmesan Cheese'],
    allergens: ['Gluten', 'Dairy'],
    dietary: 'Non-Vegetarian',
    flavor: 'Rich, Meaty, Acidic, Herbaceous',
    confidence: 97
  },
  garlic_bread: {
    ingredients: ['Crusty French Baguette', 'Roasted Garlic Butter', 'Melted Mozzarella', 'Dried Oregano', 'Fresh Parsley'],
    allergens: ['Gluten', 'Dairy'],
    dietary: 'Vegetarian',
    flavor: 'Buttery, Garlicky, Cheesy, Toasted',
    confidence: 99
  },

  // Indian Curries & Biryani
  butter_chicken: {
    ingredients: ['Tandoori Chicken Chunks', 'Pureed Tomato & Onion Gravy', 'Cashew Nut Paste', 'Heavy Cream', 'Kasuri Methi (Fenugreek)', 'Butter', 'Garam Masala'],
    allergens: ['Dairy', 'Tree Nuts (Cashews)'],
    dietary: 'Non-Vegetarian, High Protein',
    flavor: 'Rich, Sweet, Creamy, Mildly Spiced, Aromatic',
    confidence: 99
  },
  paneer_tikka_masala: {
    ingredients: ['Charred Cottage Cheese (Paneer)', 'Yogurt Marinade', 'Tomato-Onion Gravy', 'Capsicum & Diced Onion', 'Ginger-Garlic Paste', 'Cardamom & Cloves', 'Fresh Coriander'],
    allergens: ['Dairy'],
    dietary: 'Vegetarian, High Protein',
    flavor: 'Smoky, Tangy, Spiced, Rich',
    confidence: 98
  },
  chicken_dum_biryani: {
    ingredients: ['Long Grain Aged Basmati Rice', 'Marinated Chicken with Bone', 'Saffron Infused Milk', 'Caramelized Birista (Fried Onions)', 'Ghee (Clarified Butter)', 'Mint & Coriander', 'Whole Spices (Star Anise, Mace, Bay Leaf)'],
    allergens: ['Dairy (Ghee/Milk)'],
    dietary: 'Non-Vegetarian, Traditional Dum Cooked',
    flavor: 'Aromatic, Spiced, Layered, Fragrant',
    confidence: 99
  },
  mutton_biryani: {
    ingredients: ['Tender Mutton Pieces', 'Aged Basmati Rice', 'Yogurt Marinade', 'Kewra & Saffron Water', 'Ghee & Shahi Jeera', 'Fried Crispy Onions', 'Cardamom & Cinnamon'],
    allergens: ['Dairy'],
    dietary: 'Non-Vegetarian, Royal Feast',
    flavor: 'Rich Mutton Juices, Fragrant, Deep Spices',
    confidence: 99
  },
  dal_makhani: {
    ingredients: ['Whole Black Lentils (Urad Dal)', 'Red Kidney Beans (Rajma)', 'Slow Cooked 12hrs with Butter', 'Fresh Cream', 'Tomato Puree', 'Ginger & Kasuri Methi'],
    allergens: ['Dairy'],
    dietary: 'Vegetarian, High Fiber',
    flavor: 'Earthy, Creamy, Velvety, Smoky',
    confidence: 99
  },
  tandoori_chicken: {
    ingredients: ['Chicken on the bone', 'Hung Curd (Yogurt)', 'Kashmiri Red Chili Powder', 'Ginger-Garlic Paste', 'Chaat Masala', 'Lemon Juice', 'Mustard Oil'],
    allergens: ['Dairy (Yogurt)', 'Mustard'],
    dietary: 'Non-Vegetarian, High Protein, Low Carb',
    flavor: 'Charred, Tangy, Spicy, Smoky',
    confidence: 98
  },

  // Japanese & Asian
  salmon_maki: {
    ingredients: ['Sashimi Grade Fresh Salmon', 'Seasoned Sushi Rice (Vinegar, Sugar, Salt)', 'Nori Seaweed Sheet', 'Toasted Sesame Seeds', 'Served with Wasabi & Pickled Ginger'],
    allergens: ['Fish', 'Sesame', 'Soy'],
    dietary: 'Pescatarian, High Omega-3',
    flavor: 'Fresh, Ocean Umami, Tangy Rice, Mild',
    confidence: 99
  },
  tuna_nigiri: {
    ingredients: ['Hand-pressed Sushi Rice', 'Prime Yellowfin Tuna Sashimi', 'Dab of Wasabi', 'Mirin & Rice Vinegar'],
    allergens: ['Fish', 'Soy'],
    dietary: 'Pescatarian, Clean Protein',
    flavor: 'Pure Fish Umami, Sweet Vinegared Rice',
    confidence: 98
  },
  chicken_ramen: {
    ingredients: ['Artisan Wheat Ramen Noodles', 'Rich Chicken & Dashi Broth', 'Tender Chicken Slices', 'Soft-boiled Egg', 'Bamboo Shoots (Menma)', 'Nori & Scallions'],
    allergens: ['Gluten', 'Eggs', 'Soy', 'Fish (Dashi)'],
    dietary: 'Non-Vegetarian',
    flavor: 'Deep Umami, Comforting Warmth, Savory Broth',
    confidence: 97
  },
  hakka_noodles: {
    ingredients: ['Stir-Fried Wheat Noodles', 'Shredded Cabbage, Carrots & Bell Peppers', 'Spring Onions', 'Dark Soy Sauce', 'White Pepper & Toasted Sesame Oil', 'Garlic & Chillies'],
    allergens: ['Gluten', 'Soy', 'Sesame'],
    dietary: 'Vegetarian',
    flavor: 'Wok-Hei, Savory, Crisp Veggies',
    confidence: 98
  },
  chicken_fried_rice: {
    ingredients: ['Long-Grain Rice', 'Diced Chicken Breast', 'Scrambled Eggs', 'Green Peas & Carrots', 'Light Soy Sauce & Garlic', 'Spring Onion Greens'],
    allergens: ['Eggs', 'Soy'],
    dietary: 'Non-Vegetarian',
    flavor: 'Savory, Fragrant, Classic Wok Style',
    confidence: 98
  },
  chilli_chicken: {
    ingredients: ['Crispy Cornstarch Fried Chicken', 'Sauteed Green Bell Peppers', 'Onion Petals', 'Green Chillies & Garlic', 'Chilli Paste & Soy Reduction', 'Spring Onions'],
    allergens: ['Soy', 'Gluten', 'Eggs'],
    dietary: 'Non-Vegetarian, Indo-Chinese',
    flavor: 'Spicy, Piquant, Glossy, Tangy',
    confidence: 98
  },

  // Mexican
  chicken_taco: {
    ingredients: ['Warm Tortilla (Soft Corn/Flour)', 'Spiced Grilled Chicken', 'Fresh Pico de Gallo (Tomato, Onion, Cilantro)', 'Crisp Shredded Lettuce', 'Cheddar Cheese', 'Crema & Lime'],
    allergens: ['Dairy', 'Gluten'],
    dietary: 'Non-Vegetarian',
    flavor: 'Zesty, Fresh Lime, Spiced, Crunchy',
    confidence: 98
  },
  beef_burrito: {
    ingredients: ['Large Flour Tortilla', 'Seasoned Ground Beef', 'Cilantro Lime Rice', 'Black Beans', 'Melted Jack Cheese', 'Fire-Roasted Salsa', 'Sour Cream'],
    allergens: ['Gluten', 'Dairy'],
    dietary: 'Non-Vegetarian, Hearty',
    flavor: 'Hearty, Cheesy, Spiced, Satisfying',
    confidence: 98
  },
  loaded_nachos: {
    ingredients: ['Stone Ground Corn Tortilla Chips', 'Warm Cheddar Queso Sauce', 'Pickled Jalapeno Rings', 'Fresh Tomato Salsa', 'Black Beans', 'Guacamole & Sour Cream'],
    allergens: ['Dairy'],
    dietary: 'Vegetarian',
    flavor: 'Crispy, Cheesy, Spicy, Tangy',
    confidence: 98
  },

  // Desserts & Beverages
  chocolate_truffle_cake: {
    ingredients: ['Dutch Cocoa Sponge', 'Dark Chocolate Ganache', 'Heavy Cream', 'Espresso Soak', 'Pure Vanilla Extract', 'Cacao Nibs'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    dietary: 'Vegetarian',
    flavor: 'Intense Dark Chocolate, Fudgy, Decadent',
    confidence: 99
  },
  red_velvet_cupcake: {
    ingredients: ['Cocoa-Buttermilk Sponge', 'Natural Beetroot Crimson Extract', 'Cream Cheese Frosting', 'Madagascar Vanilla', 'Powdered Sugar'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    dietary: 'Vegetarian',
    flavor: 'Tangy Cream Cheese, Velvety Cocoa, Sweet',
    confidence: 98
  },
  blueberry_cheesecake: {
    ingredients: ['Graham Cracker Crumb Crust', 'Philadelphia Cream Cheese', 'Sweetened Sour Cream', 'Simmered Wild Blueberry Compote', 'Lemon Zest'],
    allergens: ['Dairy', 'Gluten'],
    dietary: 'Vegetarian',
    flavor: 'Tart Berry, Creamy, Rich, Buttery Crust',
    confidence: 99
  },
  chocolate_shake: {
    ingredients: ['Whole Milk', 'Rich Chocolate Gelato / Ice Cream', 'Fudge Sauce', 'Whipped Cream', 'Dark Chocolate Curls'],
    allergens: ['Dairy'],
    dietary: 'Vegetarian, Sweet Beverage',
    flavor: 'Thick, Creamy, Sweet, Chocolaty',
    confidence: 99
  },
  cola: {
    ingredients: ['Carbonated Filtered Water', 'Caramel Color', 'Phosphoric Acid', 'Natural Flavors & Caffeine', 'Cane Sugar'],
    allergens: ['Allergen-Free'],
    dietary: 'Vegetarian, Vegan',
    flavor: 'Sweet, Fizzy, Refreshing, Citrus-Spice Undertones',
    confidence: 99
  },
  cappuccino: {
    ingredients: ['Freshly Pulled Arabica Espresso', 'Steamed Whole Milk', 'Dense Microfoam Milk Cap', 'Dusting of Dark Cocoa'],
    allergens: ['Dairy'],
    dietary: 'Vegetarian',
    flavor: 'Bold Coffee, Roasty, Silky Foam',
    confidence: 99
  },

  // Kerala & AK Take Away Pala Specialties
  al_faham: {
    ingredients: ['Whole Fresh Chicken with Skin Slits', 'Arabic 7-Spice Baharat Blend', 'Garlic & Ginger Puree', 'Fresh Lime Juice & Olive Oil', 'Thick Hung Curd', 'Smoked Charcoal Infusion'],
    allergens: ['Dairy (Yogurt)'],
    dietary: 'Non-Vegetarian, High Protein, Keto-Friendly',
    flavor: 'Charcoal-Smoked, Earthy Spices, Tender & Juicy, Mild Tang',
    confidence: 99
  },
  kothu_parotta: {
    ingredients: ['Fresh Shredded Malabar Porotta', 'Tender Spiced Chicken Chunks', 'Scrambled Farm Eggs', 'Caramelized Onions & Vine Tomatoes', 'Green Chillies & Curry Leaves', 'Rich Chicken Salna Gravy'],
    allergens: ['Gluten', 'Eggs'],
    dietary: 'Non-Vegetarian, Street Food Legend',
    flavor: 'Spicy, Flaky, Savory, Gravy-Infused Heat',
    confidence: 99
  },
  chicken_pottitherichath: {
    ingredients: ['Tender Country Chicken Pieces', 'Crushed Small Shallots (Kunjulli)', 'Fresh Green Curry Leaves', 'Cracked Black Pepper & Fennel Seeds', 'Kashmiri Chilli Flakes', 'Pure Cold-Pressed Coconut Oil'],
    allergens: ['Allergen-Free'],
    dietary: 'Non-Vegetarian, Authentic Kerala Naadan, Gluten-Free',
    flavor: 'Crispy Crunch, Deep Coconut Oil Aroma, Peppery Heat',
    confidence: 98
  },
  chicken_perattu: {
    ingredients: ['Country Chicken Morsels', 'Pan-Roasted Coconut Slivers (Thenga Kothu)', 'Crushed Shallots, Ginger & Garlic', 'Malabar Garam Masala', 'Curry Leaves & Green Chillies', 'Pure Coconut Oil'],
    allergens: ['Allergen-Free'],
    dietary: 'Non-Vegetarian, Authentic Kerala Roast',
    flavor: 'Semi-Dry, Spicy, Rich Toasted Coconut, Aromatic',
    confidence: 98
  },
  chilli_beef: {
    ingredients: ['Slow-Braised Beef Cubes', 'Crushed Malabar Black Peppercorns', 'Dark Soy Sauce & Green Chilli Slits', 'Capsicum & Diced Red Onions', 'Garlic Slivers & Ginger', 'Curry Leaves'],
    allergens: ['Soy'],
    dietary: 'Non-Vegetarian, High Protein',
    flavor: 'Fiery Hot, Savory Umami, Tender Meat, Peppery',
    confidence: 98
  },
  dragon_chicken: {
    ingredients: ['Crispy Shredded Chicken Strips', 'Red Chilli Paste & Szechuan Sauce', 'Roasted Cashew Nuts', 'Bell Peppers & Spring Onions', 'Honey Glaze & Garlic', 'White Sesame Seeds'],
    allergens: ['Gluten', 'Tree Nuts (Cashews)', 'Sesame', 'Soy'],
    dietary: 'Non-Vegetarian, Indo-Chinese Special',
    flavor: 'Crunchy, Sweet & Spicy, Tangy, Nutty',
    confidence: 98
  },
  chicken_555: {
    ingredients: ['Marinated Chicken Fingers', 'Egg White & Cornflour Batter', 'Spicy Tangy Red Sauce', 'Slit Green Chillies & Curry Leaves', 'Ginger-Garlic Paste'],
    allergens: ['Eggs', 'Soy'],
    dietary: 'Non-Vegetarian, Crispy Starter',
    flavor: 'Zesty, Tangy, Crispy, Medium Spicy',
    confidence: 97
  },
  chicken_roast: {
    ingredients: ['Tender Chicken Pieces', 'Thick Onion-Tomato Masala', 'Ginger-Garlic Paste', 'Fennel & Coriander Powder', 'Green Chillies & Curry Leaves', 'Coconut Oil'],
    allergens: ['Allergen-Free'],
    dietary: 'Non-Vegetarian, Kerala Naadan',
    flavor: 'Rich Gravy, Spiced, Savory, Onion Sweetness',
    confidence: 98
  },
  chilly_gopi: {
    ingredients: ['Crispy Cauliflower Florets', 'Cornflour & Maida Batter', 'Dark Soy Sauce & Red Chilli Sauce', 'Green Bell Peppers & Onions', 'Minced Garlic & Ginger', 'Spring Onion Greens'],
    allergens: ['Gluten', 'Soy'],
    dietary: 'Vegetarian, Vegan',
    flavor: 'Crispy, Tangy, Spicy, Garlicky',
    confidence: 99
  },
  gobhi_manchurian: {
    ingredients: ['Fried Cauliflower Dumplings', 'Manchurian Gravy with Garlic & Celery', 'Dark Soy Sauce & Vinegar', 'Chopped Onions & Fresh Coriander', 'White Pepper'],
    allergens: ['Gluten', 'Soy'],
    dietary: 'Vegetarian, Vegan',
    flavor: 'Umami-Rich, Saucy, Savory, Tangy',
    confidence: 98
  },
  paneer_butter_masala: {
    ingredients: ['Fresh Malai Paneer Cubes', 'Velvety Cashew-Tomato Puree', 'Salted Dairy Butter & Fresh Cream', 'Kasuri Methi', 'Kashmiri Chilli & Garam Masala'],
    allergens: ['Dairy', 'Tree Nuts (Cashews)'],
    dietary: 'Vegetarian, High Protein',
    flavor: 'Mildly Sweet, Creamy, Buttery, Aromatic',
    confidence: 99
  },
  tomatto_fry: {
    ingredients: ['Country Farm Tomatoes', 'Sliced Shallots', 'Green Chillies & Mustard Seeds', 'Turmeric & Red Chilli Powder', 'Curry Leaves & Pure Coconut Oil'],
    allergens: ['Mustard'],
    dietary: 'Vegetarian, Vegan, Gluten-Free',
    flavor: 'Tangy, Spicy, Homestyle Naadan',
    confidence: 97
  },
  parotta: {
    ingredients: ['Maida Wheat Flour', 'Ghee / Vegetable Oil', 'Pinch of Sugar & Sea Salt', 'Hand-Stretched Flaky Spiral Dough'],
    allergens: ['Gluten'],
    dietary: 'Vegetarian, Kerala Pride',
    flavor: 'Flaky, Buttery, Soft Layers with Crispy Edges',
    confidence: 99
  },
  sharjah_shake: {
    ingredients: ['Frozen Robusta / Njalipoovan Banana', 'Chilled Thick Milk', 'Boost / Malt Cocoa Powder', 'Vanilla Ice Cream Scoop', 'Crushed Roasted Peanuts & Cashews'],
    allergens: ['Dairy', 'Peanuts', 'Tree Nuts'],
    dietary: 'Vegetarian, Kerala Shake Legend',
    flavor: 'Rich Chocolate-Malt, Creamy Banana, Nutty Crunch',
    confidence: 99
  },
  dates_shake: {
    ingredients: ['Soft Arabian Seedless Dates', 'Chilled Full-Cream Milk', 'Natural Wild Honey', 'Cardamom Pinch', 'Crushed Almond Slivers'],
    allergens: ['Dairy', 'Tree Nuts (Almonds)'],
    dietary: 'Vegetarian, Naturally Sweet',
    flavor: 'Rich Caramel-Date Notes, Silky Smooth, Nourishing',
    confidence: 99
  },
  pista_shake: {
    ingredients: ['Blanched Iranian Pistachios', 'Chilled Thick Milk', 'Pistachio Gelato / Kulfi Base', 'Kewra & Cardamom Essence', 'Crushed Pista Garnish'],
    allergens: ['Dairy', 'Tree Nuts (Pistachios)'],
    dietary: 'Vegetarian',
    flavor: 'Nutty, Sweet, Aromatic, Creamy',
    confidence: 99
  }
};

/**
 * Predicts ingredients for any dish name and description
 */
function predictIngredients(name = '', description = '', cuisine = '') {
  const normName = name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
  const normDesc = (description || '').toLowerCase();
  const combined = `${normName} ${normDesc}`;

  // 1. Direct Knowledge Base Match
  for (const [key, data] of Object.entries(INGREDIENT_KNOWLEDGE_BASE)) {
    const keyParts = key.split('_');
    const matchesAll = keyParts.every(part => combined.includes(part));
    if (matchesAll && data.ingredients) {
      return {
        dishName: name,
        predictedIngredients: data.ingredients,
        allergens: data.allergens || ['None common'],
        dietary: data.dietary || 'Standard',
        flavorProfile: data.flavor || 'Savory',
        aiConfidence: data.confidence || 95,
        source: 'FeastFleet Neural Knowledge Engine'
      };
    }
  }

  // 2. Dynamic Semantic Predictor
  const ingredients = [];
  const allergens = new Set();
  let dietary = 'Vegetarian';
  let flavor = 'Savory, Balanced';
  let confidence = 90;

  // Carbs / Base
  if (combined.match(/\b(burger|slider)\b/)) {
    ingredients.push('Toasted Brioche Bun', 'House Sauce');
    allergens.add('Gluten');
    allergens.add('Eggs');
  } else if (combined.match(/\b(pizza)\b/)) {
    ingredients.push('Italian Wheat Pizza Dough', 'San Marzano Tomato Sauce', 'Mozzarella Cheese');
    allergens.add('Gluten');
    allergens.add('Dairy');
  } else if (combined.match(/\b(pasta|spaghetti|penne|alfredo)\b/)) {
    ingredients.push('Semolina Durum Wheat Pasta', 'Garlic & Olive Oil', 'Italian Herb Seasoning');
    allergens.add('Gluten');
  } else if (combined.match(/\b(biryani|fried rice|pulao|rice)\b/)) {
    ingredients.push('Aged Basmati Rice', 'Caramelized Onions', 'Whole Spices (Cinnamon, Cardamom, Cloves)');
  } else if (combined.match(/\b(noodle|ramen|chowmein|hakka)\b/)) {
    ingredients.push('Egg/Wheat Noodles', 'Soy Sauce Reduction', 'Julienned Vegetables');
    allergens.add('Gluten');
    allergens.add('Soy');
  } else if (combined.match(/\b(taco|burrito|quesadilla|fajita)\b/)) {
    ingredients.push('Tortilla Wrap', 'Pico de Gallo (Tomato & Onion)', 'Mexican Spices (Cumin & Chili)');
    allergens.add('Gluten');
  } else if (combined.match(/\b(shake|ice cream|sundae|cake|pastry|dessert|brownie)\b/)) {
    ingredients.push('Sweet Cream / Milk', 'Pure Cane Sugar', 'Natural Vanilla / Cacao');
    allergens.add('Dairy');
    dietary = 'Vegetarian, Sweet';
  } else if (combined.match(/\b(coffee|latte|cappuccino|tea|chai)\b/)) {
    ingredients.push('Fresh Brewed Coffee Beans / Tea Leaves', 'Steamed Milk / Water');
    allergens.add('Dairy');
    dietary = 'Beverage';
  }

  // Proteins
  if (combined.match(/\b(beef|bacon|pepperoni|steak)\b/)) {
    ingredients.unshift('Prime Ground Beef Patty / Strips');
    dietary = 'Non-Vegetarian, High Protein';
    confidence += 4;
  } else if (combined.match(/\b(chicken|poultry|tikka|wings|nugget)\b/)) {
    ingredients.unshift('Tender Chicken Breast / Chunks');
    dietary = 'Non-Vegetarian, High Protein';
    confidence += 4;
  } else if (combined.match(/\b(mutton|lamb|kebab|seekh)\b/)) {
    ingredients.unshift('Tender Mutton / Lamb Cut');
    dietary = 'Non-Vegetarian, High Protein';
    confidence += 4;
  } else if (combined.match(/\b(fish|salmon|tuna|prawn|shrimp|seafood)\b/)) {
    ingredients.unshift('Fresh Ocean Seafood (Fish/Prawn)');
    allergens.add('Fish / Shellfish');
    dietary = 'Pescatarian, High Omega-3';
    confidence += 4;
  } else if (combined.match(/\b(paneer|cottage cheese)\b/)) {
    ingredients.unshift('Fresh Malai Paneer (Cottage Cheese)');
    allergens.add('Dairy');
    dietary = 'Vegetarian, High Protein';
  } else if (combined.match(/\b(egg|omelette)\b/)) {
    ingredients.unshift('Farm Fresh Eggs');
    allergens.add('Eggs');
    dietary = 'Eggetarian, High Protein';
  }

  // Dairy & Cheese
  if (combined.match(/\b(cheese|cheddar|mozzarella|parmesan|cream)\b/)) {
    ingredients.push('Aged Cheddar / Mozzarella Cheese Blend');
    allergens.add('Dairy');
  }
  if (combined.match(/\b(butter|makhani|ghee)\b/)) {
    ingredients.push('Clarified Butter (Ghee) / Fresh Table Butter');
    allergens.add('Dairy');
  }

  // Aromatics & Herbs
  if (combined.match(/\b(curry|masala|tandoori|spicy|tikka|biryani)\b/)) {
    ingredients.push('Ginger-Garlic Paste', 'Ground Kashmiri Chili', 'Coriander & Cumin Powder', 'Garam Masala');
    flavor = 'Aromatic, Spiced, Rich';
  } else if (combined.match(/\b(bbq|barbecue|smoky)\b/)) {
    ingredients.push('Hickory Wood Smoked Sauce', 'Molasses', 'Cracked Pepper');
    flavor = 'Smoky, Sweet, Savory';
  } else if (combined.match(/\b(garlic)\b/)) {
    ingredients.push('Roasted Garlic Infusion', 'Italian Parsley');
  }

  // Pickles & Greens
  if (combined.match(/\b(burger|sandwich|sub)\b/)) {
    ingredients.push('Crisp Lettuce', 'Ripe Tomatoes', 'Dill Pickle Relish');
  } else if (combined.match(/\b(pizza|pasta)\b/)) {
    ingredients.push('Extra Virgin Olive Oil', 'Fresh Sweet Basil', 'Dry Oregano');
  }

  if (ingredients.length < 3) {
    ingredients.push('Locally Sourced Farm Produce', 'Sea Salt & Natural Spices', 'Chef Secret Blend');
  }

  return {
    dishName: name,
    predictedIngredients: ingredients.slice(0, 6),
    allergens: Array.from(allergens).length > 0 ? Array.from(allergens) : ['None common'],
    dietary,
    flavorProfile: flavor,
    aiConfidence: Math.min(99, confidence),
    source: 'FeastFleet Culinary AI Engine'
  };
}

module.exports = {
  predictIngredients
};
