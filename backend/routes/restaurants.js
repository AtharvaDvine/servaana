import express from 'express';
import Restaurant from '../models/Restaurant.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get restaurant data
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete setup
router.put('/:id/setup', protect, async (req, res) => {
  try {
    const { tables, menuItems } = req.body;
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { 
        tables, 
        menuItems, 
        setupComplete: true 
      },
      { new: true }
    );

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update table status
router.put('/:id/tables/:tableLabel', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const restaurant = await Restaurant.findById(req.params.id);
    const table = restaurant.tables.find(t => t.label === req.params.tableLabel);
    
    if (table) {
      table.status = status;
      await restaurant.save();
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update restaurant profile
router.put('/:id/profile', protect, async (req, res) => {
  try {
    const { name, ownerName, email, phone, address, cuisineType, description, businessHours } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if email is being changed
    const emailChanged = email !== restaurant.email;
    
    // Update basic fields
    restaurant.name = name;
    restaurant.ownerName = ownerName;
    restaurant.phone = phone;
    restaurant.address = address;
    restaurant.cuisineType = cuisineType;
    restaurant.description = description;
    restaurant.businessHours = businessHours;
    
    if (emailChanged) {
      // Store new email as pending and generate verification token
      restaurant.pendingEmail = email;
      restaurant.emailVerificationToken = Math.random().toString(36).substring(2, 15);
      // In a real app, you'd send verification email here
      console.log(`Email verification token for ${email}: ${restaurant.emailVerificationToken}`);
    }
    
    await restaurant.save();
    
    res.json({
      ...restaurant.toObject(),
      password: undefined, // Don't send password
      emailChangeRequested: emailChanged
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify email change
router.post('/:id/verify-email', protect, async (req, res) => {
  try {
    const { token } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant || restaurant.emailVerificationToken !== token) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    restaurant.email = restaurant.pendingEmail;
    restaurant.emailVerified = true;
    restaurant.pendingEmail = undefined;
    restaurant.emailVerificationToken = undefined;
    
    await restaurant.save();
    
    res.json({ message: 'Email verified successfully', restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update notification settings
router.put('/:id/notifications', protect, async (req, res) => {
  try {
    const { notificationSettings } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    restaurant.notificationSettings = {
      ...restaurant.notificationSettings,
      ...notificationSettings
    };
    
    await restaurant.save();
    
    res.json({
      message: 'Notification settings updated successfully',
      notificationSettings: restaurant.notificationSettings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add expense
router.post('/:id/expenses', protect, async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    
    const restaurant = await Restaurant.findById(req.params.id);
    restaurant.expenses.push({ description, amount, category });
    await restaurant.save();

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;