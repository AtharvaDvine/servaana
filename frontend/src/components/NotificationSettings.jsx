import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Bell, BellOff, Mail, Play, Save, AlertTriangle } from 'lucide-react';
import { restaurantAPI } from '../utils/api';
import useStore from '../stores/useStore';

const NotificationSettings = ({ isOpen, onClose }) => {
  const { restaurant, setRestaurant } = useStore();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    soundVolume: 70,
    browserNotifications: true,
    emailNotifications: false,
    orderCompleteSound: 'success',
    warningSound: 'warning',
    integrationSound: 'notification',
    generalSound: 'default'
  });

  const soundOptions = [
    { value: 'default', label: 'Default Beep' },
    { value: 'success', label: 'Success Chime' },
    { value: 'warning', label: 'Warning Alert' },
    { value: 'notification', label: 'Notification Ping' },
    { value: 'bell', label: 'Bell Ring' }
  ];

  useEffect(() => {
    if (restaurant?.notificationSettings) {
      setSettings({
        soundEnabled: restaurant.notificationSettings.soundEnabled ?? true,
        soundVolume: restaurant.notificationSettings.soundVolume ?? 70,
        browserNotifications: restaurant.notificationSettings.browserNotifications ?? true,
        emailNotifications: restaurant.notificationSettings.emailNotifications ?? false,
        orderCompleteSound: restaurant.notificationSettings.orderCompleteSound ?? 'success',
        warningSound: restaurant.notificationSettings.warningSound ?? 'warning',
        integrationSound: restaurant.notificationSettings.integrationSound ?? 'notification',
        generalSound: restaurant.notificationSettings.generalSound ?? 'default'
      });
    }
  }, [restaurant]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const playTestSound = (soundType) => {
    if (!settings.soundEnabled) return;
    
    // Create audio context for different sound types
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set volume based on settings
    gainNode.gain.setValueAtTime(settings.soundVolume / 100, audioContext.currentTime);
    
    // Different frequencies for different sound types
    const frequencies = {
      default: 800,
      success: [523, 659, 784], // C-E-G chord
      warning: [440, 440, 440], // Repeated A note
      notification: 1000,
      bell: [523, 659]
    };
    
    const freq = frequencies[soundType];
    
    if (Array.isArray(freq)) {
      // Play sequence for complex sounds
      freq.forEach((f, index) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.setValueAtTime(f, audioContext.currentTime);
          gain.gain.setValueAtTime(settings.soundVolume / 100, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.3);
        }, index * 200);
      });
    } else {
      // Play single tone
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleSettingChange('browserNotifications', true);
        // Show test notification
        new Notification('Restaurant POS', {
          body: 'Browser notifications are now enabled!',
          icon: '/favicon.ico'
        });
      } else {
        handleSettingChange('browserNotifications', false);
        alert('Notification permission denied. Please enable in browser settings.');
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const restaurantId = restaurant?.id || restaurant?._id;
      const response = await restaurantAPI.updateNotificationSettings(restaurantId, settings);
      
      // Update restaurant in store with new notification settings
      setRestaurant({
        ...restaurant,
        notificationSettings: response.data.notificationSettings
      });
      
      alert('Notification settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert(`Error saving settings: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-96 shadow-2xl overflow-y-auto animate-slide-in-right">
        
        {/* Header */}
        <div className="bg-blue-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell size={24} />
              Notification Settings
            </h2>
            <p className="text-blue-100 text-sm">Configure alerts and sounds</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Volume2 size={20} />
              Sound Settings
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Enable Sounds</span>
              <button
                onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                } mt-0.5`} />
              </button>
            </div>
            
            {settings.soundEnabled && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Volume: {settings.soundVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                {/* Sound Type Settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Order Complete</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.orderCompleteSound}
                        onChange={(e) => handleSettingChange('orderCompleteSound', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {soundOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => playTestSound(settings.orderCompleteSound)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Warnings</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.warningSound}
                        onChange={(e) => handleSettingChange('warningSound', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {soundOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => playTestSound(settings.warningSound)}
                        className="p-1 text-orange-500 hover:bg-orange-50 rounded"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">App Integrations</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.integrationSound}
                        onChange={(e) => handleSettingChange('integrationSound', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {soundOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => playTestSound(settings.integrationSound)}
                        className="p-1 text-purple-500 hover:bg-purple-50 rounded"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">General Notifications</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.generalSound}
                        onChange={(e) => handleSettingChange('generalSound', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {soundOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => playTestSound(settings.generalSound)}
                        className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Browser Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={20} />
              Browser Notifications
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Desktop Notifications</span>
              <button
                onClick={settings.browserNotifications ? 
                  () => handleSettingChange('browserNotifications', false) : 
                  requestNotificationPermission
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.browserNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                } mt-0.5`} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Get desktop notifications for important events even when the app is in the background.
            </p>
          </div>

          {/* Email Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Mail size={20} />
              Email Notifications
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Daily Summary</span>
              <button
                onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                } mt-0.5`} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Receive daily sales summaries and important alerts via email.
            </p>
          </div>

          {/* Future Integrations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={20} />
              App Integrations
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Coming Soon:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Swiggy order notifications</li>
                <li>• Zomato integration alerts</li>
                <li>• Payment gateway notifications</li>
                <li>• Inventory low stock warnings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full btn-success flex items-center justify-center gap-2 py-3"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;