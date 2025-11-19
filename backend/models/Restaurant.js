import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  setupComplete: { type: Boolean, default: false },
  
  // Business Details
  cuisineType: { type: String, default: 'Multi-Cuisine' },
  description: { type: String, default: '' },
  businessHours: {
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '22:00' }
  },
  
  // Email verification
  emailVerified: { type: Boolean, default: false },
  pendingEmail: { type: String },
  emailVerificationToken: { type: String },
  
  // Notification Settings
  notificationSettings: {
    soundEnabled: { type: Boolean, default: true },
    soundVolume: { type: Number, default: 70 },
    browserNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
    orderCompleteSound: { type: String, default: 'success' },
    warningSound: { type: String, default: 'warning' },
    integrationSound: { type: String, default: 'notification' },
    generalSound: { type: String, default: 'default' }
  },
  tables: [{
    label: String,
    seats: Number,
    areaName: String,
    status: { type: String, enum: ['free', 'occupied'], default: 'free' },
    position: { x: Number, y: Number }
  }],
  menuItems: [{
    name: String,
    price: Number,
    description: String,
    categoryName: String,
    isDeleted: { type: Boolean, default: false }
  }],
  inventory: [{
    name: String,
    quantity: Number,
    unit: String,
    cost: Number
  }],
  expenses: [{
    description: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    category: String
  }]
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);