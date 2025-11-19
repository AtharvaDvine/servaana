import jwt from 'jsonwebtoken';
import Restaurant from '../models/Restaurant.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const restaurant = await Restaurant.findById(decoded.id).select('-password');
    
    if (!restaurant) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};