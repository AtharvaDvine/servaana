import React, { useState } from 'react';
import { Plus, Package, DollarSign } from 'lucide-react';
import { restaurantAPI } from '../utils/api';
import useStore from '../stores/useStore';

const InventoryPage = () => {
  const { restaurant, setRestaurant } = useStore();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: 'Food & Beverages'
  });

  const categories = ['Food & Beverages', 'Utilities', 'Staff', 'Equipment', 'Other'];

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const restaurantId = restaurant._id || restaurant.id;
      console.log('Adding expense for restaurant:', restaurantId);
      console.log('Expense data:', expenseData);
      
      const response = await restaurantAPI.addExpense(restaurantId, {
        ...expenseData,
        amount: parseFloat(expenseData.amount)
      });
      
      console.log('Expense added successfully:', response.data);
      setRestaurant(response.data);
      setExpenseData({ description: '', amount: '', category: 'Food & Beverages' });
      setShowExpenseForm(false);
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense: ' + (error.response?.data?.message || error.message));
    }
  };

  const todayExpenses = restaurant?.expenses?.filter(expense => {
    const today = new Date().toDateString();
    const expenseDate = new Date(expense.date).toDateString();
    return today === expenseDate;
  }) || [];

  const totalTodayExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Inventory & Expenses</h1>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Today's Expenses */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="text-soft-red" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Today's Expenses</h2>
            </div>
            
            <div className="bg-pastel-red p-4 rounded-xl mb-4">
              <div className="text-2xl font-bold text-gray-800">
                ${totalTodayExpenses.toFixed(2)}
              </div>
              <div className="text-gray-600">Total spent today</div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {todayExpenses.map((expense, index) => (
                <div key={index} className="bg-white p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-gray-600">{expense.category}</div>
                  </div>
                  <div className="font-semibold text-soft-red">
                    ${expense.amount.toFixed(2)}
                  </div>
                </div>
              ))}
              
              {todayExpenses.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No expenses recorded today
                </div>
              )}
            </div>
          </div>

          {/* Inventory Items */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-soft-blue" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Inventory</h2>
            </div>
            
            <div className="text-center text-gray-500 py-8">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Inventory management coming soon!</p>
              <p className="text-sm">Track your stock levels and auto-deduct based on orders</p>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Expenses</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-right py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {restaurant?.expenses?.slice(-10).reverse().map((expense, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium">{expense.description}</td>
                    <td className="py-3 px-4">
                      <span className="bg-pastel-blue px-2 py-1 rounded-full text-sm">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-soft-red">
                      ${expense.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!restaurant?.expenses || restaurant.expenses.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                No expenses recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Expense</h3>
              
              <form onSubmit={handleAddExpense} className="space-y-4">
                <input
                  type="text"
                  placeholder="Description"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                  className="input-field"
                  required
                />
                
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  className="input-field"
                  required
                />
                
                <select
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExpenseForm(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-success"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;