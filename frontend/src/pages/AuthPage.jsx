import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import useStore from '../stores/useStore';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', ownerName: '', email: '', phone: '', address: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = isLogin 
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register(formData);
      
      login(response.data.token, response.data.restaurant);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
        
        {/* Login Card */}
        <div className={`card p-8 transition-all duration-500 ${isLogin ? 'scale-105 shadow-2xl' : 'opacity-75'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
          
          {isLogin && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="input-field text-lg"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input-field text-lg"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg py-4"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}
          
          {!isLogin && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Already have an account?</p>
              <button
                onClick={() => setIsLogin(true)}
                className="btn-primary"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Register Card */}
        <div className={`card p-8 transition-all duration-500 ${!isLogin ? 'scale-105 shadow-2xl' : 'opacity-75'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Start Your Journey</h2>
          
          {!isLogin && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Restaurant Name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="ownerName"
                placeholder="Owner Name"
                value={formData.ownerName}
                onChange={handleChange}
                className="input-field"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-success w-full text-lg py-4"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
          
          {isLogin && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">New to our platform?</p>
              <button
                onClick={() => setIsLogin(false)}
                className="btn-success"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;