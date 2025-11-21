import express from 'express';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import DailySummary from '../models/DailySummary.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/:restaurantId', protect, async (req, res) => {
  try {
    const { tableLabel, items, totalAmount, orderType = 'dine-in', customerName, customerPhone } = req.body;
    
    let orderNumber;
    
    // Generate order number for takeaway orders
    if (orderType === 'takeaway') {
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));
      
      const todayTakeawayCount = await Order.countDocuments({
        restaurantId: req.params.restaurantId,
        orderType: 'takeaway',
        createdAt: { $gte: todayStart, $lte: todayEnd }
      });
      
      orderNumber = `TO-${String(todayTakeawayCount + 1).padStart(3, '0')}`;
    }
    
    // Check if there's already an active order for this table (dine-in only)
    const existingOrder = orderType === 'dine-in' ? await Order.findOne({
      restaurantId: req.params.restaurantId,
      tableLabel,
      status: 'active'
    }) : null;

    let order;
    if (existingOrder) {
      // Update existing order instead of creating new one
      order = await Order.findByIdAndUpdate(
        existingOrder._id,
        { items, totalAmount },
        { new: true }
      );
    } else {
      // Create new order
      const orderData = {
        restaurantId: req.params.restaurantId,
        tableLabel: orderType === 'takeaway' ? `TAKEAWAY-${orderNumber}` : tableLabel,
        orderType,
        items,
        totalAmount,
        status: orderType === 'takeaway' ? 'preparing' : 'active'
      };
      
      if (orderType === 'takeaway') {
        orderData.orderNumber = orderNumber;
        if (customerName) orderData.customerName = customerName;
        if (customerPhone) orderData.customerPhone = customerPhone;
      }
      
      order = new Order(orderData);
      await order.save();
    }

    // Update table status to occupied (dine-in only)
    if (orderType === 'dine-in') {
      const restaurant = await Restaurant.findById(req.params.restaurantId);
      const table = restaurant.tables.find(t => t.label === tableLabel);
      if (table) {
        table.status = 'occupied';
        await restaurant.save();
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active orders for restaurant
router.get('/restaurant/:restaurantId', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 
      restaurantId: req.params.restaurantId, 
      status: 'active' 
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's takeaway orders
router.get('/restaurant/:restaurantId/takeaway', protect, async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const takeawayOrders = await Order.find({
      restaurantId: req.params.restaurantId,
      orderType: 'takeaway',
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).sort({ createdAt: -1 });
    
    res.json(takeawayOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update takeaway order status
router.put('/:orderId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint - get all orders for restaurant
router.get('/restaurant/:restaurantId/all', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 
      restaurantId: req.params.restaurantId
    }).sort({ createdAt: -1 });
    
    const summary = {
      total: orders.length,
      active: orders.filter(o => o.status === 'active').length,
      completed: orders.filter(o => o.status === 'completed').length,
      orders: orders.map(o => ({
        id: o._id,
        table: o.tableLabel,
        status: o.status,
        amount: o.totalAmount,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt
      }))
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete order (bill printed) - specific route must come first
router.put('/:orderId/complete', protect, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        status: 'completed',
        paymentMethod: paymentMethod || null
      },
      { new: true }
    );

    // Update table status to free (only for dine-in orders)
    if (order.orderType === 'dine-in') {
      const restaurant = await Restaurant.findById(order.restaurantId);
      const table = restaurant.tables.find(t => t.label === order.tableLabel);
      if (table) {
        table.status = 'free';
        await restaurant.save();
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order - must come before generic /:orderId route
router.delete('/:orderId', protect, async (req, res) => {
  try {
    console.log('Delete order request - ID:', req.params.orderId);
    
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update table status to free
    const restaurant = await Restaurant.findById(order.restaurantId);
    const table = restaurant.tables.find(t => t.label === order.tableLabel);
    if (table) {
      table.status = 'free';
      await restaurant.save();
    }

    await Order.findByIdAndDelete(req.params.orderId);
    console.log('Order deleted successfully');
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.log('Delete order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update order - generic route must come after specific routes
router.put('/:orderId', protect, async (req, res) => {
  try {
    console.log('Update order request - ID:', req.params.orderId);
    console.log('Update order request - Body:', req.body);
    
    const { items, totalAmount } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { items, totalAmount },
      { new: true }
    );

    console.log('Found order:', order);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.log('Update order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate daily summary for a specific date
router.post('/:restaurantId/generate-summary', protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date } = req.body; // Format: YYYY-MM-DD
    
    const targetDate = new Date(date);
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    // Get completed orders for the date
    const orders = await Order.find({
      restaurantId,
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get expenses for the date
    const restaurant = await Restaurant.findById(restaurantId);
    const expenses = restaurant.expenses?.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    }) || [];
    
    // Calculate totals
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = revenue - totalExpenses;
    const orderCount = orders.length;
    const takeawayCount = orders.filter(o => o.orderType === 'takeaway').length;
    const dineInCount = orders.filter(o => o.orderType === 'dine-in').length;
    
    // Create or update daily summary
    const summary = await DailySummary.findOneAndUpdate(
      { restaurantId, date: startDate },
      {
        revenue,
        expenses: totalExpenses,
        profit,
        orderCount,
        takeawayCount,
        dineInCount
      },
      { upsert: true, new: true }
    );
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get historical summaries
router.get('/:restaurantId/history', protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { period = 'daily', limit = 30 } = req.query;
    
    let summaries;
    
    if (period === 'daily') {
      // Get daily summaries
      summaries = await DailySummary.find({ restaurantId })
        .sort({ date: -1 })
        .limit(parseInt(limit));
    } else if (period === 'weekly') {
      // Aggregate by week
      summaries = await DailySummary.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              week: { $week: '$date' }
            },
            weekStart: { $min: '$date' },
            revenue: { $sum: '$revenue' },
            expenses: { $sum: '$expenses' },
            profit: { $sum: '$profit' },
            orderCount: { $sum: '$orderCount' },
            takeawayCount: { $sum: '$takeawayCount' },
            dineInCount: { $sum: '$dineInCount' }
          }
        },
        { $sort: { weekStart: -1 } },
        { $limit: parseInt(limit) }
      ]);
    } else if (period === 'monthly') {
      // Aggregate by month
      summaries = await DailySummary.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            monthStart: { $min: '$date' },
            revenue: { $sum: '$revenue' },
            expenses: { $sum: '$expenses' },
            profit: { $sum: '$profit' },
            orderCount: { $sum: '$orderCount' },
            takeawayCount: { $sum: '$takeawayCount' },
            dineInCount: { $sum: '$dineInCount' }
          }
        },
        { $sort: { monthStart: -1 } },
        { $limit: parseInt(limit) }
      ]);
    }
    
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;