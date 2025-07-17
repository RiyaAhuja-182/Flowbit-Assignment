const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./src/models/User');

async function seed() {
  try {
    console.log('Starting database seed...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowbit');
    console.log('Connected to MongoDB');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create LogisticsCo admin
    const logisticsAdmin = new User({
      email: 'admin@logisticsco.com',
      passwordHash: 'admin123', // Will be hashed by pre-save hook
      role: 'Admin',
      customerId: 'logisticsco'
    });
    
    // Create RetailGmbH admin
    const retailAdmin = new User({
      email: 'admin@retailgmbh.com',
      passwordHash: 'admin123', // Will be hashed by pre-save hook
      role: 'Admin',
      customerId: 'retailgmbh'
    });
    
    await logisticsAdmin.save();
    await retailAdmin.save();
    
    console.log('Seed data created successfully:');
    console.log('LogisticsCo Admin: admin@logisticsco.com / admin123');
    console.log('RetailGmbH Admin: admin@retailgmbh.com / admin123');
    
    await mongoose.disconnect();
    console.log('Seed completed and disconnected');
    
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
