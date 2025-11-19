import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Clock, CheckCircle, Package, Trash2 } from 'lucide-react';
import { orderAPI } from '../utils/api';
import useStore from '../stores/useStore';
import NewTakeawayModal from './NewTakeawayModal';

const TakeawayWidget = () => {
  const { restaurant, openMenuPopup } = useStore();
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTakeawayOrders = async () => {
    try {
      const restaurantId = restaurant?.id || restaurant?._id;
      if (restaurantId) {
        const response = await orderAPI.getTakeaway(restaurantId);
        setTakeawayOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching takeaway orders:', error);
    }
  };

  useEffect(() => {
    if (restaurant) {
      fetchTakeawayOrders();
      // Refresh every 30 seconds
      const interval = setInterval(fetchTakeawayOrders, 30000);
      
      // Listen for manual refresh events
      const handleRefresh = () => fetchTakeawayOrders();
      window.addEventListener('refreshTakeawayOrders', handleRefresh);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('refreshTakeawayOrders', handleRefresh);
      };
    }
  }, [restaurant]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      fetchTakeawayOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditOrder = (order) => {
    // Only allow editing if order is not completed
    if (order.status === 'completed') return;
    
    // Create a takeaway table object for editing
    const takeawayTable = {
      label: 'TAKEAWAY',
      isTakeaway: true,
      customerInfo: {
        name: order.customerName || '',
        phone: order.customerPhone || ''
      }
    };
    
    openMenuPopup(takeawayTable);
  };
  
  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}?`)) return;
    
    setLoading(true);
    try {
      await orderAPI.delete(orderId);
      fetchTakeawayOrders(); // Refresh orders
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-600 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };
  
  const getCardColor = (status) => {
    switch (status) {
      case 'preparing': return 'bg-orange-50 border-orange-200';
      case 'ready': return 'bg-green-50 border-green-200';
      case 'completed': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing': return <Clock size={14} />;
      case 'ready': return <Package size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const activeOrders = takeawayOrders.filter(order => order.status !== 'completed');

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-orange-500" size={20} />
          <h3 className="font-semibold text-gray-800">
            TAKEAWAY ({activeOrders.length})
          </h3>
        </div>
        <button
          onClick={() => setShowNewOrderModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {takeawayOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-8 w-full">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No takeaway orders today</p>
          </div>
        ) : (
          takeawayOrders.map(order => (
            <div
              key={order._id}
              className={`flex-shrink-0 w-48 rounded-lg p-3 border cursor-pointer hover:shadow-md transition-all ${getCardColor(order.status)}`}
              onClick={() => handleEditOrder(order)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-sm">{order.orderNumber}</div>
                  <div className="text-xs text-gray-600">
                    {order.customerName || 'Guest'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-green-600">
                    ₹{order.totalAmount}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
                
                {order.status !== 'completed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOrder(order._id, order.orderNumber);
                    }}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div className="flex gap-1">
                {order.status === 'preparing' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order._id, 'ready');
                      }}
                      disabled={loading}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors"
                    >
                      Ready
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order._id, 'completed');
                      }}
                      disabled={loading}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded transition-colors"
                    >
                      Done
                    </button>
                  </>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(order._id, 'completed');
                    }}
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors"
                  >
                    Complete
                  </button>
                )}
                {order.status === 'completed' && (
                  <div className="w-full text-center text-xs text-gray-500 py-1">
                    Completed
                  </div>
                )}
              </div>
              
              {order.status !== 'completed' && (
                <div className="text-center mt-2">
                  <div className="text-xs text-gray-500">Click card to edit</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <NewTakeawayModal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onOrderCreated={fetchTakeawayOrders}
      />
    </div>
  );
};

export default TakeawayWidget;