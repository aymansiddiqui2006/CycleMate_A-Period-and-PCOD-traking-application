import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Calendar, AlertCircle, Activity } from 'lucide-react';
import api from '../api/axios';

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [read, setRead] = useState(false);

  useEffect(() => {
    buildNotifications();
  }, []);

  const buildNotifications = async () => {
    const items = [];
    try {
      const predictRes = await api.get('/cycle/predict');
      const historyRes = await api.get('/cycle/history');
      const riskRes = await api.get('/cycle/pcod-risk');

      if (predictRes.data?.predictedDate) {
        const days = Math.ceil((new Date(predictRes.data.predictedDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 5) {
          items.push({ id: 1, icon: Calendar, color: 'text-[#FF6B8A]', bg: 'bg-pink-50', title: `Period due in ${days} day${days === 1 ? '' : 's'}`, sub: 'Prepare accordingly 🌸' });
        }
      }

      if (historyRes.data?.length > 0) {
        const lastLogged = new Date(historyRes.data[0].startDate);
        const daysSince = Math.floor((new Date() - lastLogged) / (1000 * 60 * 60 * 24));
        if (daysSince > 20) {
          items.push({ id: 2, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50', title: `Last logged ${daysSince} days ago`, sub: 'Log today\'s symptoms to stay on track.' });
        }
      }

      if (riskRes.data?.level === 'high') {
        items.push({ id: 3, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', title: 'PCOD Risk: HIGH', sub: 'Consult a gynecologist as soon as possible.' });
      } else if (riskRes.data?.level === 'moderate') {
        items.push({ id: 4, icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50', title: 'PCOD Risk: MODERATE', sub: 'Monitor your symptoms closely this month.' });
      }

      if (items.length === 0) {
        items.push({ id: 5, icon: CheckCheck, color: 'text-green-500', bg: 'bg-green-50', title: 'All clear! 🌸', sub: 'Your health metrics look great today.' });
      }
    } catch (e) {
      items.push({ id: 5, icon: Bell, color: 'text-gray-400', bg: 'bg-gray-50', title: 'Welcome to CycleSakhi!', sub: 'Start logging your period to get personalized insights.' });
    }
    setNotifications(items);
    setUnreadCount(items.length);
  };

  const markAllRead = () => {
    setRead(true);
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md transition-all"
      >
        <Bell size={18} />
        {!read && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="font-bold text-gray-800 text-lg">Notifications</span>
                <div className="flex items-center gap-2">
                  <button onClick={markAllRead} className="text-xs text-[#FF6B8A] font-semibold hover:underline">Mark all read</button>
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full ${n.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <n.icon className={n.color} size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
