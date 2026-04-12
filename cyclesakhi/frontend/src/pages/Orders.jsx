import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

const appsData = [
  { id: 'zepto', name: 'Zepto', color: '#3b0060', category: 'Pads', link: 'https://www.zeptonow.com', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400&h=220', product: 'Sanitary Pads / Tampons' },
  { id: 'blinkit', name: 'Blinkit', color: '#ffc200', category: 'Pads', link: 'https://blinkit.com', image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=400&h=220', product: 'Whisper Ultra Clean' },
  { id: 'jiomart', name: 'JioMart', color: '#00529e', category: 'Pain Relief', link: 'https://www.jiomart.com', image: 'https://images.unsplash.com/photo-1584305574647-0cc929a2bb9f?auto=format&fit=crop&q=80&w=400&h=220', product: 'Feminine Hygiene Care' },
  { id: 'minutes', name: 'Minutes', color: '#ff4d4f', category: 'Tampons', link: '#', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&h=220', product: 'Emergency Delivery' },
];

const CATEGORIES = ['All', 'Pads', 'Tampons', 'Pain Relief'];

const Orders = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');
  const [periodSoon, setPeriodSoon] = useState(false);

  useEffect(() => {
    const checkPrediction = async () => {
      try {
        const res = await api.get('/cycle/predict');
        if (res.data?.predictedDate) {
          const days = Math.ceil((new Date(res.data.predictedDate) - new Date()) / (1000 * 60 * 60 * 24));
          if (days >= 0 && days <= 3) setPeriodSoon(true);
        }
      } catch {}
    };
    checkPrediction();
  }, []);

  const filtered = filter === 'All' ? appsData : appsData.filter(a => a.category === filter);

  return (
    <div className="p-6 md:p-8 min-h-full relative">
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-300/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-1">{t('orders_title')}</h1>
            <p className="text-gray-500">Get your hygiene essentials delivered within minutes.</p>
          </div>
          {periodSoon && (
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-full text-sm font-semibold"
            >
              <Zap size={16} fill="currentColor" />
              URGENT — Period in 3 days!
            </motion.div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 bg-white/70 backdrop-blur-xl rounded-2xl p-1.5 border border-gray-100 w-fit shadow-sm flex-wrap">
          {CATEGORIES.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                filter === f ? 'bg-[#FF6B8A] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {f === 'All' ? t('all') : f}
            </button>
          ))}
        </div>

        {/* Cards */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(app => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden group"
            >
              <div className="relative h-44 overflow-hidden">
                <img src={app.image} alt={app.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-black text-2xl tracking-wide drop-shadow">{app.name}</h3>
                </div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">
                  {app.category}
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{app.product}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
                    <Clock size={12} />
                    {t('order_badge')}
                  </div>
                </div>
                <a
                  href={app.link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF6B8A] group-hover:text-white transition-all shadow-sm"
                >
                  <ArrowRight size={22} />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Orders;
