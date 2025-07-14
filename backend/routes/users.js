const express = require('express');
const User = require('../models/User');
const { authMiddleware, requireRole, requireAnyRole } = require('../middleware/auth');
const router = express.Router();
const QRCode = require('qrcode');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');

// Helper to calculate total duty time from attendance
function calculateTotalDutyTime(attendance) {
  if (!attendance) return 0;
  let total = 0;
  attendance.forEach(a => {
    if (a.comingTime && a.finishingTime) {
      const [h1, m1] = a.comingTime.split(':').map(Number);
      const [h2, m2] = a.finishingTime.split(':').map(Number);
      const start = h1 * 60 + m1;
      const end = h2 * 60 + m2;
      total += Math.max(0, end - start);
    }
  });
  return total;
}

// Get all users (leaderboard)
router.get('/', authMiddleware, requireAnyRole(['super', 'secondary']), async (req, res) => {
  try {
    const users = await User.find().sort({ dutyTime: -1 });
    // Add totalDutyTime to each user
    const usersWithDuty = users.map(u => {
      const userObj = u.toObject();
      userObj.totalDutyTime = calculateTotalDutyTime(userObj.attendance);
      return userObj;
    });
    res.json(usersWithDuty);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single user by ID
router.get('/:id', authMiddleware, requireAnyRole(['super', 'secondary']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userObj = user.toObject();
    userObj.totalDutyTime = calculateTotalDutyTime(userObj.attendance);
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update duty time (admin only, now attendance)
router.put('/:id/duty', authMiddleware, requireAnyRole(['super', 'secondary']), async (req, res) => {
  try {
    const { date, comingTime, finishingTime } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    let updated = false;
    // Find attendance for the date
    const att = user.attendance.find(a => a.date === date);
    if (att) {
      if (comingTime) att.comingTime = comingTime;
      if (finishingTime) att.finishingTime = finishingTime;
      updated = true;
    } else {
      user.attendance.push({ date, comingTime: comingTime || '', finishingTime: finishingTime || '' });
      updated = true;
    }
    await user.save();
    res.json({ message: updated ? 'Attendance updated' : 'No changes', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit user (admin only) - with email notification
router.put('/:id', authMiddleware, requireAnyRole(['super', 'secondary']), async (req, res) => {
  try {
    const { name, email, phoneNumber, nic, profilePic, dateOfBirth, school } = req.body;
    // Get the original user data before update
    const originalUser = await User.findById(req.params.id);
    if (!originalUser) return res.status(404).json({ message: 'User not found' });
    // Calculate age if dateOfBirth is provided
    let age = originalUser.age;
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
    }
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, nic, profilePic, dateOfBirth, age, school },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    // Determine what fields were actually changed
    const updatedFields = {};
    if (name !== originalUser.name) updatedFields.name = name;
    if (email !== originalUser.email) updatedFields.email = email;
    if (phoneNumber !== originalUser.phoneNumber) updatedFields.phoneNumber = phoneNumber;
    if (nic !== originalUser.nic) updatedFields.nic = nic;
    if (profilePic !== originalUser.profilePic) updatedFields.profilePic = 'Updated';
    if (dateOfBirth && dateOfBirth !== originalUser.dateOfBirth?.toISOString()) updatedFields.dateOfBirth = dateOfBirth;
    if (school !== originalUser.school) updatedFields.school = school;
    if (age !== originalUser.age) updatedFields.age = age;
    // Send email notification if any fields were changed
    if (Object.keys(updatedFields).length > 0) {
      try {
        const emailTemplate = emailTemplates.profileUpdate(updatedUser, updatedFields);
        await sendEmail({
          to: updatedUser.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });
        console.log(`Profile update email sent to ${updatedUser.email}`);
      } catch (emailError) {
        console.error('Failed to send profile update email:', emailError.message);
        // Don't fail the request if email fails
      }
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user (super admin only) - with email notification
router.delete('/:id', authMiddleware, requireRole('super'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Store user data before deletion for email
    const userData = user.toObject();
    const adminEmail = req.user.email;
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    // Send deletion notification email
    try {
      const emailTemplate = emailTemplates.userDeletion(userData, adminEmail);
      await sendEmail({
        to: userData.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
      console.log(`User deletion email sent to ${userData.email}`);
    } catch (emailError) {
      console.error('Failed to send user deletion email:', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Generate QR code for user (admin only)
router.get('/:id/qrcode', authMiddleware, requireAnyRole(['super', 'secondary']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const qrData = `ID:${user._id},Name:${user.name}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    res.json({ qrCodeUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Resend QR code to user via email (admin only)
router.post('/:id/resend-qr', authMiddleware, requireAnyRole(['super', 'secondary']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Generate QR code
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrCodeUrl = `${baseUrl}/user/${user._id}`;
    const qrCode = await QRCode.toDataURL(qrCodeUrl);
    
    // Update user's QR code in database
    user.qrCode = qrCode;
    await user.save();
    
    // Send QR code email
    try {
      const emailTemplate = emailTemplates.registration(user.toObject(), qrCode);
      await sendEmail({
        to: user.email,
        subject: 'Your Scout QR Code - Resent',
        html: emailTemplate.html.replace('Welcome to Scout - Your Registration is Complete! 🎉', 'Your Scout QR Code - Resent 📱'),
        text: emailTemplate.text.replace('Welcome to Scout - Your Registration is Complete!', 'Your Scout QR Code - Resent'),
        attachments: [
          {
            filename: 'scout-qr-code.png',
            content: qrCode.split(',')[1],
            encoding: 'base64',
          },
        ],
      });
      console.log(`QR code resent to ${user.email}`);
      res.json({ message: 'QR code sent successfully to user email' });
    } catch (emailError) {
      console.error('Failed to send QR code email:', emailError.message);
      res.status(500).json({ message: 'Failed to send email', error: emailError.message });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin-driven user registration (super only) - with professional email
router.post('/', authMiddleware, requireRole('super'), async (req, res) => {
  console.log('Register API called', req.body, req.user);
  try {
    const { name, email, phoneNumber, password, nic, profilePic, dateOfBirth, school } = req.body;
    if (!name || !email || !phoneNumber || !password || !nic || !dateOfBirth || !school) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Calculate age from dateOfBirth
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    // Generate next registration number (ID) with dash
    let nextId = '2025-101';
    const last2025User = await User.findOne({ _id: { $regex: '^2025-' } }).sort({ _id: -1 });
    if (last2025User) {
      const [year, idx] = last2025User._id.split('-');
      nextId = `${year}-${parseInt(idx) + 1}`;
    }
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }, { _id: nextId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await require('bcryptjs').hash(password, 10);
    // Create the user
    const user = new User({ _id: nextId, name, email, phoneNumber, password: hashedPassword, nic, profilePic, dateOfBirth: dob, age, school });
    await user.save();
    // Generate QR code with the real user ID
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrCodeUrl = `${baseUrl}/user/${user._id}`;
    const qrCode = await QRCode.toDataURL(qrCodeUrl);
    // Update user with QR code
    user.qrCode = qrCode;
    await user.save();
    // Send professional registration email with QR code
    try {
      const emailTemplate = emailTemplates.registration(user.toObject(), qrCode);
      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        attachments: [
          {
            filename: 'scout-qr-code.png',
            content: qrCode.split(',')[1],
            encoding: 'base64',
          },
        ],
      });
      console.log(`Registration email with QR code sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError.message);
      // Don't fail the request if email fails
    }
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Public route: get leaderboard (for QR scan) - MUST come before /public/:id
router.get('/public/leaderboard', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    // Add totalDutyTime to each user and sort by it
    const usersWithDuty = users.map(u => {
      const userObj = u.toObject();
      userObj.totalDutyTime = calculateTotalDutyTime(userObj.attendance);
      return userObj;
    }).sort((a, b) => b.totalDutyTime - a.totalDutyTime);
    res.json(usersWithDuty);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Public route: get user info by ID (for QR scan)
router.get('/public/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 