const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// User Registration
// Remove or disable the public user registration endpoint
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, phoneNumber, password } = req.body;
//     if (!name || !email || !phoneNumber || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }
//     const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, phoneNumber, password: hashedPassword });
//     await user.save();
//     // Send registration email
//     try {
//       await sendEmail({
//         to: email,
//         subject: 'Welcome to Scout',
//         text: `Hello ${name},\n\nYour registration was successful!`,
//       });
//     } catch (e) { console.error('Email error:', e.message); }
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User Login for Status Page Access (by User ID)
router.post('/user-login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    // Return success without token (for status page access only)
    res.json({ 
      message: 'Authentication successful',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin Registration (Super Admin only, for demo)
router.post('/admin/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashedPassword, role });
    await admin.save();
    // Send registration email
    try {
      await sendEmail({
        to: email,
        subject: 'Scout Admin Registration',
        text: `Hello,\n\nYou have been registered as a ${role} admin.`,
      });
    } catch (e) { console.error('Email error:', e.message); }
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  console.log('[ADMIN LOGIN ENDPOINT HIT]', req.body); // Log incoming login requests
  try {
    const { email, password, role, adminType } = req.body;
    const adminRole = role || adminType; // support both keys
    if (!email || !password || !adminRole) {
      return res.status(400).json({ message: 'Email, password, and adminType/role are required.' });
    }
    // Debug: log all admins with this email
    const allAdmins = await Admin.find({ email });
    console.log('DEBUG: all admins with this email', allAdmins);
    // Support both 'role' and 'type' fields
    const admin = await Admin.findOne({
      $or: [
        { email, role: adminRole },
        { email, type: adminRole }
      ]
    });
    console.log('DEBUG: found admin', admin);
    if (!admin) {
      console.warn(`[LOGIN FAIL] Admin not found: email=${email}, role/type=${adminRole}`);
      return res.status(401).json({ message: 'No admin found with this email and role/type.' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.warn(`[LOGIN FAIL] Invalid password: email=${email}, role/type=${adminRole}`);
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
    console.info(`[LOGIN SUCCESS] email=${email}, role/type=${adminRole}`);
    res.json({ token, adminType: admin.role, adminId: admin._id });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all admins (super only)
router.get('/admin', authMiddleware, requireRole('super'), async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single admin (super only)
router.get('/admin/:id', authMiddleware, requireRole('super'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit admin (super only)
router.put('/admin/:id', authMiddleware, requireRole('super'), async (req, res) => {
  try {
    const { email, role } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { email, role },
      { new: true }
    );
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete admin (super only)
router.delete('/admin/:id', authMiddleware, requireRole('super'), async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Password reset for user or admin (by email)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }
    let user = await User.findOne({ email });
    if (user) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      // Send password reset email
      try {
        await sendEmail({
          to: email,
          subject: 'Scout Password Reset',
          text: `Hello,\n\nYour password has been reset successfully.`,
        });
      } catch (e) { console.error('Email error:', e.message); }
      return res.json({ message: 'User password reset successfully' });
    }
    let admin = await Admin.findOne({ email });
    if (admin) {
      admin.password = await bcrypt.hash(newPassword, 10);
      await admin.save();
      // Send password reset email
      try {
        await sendEmail({
          to: email,
          subject: 'Scout Admin Password Reset',
          text: `Hello,\n\nYour admin password has been reset successfully.`,
        });
      } catch (e) { console.error('Email error:', e.message); }
      return res.json({ message: 'Admin password reset successfully' });
    }
    res.status(404).json({ message: 'No user or admin found with that email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 