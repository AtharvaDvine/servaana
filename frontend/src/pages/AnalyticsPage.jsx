import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Calendar, Users, Clock, Target, RefreshCw, History } from 'lucide-react';
import useStore from '../stores/useStore';
import { analyticsAPI, summaryAPI } from '../utils/api';

const AnalyticsPage = () => {
  const { restaurant } = useStore();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [historyPeriod, setHistoryPeriod] = useState('daily');
  const [showHistory, setShowHistory] = useState(false);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const restaurantId = restaurant?.id || restaurant?._id;
      if (restaurantId) {
        console.log('Fetching analytics for:', { restaurantId, timeRange });
        const response = await analyticsAPI.getAnalytics(restaurantId, timeRange);
        console.log('Analytics response:', response.data);
        console.log('Todays orders:', response.data.todaysOrders);
        setAnalyticsData(response.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurant) {
      fetchAnalyticsData();
    }
  }, [restaurant, timeRange]);

  // Auto-refresh for today's data every 30 seconds
  useEffect(() => {
    if (timeRange === 'today') {
      const interval = setInterval(fetchAnalyticsData, 30000);
      return () => clearInterval(interval);
    }
  }, [timeRange, restaurant]);

  const metrics = analyticsData?.metrics || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    activeTables: 0,
    profitMargin: 0,
    tableUtilization: 0
  };

  const revenueData = analyticsData?.revenueData?.map(day => ({
    date: day.dayName,
    revenue: day.revenue,
    orders: day.orders
  })) || [];

  const popularItems = analyticsData?.popularItems || [];

  const COLORS = ['#B3E6B3', '#B3D9FF', '#FFB3B3', '#FFECB3', '#F3E6FF'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            {lastUpdated && (
              <p className="text-gray-600 text-sm mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {timeRange === 'today' && <span className="ml-2 text-green-600">(Auto-refreshing)</span>}
              </p>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={fetchAnalyticsData}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field w-auto"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <div className="card p-4 text-center">
            <DollarSign className="mx-auto text-green-500 mb-2" size={28} />
            <div className="text-xl font-bold text-gray-800 mb-1">
              ₹{metrics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm">Total Revenue</div>
          </div>
          
          <div className="card p-4 text-center">
            <TrendingUp className="mx-auto text-red-500 mb-2" size={28} />
            <div className="text-xl font-bold text-gray-800 mb-1">
              ₹{metrics.totalExpenses.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm">Total Expenses</div>
          </div>
          
          <div className="card p-4 text-center">
            <Target className="mx-auto text-blue-500 mb-2" size={28} />
            <div className="text-xl font-bold text-gray-800 mb-1">
              ₹{metrics.netProfit.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm">Net Profit</div>
          </div>
          
          <div className="card p-4 text-center">
            <ShoppingCart className="mx-auto text-purple-500 mb-2" size={28} />
            <div className="text-xl font-bold text-gray-800 mb-1">
              {metrics.totalOrders}
            </div>
            <div className="text-gray-600 text-sm">Total Orders</div>
          </div>
          
          <div className="card p-4 text-center">
            <DollarSign className="mx-auto text-orange-500 mb-2" size={28} />
            <div className="text-xl font-bold text-gray-800 mb-1">
              ₹{Math.round(metrics.avgOrderValue)}
            </div>
            <div className="text-gray-600 text-sm">Avg Order Value</div>
          </div>
          
          <div className="card p-4 text-center">
            <Users className="mx-auto text-teal-500 mb-2" size={28} />
            <div className="text-xl font-bold text-gray-800 mb-1">
              {metrics.activeTables}
            </div>
            <div className="text-gray-600 text-sm">Active Tables</div>
          </div>
          
          <div className="card p-4 text-center">
            <Target className={`mx-auto mb-2 ${metrics.profitMargin >= 20 ? 'text-green-500' : metrics.profitMargin >= 10 ? 'text-yellow-500' : 'text-red-500'}`} size={28} />
            <div className={`text-xl font-bold mb-1 ${metrics.profitMargin >= 20 ? 'text-green-600' : metrics.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.profitMargin.toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm">Profit Margin</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          
          {/* Revenue Trend */}
          <div className="xl:col-span-2 card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Revenue & Orders Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis yAxisId="revenue" orientation="left" stroke="#666" />
                <YAxis yAxisId="orders" orientation="right" stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }} 
                />
                <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Popular Items */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Top Menu Items</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularItems}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {popularItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Orders Card - Show for 'today' and 'yesterday' */}
        {(timeRange === 'today' || timeRange === 'yesterday') && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="text-green-500" size={24} />
              {timeRange === 'today' ? "Today's" : "Yesterday's"} Completed Orders ({analyticsData?.todaysOrders?.length || 0})
            </h2>
            
            <div className="max-h-96 overflow-y-auto space-y-3">
              {analyticsData?.todaysOrders?.length > 0 ? (
                analyticsData.todaysOrders.map(order => (
                  <div key={order._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {order.orderType === 'takeaway' ? (
                            <>
                              <span className="font-semibold text-lg">{order.orderNumber}</span>
                              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Takeaway</span>
                            </>
                          ) : (
                            <span className="font-semibold text-lg">Table {order.tableLabel}</span>
                          )}
                        </div>
                        {order.customerName && (
                          <div className="text-sm text-gray-600">{order.customerName}</div>
                        )}
                        <span className="text-green-600 font-bold text-lg">₹{order.totalAmount}</span>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>Created: {new Date(order.createdAt).toLocaleTimeString()}</div>
                        <div className="text-xs font-medium text-green-600">Completed: {new Date(order.completedAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Items: </span>
                      {order.items.map((item, index) => (
                        <span key={index}>
                          {item.name} x{item.quantity}
                          {index < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                    
                    {order.paymentMethod && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-600">Payment: </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentMethod === 'cash' ? 'bg-green-100 text-green-600' :
                          order.paymentMethod === 'card' ? 'bg-blue-100 text-blue-600' :
                          order.paymentMethod === 'online' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No completed orders {timeRange === 'today' ? 'today' : 'yesterday'} yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Daily Revenue Bar Chart */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Daily Revenue Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }} 
                  formatter={(value, name) => [name === 'revenue' ? `₹${value}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Insights */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Insights</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Best Day</span>
                <span className="text-green-600 font-bold">
                  {revenueData.reduce((max, day) => day.revenue > max.revenue ? day : max, revenueData[0])?.date || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Peak Revenue</span>
                <span className="text-blue-600 font-bold">
                  ₹{Math.max(...revenueData.map(d => d.revenue)).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className="text-purple-600 font-bold">
                  {revenueData.length > 1 ? 
                    ((revenueData[revenueData.length - 1].revenue - revenueData[0].revenue) / revenueData[0].revenue * 100).toFixed(1) + '%'
                    : '0%'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Table Utilization</span>
                <span className="text-orange-600 font-bold">
                  {restaurant?.tables ? 
                    Math.round((restaurant.tables.filter(t => t.status === 'occupied').length / restaurant.tables.length) * 100) + '%'
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Usage Heatmap */}
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Table Usage Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {restaurant?.tables?.map(table => (
              <div
                key={table.label}
                className={`p-4 rounded-xl text-center ${
                  table.status === 'occupied' 
                    ? 'bg-pastel-red border-2 border-soft-red' 
                    : 'bg-pastel-green border-2 border-soft-green'
                }`}
              >
                <div className="font-semibold text-lg">{table.label}</div>
                <div className="text-sm text-gray-600">{table.areaName}</div>
                <div className={`text-xs font-medium mt-1 ${
                  table.status === 'occupied' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {table.status === 'occupied' ? 'Busy' : 'Available'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        {(timeRange === 'today' || timeRange === 'yesterday') && analyticsData?.todaysOrders?.length > 0 && (
          <div className="card p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Method Breakdown</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['cash', 'card', 'online'].map(method => {
                const methodOrders = analyticsData.todaysOrders.filter(order => order.paymentMethod === method);
                const methodRevenue = methodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                const percentage = analyticsData.todaysOrders.length > 0 
                  ? ((methodOrders.length / analyticsData.todaysOrders.length) * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={method} className={`p-4 rounded-xl text-center ${
                    method === 'cash' ? 'bg-green-50 border border-green-200' :
                    method === 'card' ? 'bg-blue-50 border border-blue-200' :
                    'bg-purple-50 border border-purple-200'
                  }`}>
                    <div className={`text-2xl font-bold mb-1 ${
                      method === 'cash' ? 'text-green-600' :
                      method === 'card' ? 'text-blue-600' :
                      'text-purple-600'
                    }`}>
                      {methodOrders.length}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {method.charAt(0).toUpperCase() + method.slice(1)} Orders
                    </div>
                    <div className={`text-lg font-semibold ${
                      method === 'cash' ? 'text-green-600' :
                      method === 'card' ? 'text-blue-600' :
                      'text-purple-600'
                    }`}>
                      ₹{methodRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage}% of orders
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Orders without payment method */}
            {(() => {
              const ordersWithoutPayment = analyticsData.todaysOrders.filter(order => !order.paymentMethod);
              if (ordersWithoutPayment.length > 0) {
                return (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{ordersWithoutPayment.length} orders</span> completed without payment method information
                      <span className="text-xs ml-2">(₹{ordersWithoutPayment.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()})</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()
            }
          </div>
        )}

        {/* Expense Breakdown */}
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Expense Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {['Food & Beverages', 'Utilities', 'Staff', 'Equipment', 'Other'].map(category => {
              const categoryExpenses = restaurant?.expenses?.filter(e => e.category === category) || [];
              const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
              
              return (
                <div key={category} className="bg-pastel-blue p-4 rounded-xl text-center">
                  <div className="text-lg font-bold text-gray-800">
                    ₹{total.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">{category}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {categoryExpenses.length} transactions
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Historical Summary */}
        <div className="card p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <History className="text-purple-500" size={24} />
              Historical Summary
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const restaurantId = restaurant?._id || restaurant?.id;
                  const today = new Date().toISOString().split('T')[0];
                  summaryAPI.generateSummary(restaurantId, today)
                    .then(() => {
                      if (showHistory) {
                        summaryAPI.getHistory(restaurantId, historyPeriod, 30)
                          .then(response => setHistoricalData(response.data));
                      }
                      alert('Today\'s summary generated!');
                    })
                    .catch(error => alert('Error: ' + error.message));
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Generate Today's Summary
              </button>
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) {
                    const restaurantId = restaurant?._id || restaurant?.id;
                    summaryAPI.getHistory(restaurantId, historyPeriod, 30)
                      .then(response => setHistoricalData(response.data));
                  }
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>
          </div>
          
          {showHistory && (
            <>
              <div className="flex gap-3 mb-4">
                {['daily', 'weekly', 'monthly'].map(period => (
                  <button
                    key={period}
                    onClick={() => {
                      setHistoryPeriod(period);
                      const restaurantId = restaurant?._id || restaurant?.id;
                      summaryAPI.getHistory(restaurantId, period, 30)
                        .then(response => setHistoricalData(response.data));
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      historyPeriod === period 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Expenses</th>
                      <th className="text-right py-3 px-4">Profit</th>
                      <th className="text-right py-3 px-4">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          {historyPeriod === 'daily' 
                            ? new Date(item.date || item.weekStart || item.monthStart).toLocaleDateString()
                            : historyPeriod === 'weekly'
                            ? `Week of ${new Date(item.weekStart).toLocaleDateString()}`
                            : `${new Date(item.monthStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                          }
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          ₹{item.revenue?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-600">
                          ₹{item.expenses?.toLocaleString() || 0}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          (item.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ₹{item.profit?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.orderCount || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {historicalData.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No historical data available. Generate daily summaries to see history.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;