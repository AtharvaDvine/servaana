import React, { useEffect } from 'react';
import useStore from '../stores/useStore';
import useToastStore from '../stores/useToastStore';
import { orderAPI } from '../utils/api';
import TableCard from '../components/TableCard';
import MenuPopup from '../components/MenuPopup';
import BillPopup from '../components/BillPopup';
import TakeawayWidget from '../components/TakeawayWidget';

const DashboardPage = () => {
  const { 
    restaurant, 
    showMenuPopup, 
    showBillPopup, 
    setActiveOrders 
  } = useStore();
  const { error } = useToastStore();

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const restaurantId = restaurant?.id || restaurant?._id;
        if (!restaurantId) {
          error('Restaurant ID not found. Please try logging in again.');
          return;
        }
        const response = await orderAPI.getActive(restaurantId);
        setActiveOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load orders';
        
        if (err.response?.status === 401) {
          error('Session expired. Please log in again.');
        } else if (err.response?.status === 404) {
          error('Restaurant not found. Please check your account.');
        } else {
          error(`Failed to load active orders: ${errorMessage}`);
        }
      }
    };

    if (restaurant?.id || restaurant?._id) {
      fetchActiveOrders();
    }
  }, [restaurant, setActiveOrders, error]);

  // Debug logging
  console.log('Restaurant data:', restaurant);
  console.log('Tables:', restaurant?.tables);
  
  // Group tables by area
  const tablesByArea = restaurant?.tables?.reduce((acc, table) => {
    if (!acc[table.areaName]) {
      acc[table.areaName] = [];
    }
    acc[table.areaName].push(table);
    return acc;
  }, {}) || {};

  const areas = Object.keys(tablesByArea);
  console.log('Areas:', areas);
  console.log('Tables by area:', tablesByArea);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Takeaway Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome, {restaurant?.name}
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your restaurant operations with ease
            </p>
          </div>
          <div>
            <TakeawayWidget />
          </div>
        </div>

        {/* Tables by Area */}
        <div className="space-y-8">
          {areas.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-600">No tables found. Please check your setup or refresh the page.</p>
              <p className="text-sm text-gray-500 mt-2">Debug: {JSON.stringify(restaurant?.tables)}</p>
            </div>
          ) : (
            areas.map(areaName => (
              <div key={areaName} className="card p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-4 h-4 bg-pastel-yellow rounded-full"></div>
                  {areaName}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {tablesByArea[areaName].map(table => (
                    <TableCard key={table.label} table={table} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-soft-green mb-2">
              {restaurant?.tables?.filter(t => t.status === 'free').length || 0}
            </div>
            <div className="text-gray-600">Available Tables</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-soft-red mb-2">
              {restaurant?.tables?.filter(t => t.status === 'occupied').length || 0}
            </div>
            <div className="text-gray-600">Occupied Tables</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-soft-blue mb-2">
              {restaurant?.tables?.length || 0}
            </div>
            <div className="text-gray-600">Total Tables</div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showMenuPopup && <MenuPopup />}
      {showBillPopup && <BillPopup />}
    </div>
  );
};

export default DashboardPage;