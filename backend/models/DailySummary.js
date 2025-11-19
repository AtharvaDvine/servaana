import mongoose from 'mongoose';

const dailySummarySchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  date: { type: Date, required: true },
  revenue: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  takeawayCount: { type: Number, default: 0 },
  dineInCount: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure one summary per restaurant per date
dailySummarySchema.index({ restaurantId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailySummary', dailySummarySchema);