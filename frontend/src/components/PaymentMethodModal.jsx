import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';

const PaymentMethodModal = ({ isOpen, onClose, onConfirm, orderDetails }) => {
  const [selectedMethod, setSelectedMethod] = useState('cash');

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'bg-green-500' },
    { id: 'card', label: 'Card', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'online', label: 'Online', icon: Smartphone, color: 'bg-purple-500' }
  ];

  const handleConfirm = () => {
    onConfirm(selectedMethod);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        
        {/* Header */}
        <div className="bg-soft-blue text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Payment Method</h2>
            <p className="opacity-90 text-sm">
              {orderDetails?.tableLabel || 'Order'} - ₹{orderDetails?.totalAmount?.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">How did the customer pay?</p>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-full text-white ${method.color}`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">{method.label}</div>
                    <div className="text-sm text-gray-600">
                      {method.id === 'cash' && 'Physical cash payment'}
                      {method.id === 'card' && 'Credit/Debit card payment'}
                      {method.id === 'online' && 'UPI/Digital wallet payment'}
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="ml-auto w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full btn-success mt-6 py-4 text-lg"
          >
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;