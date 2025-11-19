import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, BarChart3, Settings, ChevronDown, Edit, LogOut, User, Bell, HelpCircle, Download } from 'lucide-react';
import useStore from '../stores/useStore';
import NotificationSettings from './NotificationSettings';
import ExportDataModal from './ExportDataModal';
import HelpSupportModal from './HelpSupportModal';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { restaurant, logout } = useStore();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsDropdown && !event.target.closest('.relative')) {
        setShowSettingsDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsDropdown]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {restaurant?.name}
            </h1>
            
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-soft-blue text-white'
                        : 'text-gray-600 hover:bg-pastel-blue'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-pastel-blue rounded-xl transition-colors"
            >
              <Settings size={20} />
              <span>Settings</span>
              <ChevronDown size={16} className={`transition-transform ${showSettingsDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showSettingsDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    navigate('/setup');
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit size={18} />
                  <span>Edit Setup</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={18} />
                  <span>Restaurant Profile</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowNotificationSettings(true);
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowExportModal(true);
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download size={18} />
                  <span>Export Data</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowHelpSupport(true);
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <HelpCircle size={18} />
                  <span>Help & Support</span>
                </button>
                
                <hr className="my-2 border-gray-200" />
                
                <button
                  onClick={() => {
                    logout();
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification Settings Modal */}
      <NotificationSettings 
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
      
      {/* Export Data Modal */}
      <ExportDataModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
      
      {/* Help & Support Modal */}
      <HelpSupportModal 
        isOpen={showHelpSupport}
        onClose={() => setShowHelpSupport(false)}
      />
    </nav>
  );
};

export default Navbar;