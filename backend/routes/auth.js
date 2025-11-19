import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, ownerName, email, phone, address, password } = req.body;
    
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({ message: 'Restaurant already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const restaurant = new Restaurant({
      name, ownerName, email, phone, address,
      password: hashedPassword
    });

    await restaurant.save();

    const token = jwt.sign({ id: restaurant._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        setupComplete: restaurant.setupComplete
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: restaurant._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        setupComplete: restaurant.setupComplete
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;