import React, { useState, useEffect } from 'react';
import { X, Printer, Receipt } from 'lucide-react';
import useStore from '../stores/useStore';
import useToastStore from '../stores/useToastStore';
import { orderAPI } from '../utils/api';
import { playNotificationSound, showBrowserNotification } from '../utils/notifications';

const BillPopup = () => {
  const { 
    restaurant, 
    selectedTable, 
    closeBillPopup, 
    completeOrder, 
    setRestaurant 
  } = useStore();
  const { success, error } = useToastStore();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const restaurantId = restaurant?.id || restaurant?._id;
        console.log('Fetching orders for restaurant:', restaurantId);
        console.log('Looking for table:', selectedTable?.label);
        
        const response = await orderAPI.getActive(restaurantId);
        console.log('All active orders:', response.data);
        
        const tableOrder = response.data.find(o => o.tableLabel === selectedTable?.label);
        console.log('Found table order:', tableOrder);
        
        setOrder(tableOrder);
      } catch (err) {
        console.error('Error fetching order:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load order';
        
        if (err.response?.status === 401) {
          error('Session expired. Please log in again.');
        } else if (err.response?.status === 404) {
          error('Order not found. The table may not have an active order.');
        } else {
          error(`Failed to load order details: ${errorMessage}`);
        }
      }
    };

    if (selectedTable && restaurant) {
      fetchOrder();
    }
  }, [selectedTable, restaurant]);

  const handlePrintBill = async () => {
    if (!order) return;

    setLoading(true);
    try {
      await orderAPI.complete(order._id);
      completeOrder(order._id);

      // Update table status in restaurant state
      const updatedRestaurant = {
        ...restaurant,
        tables: restaurant.tables.map(table =>
          table.label === selectedTable.label
            ? { ...table, status: 'free' }
            : table
        )
      };
      setRestaurant(updatedRestaurant);

      // Play order completion notification
      const notificationSettings = restaurant?.notificationSettings || {};
      const {
        soundEnabled = true,
        soundVolume = 70,
        orderCompleteSound = 'success',
        browserNotifications = true
      } = notificationSettings;
      
      // Play sound notification
      playNotificationSound(orderCompleteSound, soundVolume, soundEnabled);
      
      // Show browser notification
      showBrowserNotification(
        'Order Completed',
        `Table ${selectedTable.label} order completed successfully. Total: ₹${order.totalAmount.toFixed(2)}`,
        browserNotifications
      );

      success(`Order completed successfully! Total: ₹${order.totalAmount.toFixed(2)}`);
      
      // Simulate printing
      window.print();
      
      closeBillPopup();
    } catch (err) {
      console.error('Error completing order:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      
      if (err.response?.status === 401) {
        error('Session expired. Please log in again.');
      } else if (err.response?.status === 404) {
        error('Order not found. It may have already been completed.');
      } else if (err.response?.status === 400) {
        error('Invalid order data. Please try again.');
      } else {
        error(`Failed to complete order: ${errorMessage}`);
      }
      
      // Play warning sound for error
      const notificationSettings = restaurant?.notificationSettings || {};
      const {
        soundEnabled = true,
        soundVolume = 70,
        warningSound = 'warning'
      } = notificationSettings;
      
      playNotificationSound(warningSound, soundVolume, soundEnabled);
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
          <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Order</h3>
          <p className="text-gray-600 mb-4">This table doesn't have any active orders.</p>
          <button onClick={closeBillPopup} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        
        {/* Header */}
        <div className="bg-soft-blue text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Bill for {selectedTable?.label}</h2>
            <p className="opacity-90 text-sm">Order #{order._id.slice(-6)}</p>
          </div>
          <button
            onClick={closeBillPopup}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bill Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">{restaurant.name}</h3>
            <p className="text-gray-600 text-sm">{restaurant.address}</p>
            <p className="text-gray-600 text-sm">{restaurant.phone}</p>
            <div className="border-b border-gray-200 my-4"></div>
          </div>

          <div className="space-y-3 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    ₹{item.price.toFixed(2)} × {item.quantity}
                  </div>
                </div>
                <div className="font-semibold">
                  ₹{item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-soft-blue">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Thank you for dining with us!</p>
            <p>{new Date(order.createdAt || order.orderDate).toLocaleString()}</p>
          </div>

          <button
            onClick={handlePrintBill}
            disabled={loading}
            className="w-full btn-success flex items-center justify-center gap-2 py-4 mt-6 text-lg animate-bounce-soft"
          >
            <Printer size={24} />
            {loading ? 'Processing...' : 'Print Bill & Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillPopup;