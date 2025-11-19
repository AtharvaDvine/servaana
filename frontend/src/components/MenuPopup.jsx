import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Edit, Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react';
import useStore from '../stores/useStore';
import { orderAPI } from '../utils/api';
import { playNotificationSound, showBrowserNotification } from '../utils/notifications';

const MenuPopup = () => {
  const { 
    restaurant, 
    selectedTable, 
    closeMenuPopup, 
    addOrder, 
    setRestaurant,
    setActiveOrders,
    activeOrders,
    completeOrder 
  } = useStore();
  
  const [orderItems, setOrderItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingOrder, setExistingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  const categories = [...new Set(restaurant.menuItems.map(item => item.categoryName))];
  
  // Filter items based on search term
  const filteredItems = restaurant.menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  useEffect(() => {
    // Check if there's an existing order for this table
    let tableOrder;
    if (selectedTable?.isTakeaway) {
      // For takeaway, we need to fetch and find the most recent preparing/ready order
      // This will be handled separately since takeaway orders aren't in activeOrders
      setExistingOrder(null);
      setOrderItems({});
    } else {
      tableOrder = activeOrders.find(order => order.tableLabel === selectedTable?.label);
      if (tableOrder) {
        setExistingOrder(tableOrder);
        // Pre-populate order items from existing order
        const existingItems = {};
        tableOrder.items.forEach(item => {
          existingItems[item.name] = item.quantity;
        });
        setOrderItems(existingItems);
      } else {
        setExistingOrder(null);
        setOrderItems({});
      }
    }
  }, [activeOrders, selectedTable]);

  const updateQuantity = (itemName, change) => {
    setOrderItems(prev => ({
      ...prev,
      [itemName]: Math.max(0, (prev[itemName] || 0) + change)
    }));
  };

  const calculateTotal = () => {
    return Object.entries(orderItems).reduce((total, [itemName, quantity]) => {
      const item = restaurant.menuItems.find(i => i.name === itemName);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const handleConfirmOrder = async () => {
    console.log('Confirm order clicked');
    console.log('Order items:', orderItems);
    
    const items = Object.entries(orderItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemName, quantity]) => {
        const menuItem = restaurant.menuItems.find(i => i.name === itemName);
        if (!menuItem) {
          console.error('Menu item not found:', itemName);
          return null;
        }
        return {
          name: itemName,
          price: menuItem.price,
          quantity,
          total: menuItem.price * quantity
        };
      })
      .filter(item => item !== null);

    console.log('Processed items:', items);

    if (items.length === 0) {
      alert('Please add items to your order');
      return;
    }

    setLoading(true);
    try {
      const restaurantId = restaurant?.id || restaurant?._id;
      console.log('Restaurant ID:', restaurantId);
      
      const orderData = {
        items,
        totalAmount: calculateTotal()
      };
      
      // Add takeaway-specific data
      if (selectedTable.isTakeaway) {
        orderData.orderType = 'takeaway';
        if (selectedTable.customerInfo?.name) {
          orderData.customerName = selectedTable.customerInfo.name;
        }
        if (selectedTable.customerInfo?.phone) {
          orderData.customerPhone = selectedTable.customerInfo.phone;
        }
      }
      
      console.log('Order data:', orderData);
      
      let response;
      if (existingOrder) {
        // Update existing order
        response = await orderAPI.update(existingOrder._id, orderData);
        console.log('Updating order with ID:', existingOrder._id);
        console.log('Update data:', orderData);
        console.log('Order updated:', response.data);
      } else {
        // Create new order
        const newOrderData = {
          tableLabel: selectedTable.isTakeaway ? 'TAKEAWAY' : selectedTable.label,
          ...orderData
        };
        response = await orderAPI.create(restaurantId, newOrderData);
        console.log('Order created:', response.data);
        
        // Update table status to occupied for new dine-in orders only
        if (!selectedTable.isTakeaway) {
          const updatedRestaurant = {
            ...restaurant,
            tables: restaurant.tables.map(table =>
              table.label === selectedTable.label
                ? { ...table, status: 'occupied' }
                : table
            )
          };
          setRestaurant(updatedRestaurant);
        }
      }
      
      // Refresh active orders to ensure they're up to date
      const ordersResponse = await orderAPI.getActive(restaurantId);
      setActiveOrders(ordersResponse.data);
      
      // Trigger takeaway orders refresh if this was a takeaway order
      if (selectedTable.isTakeaway) {
        // Dispatch custom event to refresh takeaway widget
        window.dispatchEvent(new CustomEvent('refreshTakeawayOrders'));
      }

      // Play notification sound
      const notificationSettings = restaurant?.notificationSettings || {};
      const {
        soundEnabled = true,
        soundVolume = 70,
        generalSound = 'default',
        browserNotifications = true
      } = notificationSettings;
      
      playNotificationSound(generalSound, soundVolume, soundEnabled);
      
      // Show browser notification
      showBrowserNotification(
        existingOrder ? 'Order Updated' : 'New Order Created',
        `${selectedTable.isTakeaway ? 'Takeaway' : `Table ${selectedTable.label}`}: ${items.length} items, Total: ₹${calculateTotal().toFixed(2)}`,
        browserNotifications
      );

      alert(existingOrder ? 'Order updated successfully!' : 'Order confirmed successfully!');
      closeMenuPopup();
    } catch (error) {
      console.error('Order error:', error);
      console.error('Error details:', error.response);
      
      // Play warning sound for error
      const notificationSettings = restaurant?.notificationSettings || {};
      const {
        soundEnabled = true,
        soundVolume = 70,
        warningSound = 'warning'
      } = notificationSettings;
      
      playNotificationSound(warningSound, soundVolume, soundEnabled);
      
      alert(`Error ${existingOrder ? 'updating' : 'creating'} order: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!existingOrder) return;
    
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    setLoading(true);
    try {
      await orderAPI.delete(existingOrder._id);
      completeOrder(existingOrder._id);
      
      // Update table status to free
      const updatedRestaurant = {
        ...restaurant,
        tables: restaurant.tables.map(table =>
          table.label === selectedTable.label
            ? { ...table, status: 'free' }
            : table
        )
      };
      setRestaurant(updatedRestaurant);
      
      // Refresh active orders
      const restaurantId = restaurant?.id || restaurant?._id;
      const ordersResponse = await orderAPI.getActive(restaurantId);
      setActiveOrders(ordersResponse.data);
      
      // Play warning sound for deletion
      const notificationSettings = restaurant?.notificationSettings || {};
      const {
        soundEnabled = true,
        soundVolume = 70,
        warningSound = 'warning',
        browserNotifications = true
      } = notificationSettings;
      
      playNotificationSound(warningSound, soundVolume, soundEnabled);
      
      showBrowserNotification(
        'Order Deleted',
        `Table ${selectedTable.label} order has been cancelled`,
        browserNotifications
      );
      
      alert('Order deleted successfully!');
      closeMenuPopup();
    } catch (error) {
      console.error('Delete order error:', error);
      alert(`Error deleting order: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-soft-blue text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {existingOrder ? 'Update Order for' : 'Order for'} {selectedTable?.isTakeaway ? 'Takeaway' : selectedTable?.label}
            </h2>
            <p className="opacity-90">
              {selectedTable?.isTakeaway ? (
                selectedTable.customerInfo?.name ? 
                  `Customer: ${selectedTable.customerInfo.name}` : 
                  'Guest Customer'
              ) : (
                `${selectedTable?.seats} seats`
              )}
              {existingOrder && <span className="ml-2 text-sm">(Existing Order)</span>}
            </p>
          </div>
          <button
            onClick={closeMenuPopup}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          
          {/* Categories Sidebar */}
          <div className="w-1/3 bg-pastel-blue p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-4">Menu Items</h3>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Search Results */}
            {searchTerm && (
              <div className="bg-white rounded-xl p-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">Search Results</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredItems.map(item => (
                    <div key={item.name} className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">₹{item.price}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.name, -1)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-medium text-sm">
                          {orderItems[item.name] || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.name, 1)}
                          className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="text-center text-gray-500 py-2">No items found</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Categories with Dropdowns */}
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category} className="bg-white rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-800">{category}</h4>
                    {expandedCategories[category] ? 
                      <ChevronDown size={20} className="text-gray-600" /> : 
                      <ChevronRight size={20} className="text-gray-600" />
                    }
                  </button>
                  
                  {expandedCategories[category] && (
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
                      {restaurant.menuItems
                        .filter(item => item.categoryName === category)
                        .map(item => (
                          <div key={item.name} className="flex justify-between items-center py-2">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-gray-600">₹{item.price}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.name, -1)}
                                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center font-medium text-sm">
                                {orderItems[item.name] || 0}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.name, 1)}
                                className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-2/3 p-6 flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {Object.entries(orderItems)
                .filter(([_, quantity]) => quantity > 0)
                .map(([itemName, quantity]) => {
                  const item = restaurant.menuItems.find(i => i.name === itemName);
                  return (
                    <div key={itemName} className="bg-pastel-green p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-medium">{itemName}</div>
                        <div className="text-sm text-gray-600">
                          ₹{item.price} × {quantity}
                        </div>
                      </div>
                      <div className="font-bold text-lg">
                        ₹{(item.price * quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Total and Confirm */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold text-soft-blue">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading || calculateTotal() === 0}
                  className="w-full btn-success flex items-center justify-center gap-2 py-4 text-lg animate-bounce-soft"
                >
                  {existingOrder ? <Edit size={24} /> : <ShoppingCart size={24} />}
                  {loading ? 'Processing...' : (existingOrder ? 'Update Order' : 'Confirm Order')}
                </button>
                
                {existingOrder && (
                  <button
                    onClick={handleDeleteOrder}
                    disabled={loading}
                    className="w-full btn-danger flex items-center justify-center gap-2 py-3 text-lg"
                  >
                    <Trash2 size={20} />
                    {loading ? 'Deleting...' : 'Delete Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPopup;