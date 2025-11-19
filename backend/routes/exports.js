import express from 'express';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Export routes working' });
});

// Generate sales report
router.post('/:restaurantId/sales', protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { startDate, endDate, format = 'pdf' } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      restaurantId,
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).sort({ createdAt: -1 });

    const restaurant = await Restaurant.findById(restaurantId);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const isDetailed = daysDiff <= 1;

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${startDate}-to-${endDate}.pdf"`);
      doc.pipe(res);

      // Header
      doc.fontSize(20).text(`${restaurant.name} - Sales Report`, 50, 50);
      doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, 50, 80);
      
      let yPos = 120;
      const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      if (isDetailed) {
        // Detailed view for daily reports
        orders.forEach(order => {
          doc.text(`Table ${order.tableLabel} - ₹${order.totalAmount} - ${new Date(order.createdAt).toLocaleTimeString()}`, 50, yPos);
          yPos += 20;
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }
        });
      } else {
        // Summary view for longer periods
        const dailyTotals = {};
        orders.forEach(order => {
          const date = new Date(order.createdAt).toDateString();
          dailyTotals[date] = (dailyTotals[date] || 0) + order.totalAmount;
        });
        
        Object.entries(dailyTotals).forEach(([date, amount]) => {
          doc.text(`${date}: ₹${amount}`, 50, yPos);
          yPos += 20;
        });
      }
      
      doc.text(`Total Revenue: ₹${total}`, 50, yPos + 20);
      doc.end();
    } else if (format === 'csv') {
      const fields = isDetailed 
        ? ['tableLabel', 'totalAmount', 'createdAt', 'items']
        : ['date', 'totalRevenue', 'orderCount'];
      
      let data;
      if (isDetailed) {
        data = orders.map(order => ({
          tableLabel: order.tableLabel,
          totalAmount: order.totalAmount,
          createdAt: new Date(order.createdAt).toLocaleString(),
          items: order.items.map(item => `${item.name} x${item.quantity}`).join('; ')
        }));
      } else {
        const dailyData = {};
        orders.forEach(order => {
          const date = new Date(order.createdAt).toDateString();
          if (!dailyData[date]) {
            dailyData[date] = { totalRevenue: 0, orderCount: 0 };
          }
          dailyData[date].totalRevenue += order.totalAmount;
          dailyData[date].orderCount++;
        });
        
        data = Object.entries(dailyData).map(([date, stats]) => ({
          date,
          totalRevenue: stats.totalRevenue,
          orderCount: stats.orderCount
        }));
      }
      
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${startDate}-to-${endDate}.csv"`);
      res.send(csv);
    } else {
      // JSON format
      const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const data = {
        restaurant: restaurant.name,
        period: { startDate, endDate },
        totalRevenue: total,
        orderCount: orders.length,
        orders: isDetailed ? orders : orders.map(o => ({
          date: new Date(o.createdAt).toDateString(),
          amount: o.totalAmount
        }))
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${startDate}-to-${endDate}.json"`);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate menu export
router.get('/:restaurantId/menu/:format', protect, async (req, res) => {
  try {
    const { restaurantId, format } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    
    const menuData = restaurant.menu.filter(item => !item.isDeleted);
    
    if (format === 'csv') {
      const fields = ['category', 'name', 'price', 'description'];
      const parser = new Parser({ fields });
      const csv = parser.parse(menuData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="menu-${restaurant.name.replace(/\s+/g, '-')}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="menu-${restaurant.name.replace(/\s+/g, '-')}.json"`);
      res.json({ restaurant: restaurant.name, menu: menuData });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;