import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './stores/useStore';
import { restaurantAPI } from './utils/api';
import AuthPage from './pages/AuthPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

function App() {
  const { isAuthenticated, restaurant, setRestaurant } = useStore();

  useEffect(() => {
    if (isAuthenticated && !restaurant?.setupComplete) {
      restaurantAPI.getMe()
        .then(response => setRestaurant(response.data))
        .catch(console.error);
    }
  }, [isAuthenticated, restaurant?.setupComplete, setRestaurant]);

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <Toast />
      </>
    );
  }

  if (!restaurant?.setupComplete) {
    return (
      <>
        <SetupPage />
        <Toast />
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-soft-gray">
        <Navbar />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </Router>
  );
}

export default App;