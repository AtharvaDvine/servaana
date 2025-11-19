import React from 'react';
import { Users, ShoppingCart, Receipt, Edit } from 'lucide-react';
import useStore from '../stores/useStore';

const TableCard = ({ table }) => {
  const { openMenuPopup, openBillPopup, activeOrders } = useStore();
  
  const hasActiveOrder = activeOrders.some(order => order.tableLabel === table.label);

  const getStatusColor = (status) => {
    return status === 'free' 
      ? 'bg-green-100 border-2 border-green-400' 
      : 'bg-red-100 border-2 border-red-400';
  };

  const getStatusText = (status) => {
    return status === 'free' ? 'Available' : 'Occupied';
  };

  return (
    <div className={`card p-4 transition-all duration-300 hover:scale-105 ${getStatusColor(table.status)}`}>
      <div className="text-center mb-3">
        <h3 className="text-xl font-bold text-gray-800">{table.label}</h3>
        <div className="flex items-center justify-center gap-1 text-gray-600 text-sm mt-1">
          <Users size={14} />
          <span>{table.seats}</span>
        </div>
        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
          table.status === 'free' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {getStatusText(table.status)}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => openMenuPopup(table)}
          className="w-full btn-primary flex items-center justify-center gap-1 py-2 text-sm"
        >
          {hasActiveOrder ? <Edit size={16} /> : <ShoppingCart size={16} />}
          {hasActiveOrder ? 'Update' : 'Order'}
        </button>

        <button
          onClick={() => openBillPopup(table)}
          disabled={table.status === 'free'}
          className="w-full btn-success flex items-center justify-center gap-1 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Receipt size={16} />
          Bill
        </button>
      </div>
    </div>
  );
};

export default TableCard;