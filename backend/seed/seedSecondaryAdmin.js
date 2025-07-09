const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KeerthiDev:9AkQP1TaAYasb09H@keerthidev.stiw0.mongodb.net/Scout?retryWrites=true&w=majority';

async function seedSecondaryAdmin() {
  await mongoose.connect(MONGO_URI);
  const email = 'secondary@gmail.com';
  const password = 'secondaryadmin123';
  const role = 'secondary';
  // Delete any existing secondary admin with this email
  await Admin.deleteMany({ email });
  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hashedPassword, type: role, role });
  console.log('Secondary admin seeded:', email);
  process.exit(0);
}

seedSecondaryAdmin().catch(err => {
  console.error('Error seeding secondary admin:', err);
  process.exit(1);
}); 