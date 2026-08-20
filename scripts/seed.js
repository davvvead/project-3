require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ username: 'admin' });
    if (existing) {
      console.log('Admin account already exists. Skipping seed.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({
      username:    'admin',
      password:    hashedPassword,
      displayName: 'Administrator'
    });

    console.log('Admin account created successfully.');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
