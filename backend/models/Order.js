import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableLabel: { type: String, required: true },
  orderType: { type: String, enum: ['dine-in', 'takeaway'], default: 'dine-in' },
  orderNumber: { type: String }, // Auto-generated for takeaway orders
  customerName: { type: String }, // Optional for takeaway
  customerPhone: { type: String }, // Optional for takeaway
  items: [{
    name: String,
    price: Number,
    quantity: Number,
    total: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['active', 'completed', 'preparing', 'ready'], default: 'active' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: null },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);