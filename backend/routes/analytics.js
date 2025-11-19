import express from 'express';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics routes working!' });
});

// Get analytics data for a restaurant
router.get('/:restaurantId', protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { timeRange = 'today' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate, endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    switch (timeRange) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Fetch orders and restaurant data
    const [orders, restaurant] = await Promise.all([
      Order.find({
        restaurantId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: 1 }),
      Restaurant.findById(restaurantId)
    ]);

    console.log(`Analytics: Found ${orders.length} orders for ${timeRange}`);
    console.log('Date range:', { startDate, endDate });
    console.log('Orders:', orders.map(o => ({ id: o._id, status: o.status, table: o.tableLabel, amount: o.totalAmount })));

    // Calculate metrics
    const completedOrders = orders.filter(order => order.status === 'completed');
    console.log(`Analytics: ${completedOrders.length} completed orders found`);
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = completedOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate expenses for the same period
    const expenses = restaurant.expenses?.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    }) || [];
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Daily breakdown
    const dailyData = {};
    completedOrders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, orders: 0, items: {} };
      }
      dailyData[date].revenue += order.totalAmount;
      dailyData[date].orders += 1;
      
      // Count items
      order.items.forEach(item => {
        dailyData[date].items[item.name] = (dailyData[date].items[item.name] || 0) + item.quantity;
      });
    });

    // Convert to array and fill missing dates
    const revenueData = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = dailyData[dateStr] || { revenue: 0, orders: 0, items: {} };
      
      revenueData.push({
        date: dateStr,
        revenue: dayData.revenue,
        orders: dayData.orders,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' })
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Popular items analysis
    const itemCounts = {};
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Expense breakdown by category
    const expensesByCategory = {};
    expenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
    });

    // Table utilization
    const activeTables = restaurant.tables?.filter(table => table.status === 'occupied').length || 0;
    const totalTables = restaurant.tables?.length || 0;
    const tableUtilization = totalTables > 0 ? (activeTables / totalTables) * 100 : 0;

    // Performance insights
    const bestDay = revenueData.reduce((max, day) => day.revenue > max.revenue ? day : max, revenueData[0]);
    const peakRevenue = Math.max(...revenueData.map(d => d.revenue));
    const growthRate = revenueData.length > 1 ? 
      ((revenueData[revenueData.length - 1].revenue - revenueData[0].revenue) / (revenueData[0].revenue || 1)) * 100 : 0;

    res.json({
      metrics: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalOrders,
        avgOrderValue,
        activeTables,
        profitMargin,
        tableUtilization
      },
      revenueData,
      popularItems,
      expensesByCategory,
      insights: {
        bestDay: bestDay?.date || null,
        peakRevenue,
        growthRate
      },
      todaysOrders: (timeRange === 'today' || timeRange === 'yesterday') ? completedOrders.map(order => ({
        _id: order._id,
        tableLabel: order.tableLabel,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        items: order.items,
        createdAt: order.createdAt,
        completedAt: order.updatedAt
      })).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)) : [],
      timeRange,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;