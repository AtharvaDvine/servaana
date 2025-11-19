import React, { useState } from 'react';
import { X, ShoppingBag, User, Phone } from 'lucide-react';
import { orderAPI } from '../utils/api';
import useStore from '../stores/useStore';

const NewTakeawayModal = ({ isOpen, onClose, onOrderCreated }) => {
  const { restaurant, openMenuPopup } = useStore();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreateOrder = () => {
    // Set a temporary takeaway "table" to trigger menu popup
    const takeawayTable = { 
      label: 'TAKEAWAY', 
      isTakeaway: true,
      customerInfo: customerInfo
    };
    openMenuPopup(takeawayTable);
    onClose();
    // Reset form
    setCustomerInfo({ name: '', phone: '' });
  };

  const handleClose = () => {
    setCustomerInfo({ name: '', phone: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        
        {/* Header */}
        <div className="bg-orange-500 text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} />
            <div>
              <h2 className="text-xl font-bold">New Takeaway Order</h2>
              <p className="opacity-90 text-sm">Customer information (optional)</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Customer Name
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter customer name (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700">
              <strong>Note:</strong> Customer information is optional. You can proceed without entering any details.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              {loading ? 'Creating...' : 'Select Items'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTakeawayModal;