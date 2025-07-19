const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'super', 'secondary'], default: 'user' },
  registrationTime: { type: Date, default: Date.now },
  dutyTime: { type: Number, default: 0 },
  qrCode: { type: String },
  nic: { type: String, required: true },
  profilePic: { type: String },
  dateOfBirth: { type: Date },
  age: { type: Number },
  school: { type: String },
  attendance: [
    {
      date: { type: String }, // e.g., '2024-06-30'
      comingTime: { type: String }, // e.g., '08:30'
      finishingTime: { type: String }, // e.g., '17:00'
      dutySchedule: { type: String } // e.g., 'Morning', 'Evening', etc.
    }
  ]
});

module.exports = mongoose.model('User', UserSchema); 