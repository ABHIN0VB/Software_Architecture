const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const seedDatabase = async () => {
  try {
    console.log('Clearing existing data...');
    await Restaurant.deleteMany();
    await MenuItem.deleteMany();

    console.log('Inserting restaurants...');
    const restaurantsData = [
      {
        name: 'Burger Palace',
        cuisine: ['American', 'Fast Food', 'Burgers'],
        description: 'Best burgers in town, juicy and delicious.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60',
        rating: 4.5,
        reviewCount: 120,
        deliveryTime: '20-30 min',
        deliveryFee: 49,
        location: { area: 'MG Road, Kochi', lat: 9.9716, lng: 76.2846 },
        tags: ['Popular', 'Burgers']
      },
      {
        name: 'Sushi Master',
        cuisine: ['Japanese', 'Sushi', 'Asian'],
        description: 'Authentic Japanese sushi and ramen.',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=60',
        rating: 4.8,
        reviewCount: 95,
        deliveryTime: '30-45 min',
        deliveryFee: 79,
        location: { area: 'MG Road, Kochi', lat: 9.9725, lng: 76.2830 },
        tags: ['Premium', 'Sushi']
      },
      {
        name: 'Pizza Roma',
        cuisine: ['Italian', 'Pizza'],
        description: 'Wood-fired pizzas and fresh pastas.',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60',
        rating: 4.2,
        reviewCount: 200,
        deliveryTime: '25-40 min',
        deliveryFee: 59,
        location: { area: 'Fort Kochi', lat: 9.9639, lng: 76.2432 },
        tags: ['Pizza', 'Trending']
      },
      {
        name: 'Spice Garden',
        cuisine: ['North Indian', 'Mughlai', 'Curries'],
        description: 'Rich and spicy Indian curries.',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=500&q=60',
        rating: 4.4,
        reviewCount: 310,
        deliveryTime: '30-40 min',
        deliveryFee: 49,
        location: { area: 'Edappally, Kochi', lat: 9.9953, lng: 76.3025 },
        tags: ['Indian', 'Spicy']
      },
      {
        name: 'Sweet Treats',
        cuisine: ['Desserts', 'Bakery'],
        description: 'Cakes, pastries, and ice creams.',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=60',
        rating: 4.6,
        reviewCount: 85,
        deliveryTime: '15-25 min',
        deliveryFee: 29,
        location: { area: 'MG Road, Kochi', lat: 9.9710, lng: 76.2855 },
        tags: ['Desserts', 'Sweet']
      },
      {
        name: 'The Coffee House',
        cuisine: ['Cafe', 'Beverages', 'Snacks'],
        description: 'Premium coffee and quick bites.',
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=60',
        rating: 4.3,
        reviewCount: 150,
        deliveryTime: '20-30 min',
        deliveryFee: 39,
        location: { area: 'Panampilly Nagar', lat: 9.9620, lng: 76.2890 },
        tags: ['Cafe', 'Breakfast']
      },
      {
        name: 'Dragon Wok',
        cuisine: ['Chinese', 'Asian'],
        description: 'Delicious Chinese noodles and stir fries.',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=60',
        rating: 4.1,
        reviewCount: 180,
        deliveryTime: '30-45 min',
        deliveryFee: 59,
        location: { area: 'Kakkanad, Kochi', lat: 10.0155, lng: 76.3410 },
        tags: ['Chinese']
      },
      {
        name: 'Taco Fiesta',
        cuisine: ['Mexican', 'Tacos'],
        description: 'Authentic Mexican street food.',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=60',
        rating: 4.7,
        reviewCount: 110,
        deliveryTime: '25-35 min',
        deliveryFee: 49,
        location: { area: 'Fort Kochi', lat: 9.9645, lng: 76.2445 },
        tags: ['Mexican', 'New']
      },
      {
        name: 'Royal Biryani House',
        cuisine: ['Biryani', 'Indian'],
        description: 'Aromatic and flavorful biryanis.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=60',
        rating: 4.9,
        reviewCount: 450,
        deliveryTime: '35-50 min',
        deliveryFee: 69,
        location: { area: 'Edappally, Kochi', lat: 9.9960, lng: 76.3015 },
        tags: ['Biryani', 'Must Try']
      }
    ];

    const insertedRestaurants = await Restaurant.insertMany(restaurantsData);
    console.log(`Inserted ${insertedRestaurants.length} restaurants.`);

    const menuItems = [];

    // Helper to add items
    const addItem = (restName, name, desc, price, category, isVeg) => {
      const rest = insertedRestaurants.find(r => r.name === restName);
      if (rest) {
        menuItems.push({
          restaurant: rest._id,
          name,
          description: desc,
          price,
          category,
          isVeg,
          image: `https://source.unsplash.com/400x300/?${name.split(' ')[0]}`
        });
      }
    };

    // Burger Palace
    addItem('Burger Palace', 'Classic Chicken Burger', 'Crispy chicken patty with lettuce and mayo', 199, 'Burgers', false);
    addItem('Burger Palace', 'Veggie Delight Burger', 'Spicy potato patty with fresh veggies', 149, 'Burgers', true);
    addItem('Burger Palace', 'Double Cheese Beef Burger', 'Double beef patty with melted cheddar', 299, 'Burgers', false);
    addItem('Burger Palace', 'French Fries', 'Crispy golden fries', 99, 'Sides', true);
    addItem('Burger Palace', 'Onion Rings', 'Crispy battered onion rings', 129, 'Sides', true);
    addItem('Burger Palace', 'Coke', 'Chilled Coca Cola 330ml', 49, 'Drinks', true);
    addItem('Burger Palace', 'Chocolate Shake', 'Thick creamy chocolate milkshake', 149, 'Drinks', true);
    addItem('Burger Palace', 'Vanilla Ice Cream', 'Classic vanilla scoop', 79, 'Desserts', true);

    // Sushi Master
    addItem('Sushi Master', 'Salmon Maki', 'Fresh salmon roll', 349, 'Sushi', false);
    addItem('Sushi Master', 'Tuna Nigiri', 'Slice of raw tuna on rice', 299, 'Sushi', false);
    addItem('Sushi Master', 'Veg Tempura Roll', 'Crispy vegetable tempura roll', 249, 'Sushi', true);
    addItem('Sushi Master', 'Chicken Ramen', 'Rich broth with noodles and chicken', 399, 'Ramen', false);
    addItem('Sushi Master', 'Miso Soup', 'Traditional Japanese soup', 149, 'Soups', true);
    addItem('Sushi Master', 'Prawn Tempura', 'Crispy fried prawns', 349, 'Tempura', false);
    addItem('Sushi Master', 'Edamame', 'Steamed soybeans with salt', 199, 'Sides', true);
    addItem('Sushi Master', 'Green Tea', 'Authentic Japanese green tea', 99, 'Drinks', true);

    // Pizza Roma
    addItem('Pizza Roma', 'Margherita Pizza', 'Classic cheese and tomato', 249, 'Pizzas', true);
    addItem('Pizza Roma', 'Pepperoni Pizza', 'Beef pepperoni and mozzarella', 349, 'Pizzas', false);
    addItem('Pizza Roma', 'BBQ Chicken Pizza', 'Chicken with BBQ sauce and onions', 399, 'Pizzas', false);
    addItem('Pizza Roma', 'Veggie Supreme Pizza', 'Loaded with fresh vegetables', 299, 'Pizzas', true);
    addItem('Pizza Roma', 'Penne Alfredo', 'Pasta in creamy cheese sauce', 279, 'Pasta', true);
    addItem('Pizza Roma', 'Spaghetti Bolognese', 'Pasta in rich meat sauce', 349, 'Pasta', false);
    addItem('Pizza Roma', 'Garlic Bread', 'Oven baked garlic bread with cheese', 149, 'Sides', true);
    addItem('Pizza Roma', 'Iced Tea', 'Refreshing lemon iced tea', 99, 'Drinks', true);

    // Spice Garden
    addItem('Spice Garden', 'Butter Chicken', 'Creamy tomato gravy with chicken', 299, 'Curries', false);
    addItem('Spice Garden', 'Paneer Tikka Masala', 'Grilled cottage cheese in spicy gravy', 249, 'Curries', true);
    addItem('Spice Garden', 'Dal Makhani', 'Slow cooked black lentils', 199, 'Curries', true);
    addItem('Spice Garden', 'Tandoori Chicken', 'Roasted chicken marinated in yogurt and spices', 349, 'Tandoori', false);
    addItem('Spice Garden', 'Garlic Naan', 'Indian flatbread with garlic', 49, 'Breads', true);
    addItem('Spice Garden', 'Butter Naan', 'Indian flatbread with butter', 39, 'Breads', true);
    addItem('Spice Garden', 'Jeera Rice', 'Basmati rice flavored with cumin', 149, 'Rice', true);
    addItem('Spice Garden', 'Lassi', 'Sweet yogurt drink', 99, 'Drinks', true);

    // Sweet Treats
    addItem('Sweet Treats', 'Chocolate Truffle Cake', 'Rich and dense chocolate cake', 129, 'Cakes', true);
    addItem('Sweet Treats', 'Red Velvet Cupcake', 'Classic red velvet with cream cheese', 89, 'Pastries', true);
    addItem('Sweet Treats', 'Blueberry Cheesecake', 'Creamy cheesecake with blueberry topping', 149, 'Cakes', true);
    addItem('Sweet Treats', 'Brownie with Ice Cream', 'Warm chocolate brownie with vanilla scoop', 159, 'Desserts', true);
    addItem('Sweet Treats', 'Strawberry Shake', 'Fresh strawberry milkshake', 139, 'Shakes', true);
    addItem('Sweet Treats', 'Cold Coffee', 'Creamy blended cold coffee', 129, 'Drinks', true);

    // The Coffee House
    addItem('The Coffee House', 'Cappuccino', 'Classic Italian coffee', 149, 'Coffee', true);
    addItem('The Coffee House', 'Latte', 'Espresso with steamed milk', 159, 'Coffee', true);
    addItem('The Coffee House', 'Masala Chai', 'Indian spiced tea', 79, 'Tea', true);
    addItem('The Coffee House', 'Chicken Club Sandwich', 'Triple decker sandwich with chicken and egg', 199, 'Sandwiches', false);
    addItem('The Coffee House', 'Veg Grilled Sandwich', 'Toasted sandwich with veggies and cheese', 149, 'Sandwiches', true);
    addItem('The Coffee House', 'Paneer Wrap', 'Spicy cottage cheese wrapped in tortilla', 179, 'Wraps', true);

    // Dragon Wok
    addItem('Dragon Wok', 'Hakka Noodles', 'Stir fried noodles with veggies', 179, 'Noodles', true);
    addItem('Dragon Wok', 'Chicken Fried Rice', 'Classic chinese fried rice with chicken', 199, 'Rice', false);
    addItem('Dragon Wok', 'Veg Manchurian', 'Veg dumplings in soy garlic sauce', 189, 'Manchurian', true);
    addItem('Dragon Wok', 'Chilli Chicken', 'Spicy tossed chicken with bell peppers', 249, 'Starters', false);
    addItem('Dragon Wok', 'Sweet Corn Soup', 'Comforting thick corn soup', 129, 'Soups', true);
    addItem('Dragon Wok', 'Hot and Sour Soup', 'Spicy and tangy oriental soup', 129, 'Soups', true);
    addItem('Dragon Wok', 'Spring Rolls', 'Crispy rolls stuffed with veggies', 149, 'Starters', true);
    addItem('Dragon Wok', 'Prawns Chilli', 'Spicy prawns with soy and chillies', 349, 'Starters', false);

    // Taco Fiesta
    addItem('Taco Fiesta', 'Chicken Taco', 'Soft shell taco with spiced chicken', 149, 'Tacos', false);
    addItem('Taco Fiesta', 'Beef Burrito', 'Large tortilla wrapped with beef and beans', 249, 'Burritos', false);
    addItem('Taco Fiesta', 'Veg Quesadilla', 'Cheesy grilled tortilla with veggies', 199, 'Quesadillas', true);
    addItem('Taco Fiesta', 'Loaded Nachos', 'Tortilla chips topped with cheese and salsa', 179, 'Nachos', true);
    addItem('Taco Fiesta', 'Churros', 'Fried dough pastry with chocolate dip', 129, 'Desserts', true);
    addItem('Taco Fiesta', 'Lime Margarita', 'Refreshing lime drink', 149, 'Drinks', true);

    // Royal Biryani House
    addItem('Royal Biryani House', 'Chicken Dum Biryani', 'Classic slow-cooked chicken biryani', 249, 'Biryani', false);
    addItem('Royal Biryani House', 'Mutton Biryani', 'Rich and flavorful mutton biryani', 349, 'Biryani', false);
    addItem('Royal Biryani House', 'Veg Biryani', 'Aromatic rice cooked with fresh vegetables', 199, 'Biryani', true);
    addItem('Royal Biryani House', 'Chicken Tikka', 'Tandoor cooked spicy chicken chunks', 229, 'Kebabs', false);
    addItem('Royal Biryani House', 'Mutton Seekh Kebab', 'Minced mutton skewered and grilled', 299, 'Kebabs', false);
    addItem('Royal Biryani House', 'Paneer Butter Masala', 'Cottage cheese in rich tomato gravy', 219, 'Curries', true);
    addItem('Royal Biryani House', 'Chicken Korma', 'Mild creamy chicken curry', 259, 'Curries', false);
    addItem('Royal Biryani House', 'Boondi Raita', 'Yogurt with crisp gram flour pearls', 69, 'Sides', true);

    await MenuItem.insertMany(menuItems);
    console.log(`Inserted ${menuItems.length} menu items.`);
    
    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Export for auto-seed from db.js
module.exports = { seedDatabase };

// Allow direct execution: npm run seed
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
  const connectDB = require('./config/db');
  connectDB().then(() => seedDatabase()).then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
