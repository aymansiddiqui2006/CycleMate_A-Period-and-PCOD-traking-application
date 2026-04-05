import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';

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
      
      // Store both Access and Refresh Tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success(isLogin ? 'Successfully logged in! 🌸' : 'Welcome to CycleSakhi! 🌸');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      
      {/* 3D Animated Background Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-pink-400 to-[#FF6B8A] rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-float" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-float-delayed" />
      <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-[#FF6B8A] rounded-full mix-blend-overlay filter blur-[100px] opacity-30 animate-float" style={{ animationDuration: '10s' }} />

      {/* Glassmorphic Container Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl h-[650px] mx-4 relative perspective-1000"
      >
        <div className="absolute inset-0 glass-card">
          <div className="w-full h-full flex relative">
            
            {/* The Dynamic Sliding Glass Panel */}
            <motion.div
              layout
              animate={{ x: isLogin ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 50, damping: 14 }}
              className="absolute top-0 left-0 w-1/2 h-full z-20 flex flex-col items-center justify-center text-white overflow-hidden shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-[#FF6B8A]/90 to-purple-600/90 border-r border-white/20"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <motion.div
                key={isLogin ? 'left-info' : 'right-info'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="z-30 text-center px-12"
              >
                <div className="w-32 h-32 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-full h-full bg-white/20 backdrop-blur-md rounded-full border border-white/50 flex items-center justify-center text-5xl shadow-lg shadow-pink-500/30">
                    ✨
                  </div>
                </div>
                <h2 className="text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                  {isLogin ? 'Hello, Beautiful.' : 'Welcome back.'}
                </h2>
                <p className="mb-10 text-pink-50 font-medium text-lg drop-shadow">
                  {isLogin 
                             ? 'Begin your journey to a balanced and healthy life with us.' : 'Sign up and start tracking your health journey today!'}
                </p>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="px-10 py-3 border-2 border-white/80 rounded-full font-bold tracking-wide hover:bg-white hover:text-[#FF6B8A] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  {isLogin ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </button>
              </motion.div>
            </motion.div>

            {/* Login Form Area */}
            <div className="w-1/2 h-full absolute right-0 p-14 flex flex-col justify-center items-center">
              <AnimatePresence mode="wait">
                {isLogin && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm"
                  >
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">Sign In</h2>
                    <p className="text-gray-500 mb-8 font-medium">Access your health analytics</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="group">
                         <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="input-field" />
                      </div>
                      <div className="group">
                         <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input-field" />
                      </div>
                      <button type="submit" disabled={loading} className="w-full btn-primary text-lg mt-4 flex justify-center items-center shadow-lg">
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Sign In'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Signup Form Area */}
            <div className="w-1/2 h-full absolute left-0 p-14 flex flex-col justify-center items-center">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm"
                  >
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">Sign Up</h2>
                    <p className="text-gray-500 mb-8 font-medium">Join our community today</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="input-field py-3" />
                      <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="input-field py-3" />
                      <div className="flex gap-4">
                        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="input-field py-3 w-1/3" />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input-field py-3 w-2/3" />
                      </div>
                      <button type="submit" disabled={loading} className="w-full btn-primary text-lg mt-4 flex justify-center items-center shadow-lg">
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Create Account'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
