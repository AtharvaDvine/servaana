import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit2, Lock, ArrowUp, ArrowDown } from 'lucide-react';
import { restaurantAPI } from '../utils/api';
import useStore from '../stores/useStore';
import useToastStore from '../stores/useToastStore';

const SetupPage = () => {
  const { restaurant, setRestaurant, activeOrders } = useStore();
  const { success, error, warning } = useToastStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [areas, setAreas] = useState([]);
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  const isEditMode = restaurant?.setupComplete;

  useEffect(() => {
    if (isEditMode && restaurant) {
      // Load existing data for edit mode
      const existingAreas = [...new Set(restaurant.tables?.map(t => t.areaName) || [])];
      const existingCategories = [...new Set(restaurant.menuItems?.filter(item => !item.isDeleted).map(item => item.categoryName) || [])];
      
      setAreas(existingAreas.length > 0 ? existingAreas : ['Main Hall']);
      setTables(restaurant.tables || []);
      setCategories(existingCategories.length > 0 ? existingCategories : ['Main Course']);
      setMenuItems(restaurant.menuItems?.filter(item => !item.isDeleted) || []);
    } else {
      // Initialize with defaults for new setup
      if (areas.length === 0) {
        setAreas(['Main Hall']);
      }
      if (categories.length === 0) {
        setCategories(['Main Course']);
      }
    }
  }, [isEditMode, restaurant]);
  
  const hasActiveOrder = (tableLabel) => {
    return activeOrders?.some(order => order.tableLabel === tableLabel);
  };
  const [loading, setLoading] = useState(false);

  const addArea = () => {
    const newArea = prompt('Enter area name:');
    if (newArea && newArea.trim()) {
      if (!areas.includes(newArea)) {
        setAreas([...areas, newArea]);
        success(`Area "${newArea}" added successfully!`);
      } else {
        warning('Area name already exists!');
      }
    }
  };

  const addTable = (areaName) => {
    const label = prompt('Table label:') || `T${tables.length + 1}`;
    const seats = parseInt(prompt('Number of seats:') || '4');
    
    if (!label || !label.trim()) {
      warning('Please enter a valid table label!');
      return;
    }
    
    if (tables.some(t => t.label === label)) {
      error('Table label already exists! Please choose a different label.');
      return;
    }
    
    if (seats < 1 || seats > 20) {
      warning('Number of seats must be between 1 and 20!');
      return;
    }
    
    setTables([...tables, { label, seats, areaName, status: 'free' }]);
    success(`Table "${label}" with ${seats} seats added to ${areaName}!`);
  };

  const removeTable = (index) => {
    const table = tables[index];
    if (hasActiveOrder(table.label)) {
      error(`Cannot remove table "${table.label}" - it has an active order!`);
      return;
    }
    setTables(tables.filter((_, i) => i !== index));
    success(`Table "${table.label}" removed successfully!`);
  };

  const addCategory = () => {
    const newCategory = prompt('Enter category name:');
    if (newCategory && newCategory.trim()) {
      if (!categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
        success(`Category "${newCategory}" added successfully!`);
      } else {
        warning('Category name already exists!');
      }
    }
  };

  const addMenuItem = (categoryName) => {
    const name = prompt('Item name:');
    const priceStr = prompt('Price:');
    const price = parseFloat(priceStr || '0');
    const description = prompt('Description (optional):') || '';
    
    if (!name || !name.trim()) {
      warning('Please enter a valid item name!');
      return;
    }
    
    if (!priceStr || price <= 0) {
      warning('Please enter a valid price greater than 0!');
      return;
    }
    
    if (menuItems.some(item => item.name.toLowerCase() === name.toLowerCase() && item.categoryName === categoryName)) {
      error('An item with this name already exists in this category!');
      return;
    }
    
    setMenuItems([...menuItems, { name, price, description, categoryName }]);
    success(`Menu item "${name}" added to ${categoryName} for $${price.toFixed(2)}!`);
  };

  const removeMenuItem = (index) => {
    const item = menuItems[index];
    setMenuItems(menuItems.filter((_, i) => i !== index));
    success(`Menu item "${item.name}" removed successfully!`);
  };

  const handleSaveSetup = async () => {
    // Validation before saving
    if (tables.length === 0) {
      error('Please add at least one table before saving!');
      return;
    }
    
    if (menuItems.length === 0) {
      error('Please add at least one menu item before saving!');
      return;
    }
    
    setLoading(true);
    try {
      const restaurantId = restaurant?.id || restaurant?._id;
      if (!restaurantId) {
        throw new Error('Restaurant ID not found');
      }
      
      // For edit mode, include soft-deleted items
      const allMenuItems = isEditMode ? 
        [...menuItems, ...(restaurant.menuItems?.filter(item => item.isDeleted) || [])] :
        menuItems;
      
      const response = await restaurantAPI.completeSetup(restaurantId, {
        tables,
        menuItems: allMenuItems
      });
      
      setRestaurant(response.data);
      
      success(
        isEditMode 
          ? 'Changes saved successfully! Redirecting to dashboard...'
          : 'Setup completed successfully! Welcome to Servaana!'
      );
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        if (isEditMode) {
          window.location.replace('/dashboard');
        } else {
          window.location.reload();
        }
      }, 1500);
      
    } catch (err) {
      console.error('Setup error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      
      if (err.response?.status === 400) {
        error('Invalid data provided. Please check your tables and menu items.');
      } else if (err.response?.status === 401) {
        error('Session expired. Please log in again.');
      } else if (err.response?.status === 404) {
        error('Restaurant not found. Please try logging in again.');
      } else {
        error(`Failed to save setup: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Table Setup',
      content: (
        <div className="space-y-6">
          {areas.map((area, areaIndex) => (
            <div key={areaIndex} className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={area}
                  onChange={(e) => {
                    const oldAreaName = area;
                    const newAreas = [...areas];
                    newAreas[areaIndex] = e.target.value;
                    setAreas(newAreas);
                    // Update tables with new area name
                    setTables(tables.map(t => t.areaName === oldAreaName ? {...t, areaName: e.target.value} : t));
                  }}
                  className="text-xl font-semibold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => addTable(area)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Table
                  </button>
                  <button
                    onClick={() => {
                      setAreas(areas.filter((_, i) => i !== areaIndex));
                      setTables(tables.filter(t => t.areaName !== area));
                    }}
                    className="btn-danger flex items-center gap-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables
                  .filter(table => table.areaName === area)
                  .map((table, tableIndex) => (
                    <div
                      key={table.label}
                      className={`relative border-2 rounded-xl p-4 text-center ${
                        hasActiveOrder(table.label) 
                          ? 'bg-red-100 border-red-400' 
                          : 'bg-green-100 border-green-400'
                      }`}
                    >
                      {hasActiveOrder(table.label) ? (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                          <Lock size={16} />
                        </div>
                      ) : (
                        <button
                          onClick={() => removeTable(tables.indexOf(table))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <input
                        type="text"
                        value={table.label}
                        onChange={(e) => {
                          const newTables = [...tables];
                          const globalTableIndex = tables.indexOf(table);
                          newTables[globalTableIndex] = {...table, label: e.target.value};
                          setTables(newTables);
                        }}
                        disabled={hasActiveOrder(table.label)}
                        className={`font-semibold bg-transparent text-center border-b border-gray-300 focus:border-blue-500 outline-none w-full ${
                          hasActiveOrder(table.label) ? 'cursor-not-allowed opacity-60' : ''
                        }`}
                      />
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={table.seats}
                          onChange={(e) => {
                            const newTables = [...tables];
                            const globalTableIndex = tables.indexOf(table);
                            newTables[globalTableIndex] = {...table, seats: parseInt(e.target.value) || 1};
                            setTables(newTables);
                          }}
                          disabled={hasActiveOrder(table.label)}
                          className={`w-12 text-center text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none ${
                            hasActiveOrder(table.label) ? 'cursor-not-allowed opacity-60' : ''
                          }`}
                        />
                        <span className="text-sm text-gray-600">seats</span>
                      </div>
                      {hasActiveOrder(table.label) && (
                        <div className="text-xs text-red-600 mt-1">Active Order</div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
          
          <button
            onClick={addArea}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add Area
          </button>
        </div>
      )
    },
    {
      title: 'Menu Setup',
      content: (
        <div className="space-y-6">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    const oldCategoryName = category;
                    const newCategories = [...categories];
                    newCategories[categoryIndex] = e.target.value;
                    setCategories(newCategories);
                    // Update menu items with new category name
                    setMenuItems(menuItems.map(item => item.categoryName === oldCategoryName ? {...item, categoryName: e.target.value} : item));
                  }}
                  className="text-xl font-semibold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => addMenuItem(category)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Item
                  </button>
                  <button
                    onClick={() => {
                      setCategories(categories.filter(c => c !== category));
                      setMenuItems(menuItems.filter(item => item.categoryName !== category));
                    }}
                    className="btn-danger flex items-center gap-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {menuItems
                  .filter(item => item.categoryName === category)
                  .map((item, itemIndex) => (
                    <div
                      key={`${category}-${itemIndex}`}
                      className="flex justify-between items-center bg-pastel-blue p-4 rounded-xl"
                    >
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">${item.price}</span>
                        <button
                          onClick={() => {
                            const globalIndex = menuItems.indexOf(item);
                            removeMenuItem(globalIndex);
                          }}
                          className="text-soft-red hover:text-red-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          
          <button
            onClick={addCategory}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {isEditMode ? 'Edit Restaurant Setup' : 'Setup Your Restaurant'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Modify your tables and menu items' : "Let's get your POS system ready in just a few steps"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStep
                      ? 'bg-soft-blue text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 font-medium">{step.title}</span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-1 bg-gray-200 mx-4">
                    <div
                      className={`h-full transition-all duration-300 ${
                        index < currentStep ? 'bg-soft-blue' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSaveSetup}
              disabled={loading}
              className="btn-success flex items-center gap-2 animate-bounce-soft"
            >
              <Save size={20} />
              {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save & Finish Setup')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPage;