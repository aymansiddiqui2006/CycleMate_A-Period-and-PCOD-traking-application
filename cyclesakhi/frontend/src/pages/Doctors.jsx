import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const doctorsData = [
  { id: 1, name: 'Dr. Anita Mahey', city: 'Chandigarh', specialization: 'Gynecologist', rating: 4.9, available: true, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 2, name: 'Dr. Heena Chawla', city: 'Chandigarh', specialization: 'Gynecologist', rating: 4.8, available: true, image: 'https://images.unsplash.com/photo-1594824436998-d50d0bc75440?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 3, name: 'Dr. Sweta Shah', city: 'Mumbai', specialization: 'Gynecologist', rating: 4.7, available: false, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 4, name: 'Dr. Manjiri', city: 'Mumbai', specialization: 'Gynecologist', rating: 4.8, available: true, image: 'https://images.unsplash.com/photo-1527613426496-c67d6c6e7ed6?auto=format&fit=crop&q=80&w=200&h=200' },
];

const FILTERS = ['All', 'Chandigarh', 'Mumbai'];

const Doctors = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? doctorsData : doctorsData.filter(d => d.city === filter);

  return (
    <div className="p-6 md:p-8 min-h-full relative">
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#FF6B8A]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">{t('doctors_title')}</h1>
          <p className="text-gray-500">Find the best gynecologists near you for consultation.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-white/70 backdrop-blur-xl rounded-2xl p-1.5 border border-gray-100 w-fit shadow-sm">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                filter === f
                  ? 'bg-[#FF6B8A] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {f === 'All' ? t('all') : f}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(doctor => (
              <motion.div
                key={doctor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between group"
              >
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-100 shadow-sm"
                    />
                    {doctor.available && (
                      <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                        {t('available_today')}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base group-hover:text-[#FF6B8A] transition-colors">{doctor.name}</h3>
                    <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full inline-block mt-1 mb-2">{doctor.specialization}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <MapPin size={12} /><span>{doctor.city}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold">
                        <Star size={12} fill="currentColor" /><span>{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <button
                    onClick={() => toast(`${t('coming_soon')} 🌸`, { icon: '🏥' })}
                    className="px-3 py-1.5 rounded-full bg-pink-50 text-[#FF6B8A] text-xs font-semibold hover:bg-pink-100 transition-colors"
                  >
                    {t('book_appointment')}
                  </button>
                  <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF6B8A] group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Doctors;
