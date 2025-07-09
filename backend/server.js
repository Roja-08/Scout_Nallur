const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check route
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Backend is working' });
});

app.use('/api/auth/admin', adminRoutes);
app.use('/api/users', usersRouter);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
