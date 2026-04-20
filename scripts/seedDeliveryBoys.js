const mongoose = require('mongoose');
require('dotenv').config();
const DeliveryBoy = require('../models/DeliveryBoy');

// Connect to MongoDB
console.log("db_",process.env.DB_URI);

mongoose.connect("mongodb+srv://wtlmanasitambe:wtl_dairyproducts@parshuram.my8ne.mongodb.net/")
  .then(() => console.log('MongoDB connected for seeding delivery boys'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample delivery boy data
const deliveryBoys = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    pincodes: ['411014', '411028', '411057','411022'],
    areas: ['Kharadi', 'Viman Nagar', 'Wagholi'],
    isAvailable: true,
    maxOrdersPerDay: 25
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '9876543211',
    pincodes: ['411001', '411002', '411003'],
    areas: ['Shivaji Nagar', 'Camp', 'Koregaon Park'],
    isAvailable: true,
    maxOrdersPerDay: 20
  },
  {
    name: 'Suresh Kumar',
    email: 'suresh.kumar@example.com',
    phone: '9876543212',
    pincodes: ['411040', '411041', '411042'],
    areas: ['Aundh', 'Baner', 'Pashan'],
    isAvailable: true,
    maxOrdersPerDay: 22
  },
  {
    name: 'Vijay Deshmukh',
    email: 'vijay.deshmukh@example.com',
    phone: '9876543213',
    pincodes: ['411027', '411033', '411036'],
    areas: ['Hadapsar', 'Magarpatta', 'Mundhwa'],
    isAvailable: true,
    maxOrdersPerDay: 18
  },
  {
    name: 'Rajesh Patil',
    email: 'rajesh.patil@example.com',
    phone: '9876543214',
    pincodes: ['411038', '411044', '411051'],
    areas: ['Hinjewadi', 'Wakad', 'Pimple Saudagar'],
    isAvailable: true,
    maxOrdersPerDay: 20
  }
];

// Function to seed delivery boys
const seedDeliveryBoys = async () => {
  try {
    // Clear existing data
    await DeliveryBoy.deleteMany({});
    console.log('Deleted existing delivery boys');

    // Insert new data
    const createdDeliveryBoys = await DeliveryBoy.insertMany(deliveryBoys);
    console.log(`${createdDeliveryBoys.length} delivery boys created successfully`);
    
    // Log the created delivery boys
    createdDeliveryBoys.forEach(boy => {
      console.log(`Created: ${boy.name} (${boy._id}) - Areas: ${boy.areas.join(', ')}`);
    });

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding delivery boys:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDeliveryBoys();