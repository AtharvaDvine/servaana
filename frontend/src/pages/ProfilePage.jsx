import React, { useState, useEffect } from 'react';
import { Save, Edit2, Check, X, Mail, Clock, MapPin, User, Phone, Utensils } from 'lucide-react';
import { restaurantAPI } from '../utils/api';
import useStore from '../stores/useStore';

const ProfilePage = () => {
  const { restaurant, setRestaurant } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    cuisineType: 'Multi-Cuisine',
    description: '',
    businessHours: {
      openTime: '09:00',
      closeTime: '22:00'
    }
  });

  const cuisineTypes = [
    'Multi-Cuisine', 'Indian', 'Chinese', 'Italian', 'Mexican', 
    'Thai', 'Japanese', 'American', 'Mediterranean', 'Fast Food'
  ];

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        ownerName: restaurant.ownerName || '',
        email: restaurant.email || '',
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        cuisineType: restaurant.cuisineType || 'Multi-Cuisine',
        description: restaurant.description || '',
        businessHours: {
          openTime: restaurant.businessHours?.openTime || '09:00',
          closeTime: restaurant.businessHours?.closeTime || '22:00'
        }
      });
    }
  }, [restaurant]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const restaurantId = restaurant?.id || restaurant?._id;
      const response = await restaurantAPI.updateProfile(restaurantId, formData);
      
      if (response.data.emailChangeRequested) {
        setShowEmailVerification(true);
        alert('Email change requested. Please check console for verification token (in real app, check your email).');
      } else {
        setRestaurant(response.data);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert(`Error updating profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    try {
      const restaurantId = restaurant?.id || restaurant?._id;
      const response = await restaurantAPI.verifyEmail(restaurantId, verificationToken);
      
      setRestaurant(response.data.restaurant);
      setShowEmailVerification(false);
      setVerificationToken('');
      setIsEditing(false);
      alert('Email verified and profile updated successfully!');
    } catch (error) {
      alert('Invalid verification token. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: restaurant.name || '',
      ownerName: restaurant.ownerName || '',
      email: restaurant.email || '',
      phone: restaurant.phone || '',
      address: restaurant.address || '',
      cuisineType: restaurant.cuisineType || 'Multi-Cuisine',
      description: restaurant.description || '',
      businessHours: {
        openTime: restaurant.businessHours?.openTime || '09:00',
        closeTime: restaurant.businessHours?.closeTime || '22:00'
      }
    });
    setIsEditing(false);
    setShowEmailVerification(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Restaurant Profile</h1>
            <p className="text-gray-600">Manage your restaurant information and settings</p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit2 size={20} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="btn-danger flex items-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-success flex items-center gap-2"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <User className="text-blue-500" size={24} />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                  {restaurant?.pendingEmail && (
                    <span className="text-orange-600 text-xs ml-2">(Change pending verification)</span>
                  )}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Utensils className="text-green-500" size={24} />
              Business Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                <select
                  value={formData.cuisineType}
                  onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {cuisineTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Brief description of your restaurant..."
                  className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Business Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={formData.businessHours.openTime}
                      onChange={(e) => handleInputChange('businessHours.openTime', e.target.value)}
                      disabled={!isEditing}
                      className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={formData.businessHours.closeTime}
                      onChange={(e) => handleInputChange('businessHours.closeTime', e.target.value)}
                      disabled={!isEditing}
                      className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="card p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">System Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {new Date(restaurant?.createdAt).toLocaleDateString()}
              </div>
              <div className="text-gray-600 text-sm">Registration Date</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {restaurant?.tables?.length || 0}
              </div>
              <div className="text-gray-600 text-sm">Total Tables</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {restaurant?.menu?.filter(item => !item.isDeleted).length || 0}
              </div>
              <div className="text-gray-600 text-sm">Menu Items</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${restaurant?.setupComplete ? 'text-green-600' : 'text-orange-600'}`}>
                {restaurant?.setupComplete ? 'Complete' : 'Pending'}
              </div>
              <div className="text-gray-600 text-sm">Setup Status</div>
            </div>
          </div>
        </div>

        {/* Email Verification Modal */}
        {showEmailVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="text-center mb-6">
                <Mail className="mx-auto text-blue-500 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Verify Email Change</h3>
                <p className="text-gray-600 text-sm">
                  Enter the verification token sent to your new email address
                </p>
              </div>
              
              <input
                type="text"
                placeholder="Enter verification token"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                className="input-field mb-4"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmailVerification(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailVerification}
                  className="flex-1 btn-success"
                >
                  Verify Email
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default ProfilePage;