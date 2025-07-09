const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KeerthiDev:9AkQP1TaAYasb09H@keerthidev.stiw0.mongodb.net/Scout?retryWrites=true&w=majority';

async function seedSuperAdmin() {
  await mongoose.connect(MONGO_URI);
  const email = 'super@gmail.com';
  const password = 'superadmin123';
  const role = 'super';
  // Delete any existing super admin with this email
  await Admin.deleteMany({ email });
  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hashedPassword, type: role, role });
  console.log('Super admin seeded:', email);
  process.exit(0);
}

seedSuperAdmin().catch(err => {
  console.error('Error seeding super admin:', err);
  process.exit(1);
}); 