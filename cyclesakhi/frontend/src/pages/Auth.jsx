import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Loader2, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;

      const { data } = await api.post(endpoint, payload);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success(isLogin ? 'Successfully logged in! 🌸' : 'Welcome to CycleSakhi! 🌸');
      if (isLogin) {
        navigate('/dashboard');
      } else if (data.isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden px-4 py-8">

      {/* Background Orbs — pointer-events-none to prevent click capture */}
      <div className="absolute top-[-15%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tr from-pink-400 to-[#FF6B8A] rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-tl from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-float-delayed pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#FF6B8A] rounded-full mix-blend-overlay filter blur-[100px] opacity-30 animate-float pointer-events-none" style={{ animationDuration: '10s' }} />

      {/* ── Mobile / Tablet: Single centered card with tab switcher ── */}
      <div className="lg:hidden w-full max-w-sm relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-6 sm:p-8 shadow-2xl"
        >
          {/* Brand */}
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🌸</span>
            <h1 className="text-2xl font-extrabold text-gray-800">CycleSakhi</h1>
            <p className="text-gray-500 text-sm mt-1">Your personal health companion</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-pink-50 rounded-xl p-1 mb-6">
            <button
              id="tab-signin"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold min-h-[44px] transition-all ${
                isLogin ? 'bg-white text-[#FF6B8A] shadow-sm' : 'text-gray-500'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold min-h-[44px] transition-all ${
                !isLogin ? 'bg-white text-[#FF6B8A] shadow-sm' : 'text-gray-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="mobile-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="mobile-signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
                <div className="flex gap-3">
                  <input
                    id="signup-age"
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="input-field w-1/3"
                  />
                  <input
                    id="signup-password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field w-2/3"
                  />
                </div>
                <button
                  id="signup-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Desktop lg+: Two-column split layout ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:grid grid-cols-2 w-full max-w-5xl relative z-10 glass-card min-h-[620px] overflow-hidden"
      >
        {/* Left — Gradient Branded Panel */}
        <motion.div
          layout
          animate={{ order: isLogin ? 0 : 1 }}
          className="relative flex flex-col items-center justify-center text-white overflow-hidden bg-gradient-to-br from-[#FF6B8A]/90 to-purple-600/90 p-10"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          <motion.div
            key={isLogin ? 'left-info' : 'right-info'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="z-10 text-center"
          >
            <div className="w-28 h-28 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20 pointer-events-none" />
              <div className="relative w-full h-full bg-white/20 backdrop-blur-md rounded-full border border-white/50 flex items-center justify-center text-5xl shadow-lg shadow-pink-500/30">
                ✨
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">
              {isLogin ? 'Hello, Beautiful.' : 'Welcome back.'}
            </h2>
            <p className="mb-10 text-pink-50 font-medium text-base lg:text-lg drop-shadow max-w-xs mx-auto">
              {isLogin
                ? 'Begin your journey to a balanced and healthy life with us.'
                : 'Sign up and start tracking your health journey today!'}
            </p>
            <button
              id="toggle-auth-mode"
              onClick={() => setIsLogin(!isLogin)}
              className="px-10 py-3 min-h-[48px] border-2 border-white/80 rounded-full font-bold tracking-wide hover:bg-white hover:text-[#FF6B8A] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              {isLogin ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </motion.div>
        </motion.div>

        {/* Right — Form Panel */}
        <div className="flex flex-col justify-center items-center p-10 lg:p-14">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="desktop-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm"
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Sign In</h2>
                <p className="text-gray-500 mb-8 font-medium">Access your health analytics</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    id="desktop-login-email"
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                  <input
                    id="desktop-login-password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                  <button
                    id="desktop-login-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Sign In'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="desktop-signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm"
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Sign Up</h2>
                <p className="text-gray-500 mb-8 font-medium">Join our community today</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    id="desktop-signup-name"
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                  <input
                    id="desktop-signup-email"
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                  <div className="flex gap-4">
                    <input
                      id="desktop-signup-age"
                      type="number"
                      name="age"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      className="input-field w-1/3"
                    />
                    <input
                      id="desktop-signup-password"
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="input-field w-2/3"
                    />
                  </div>
                  <button
                    id="desktop-signup-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Create Account'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
