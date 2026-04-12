import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const doctorsData = [
  { id: 1, name: 'Dr. Anita Mahey',       city: 'Chandigarh', specialization: 'Gynecologist', rating: 4.9, available: true,  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 2, name: 'Dr. Heena Chawla',      city: 'Chandigarh', specialization: 'Gynecologist', rating: 4.8, available: true,  image: 'https://images.unsplash.com/photo-1594824436998-d50d0bc75440?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 3, name: 'Dr. Sweta Shah',        city: 'Mumbai',     specialization: 'Gynecologist', rating: 4.7, available: false, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 4, name: 'Dr. Manjiri',           city: 'Mumbai',     specialization: 'Gynecologist', rating: 4.8, available: true,  image: 'https://images.unsplash.com/photo-1527613426496-c67d6c6e7ed6?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 5, name: 'Dr. Shweta Mendiratta', city: 'Mumbai',     specialization: 'Gynecologist', rating: 4.7, available: true,  image: 'https://www.yatharthhospitals.com/uploads/doctor/dr-shweta-mendiratta11515556.jpeg' },
  { id: 6, name: 'Dr. Veena Keerthi',     city: 'Mumbai',     specialization: 'Gynecologist', rating: 4.6, available: true,  image: 'https://kangaroocareindia.com/static/media/dr-veena-keerthi-new.cf46915542f71ba9bb1c.jpeg' },
];

const FILTERS = ['All', 'Chandigarh', 'Mumbai'];

const Doctors = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? doctorsData : doctorsData.filter(d => d.city === filter);

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full relative">
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#FF6B8A]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-extrabold text-gray-800 mb-1">{t('doctors_title')}</h1>
          <p className="text-gray-500 text-sm">Find the best gynecologists near you for consultation.</p>
        </div>

        {/* Filter Tabs — horizontally scrollable on tiny screens */}
        <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-sm transition-all ${
                filter === f
                  ? 'bg-[#FF6B8A] text-white shadow-md'
                  : 'bg-white/70 backdrop-blur-xl border border-gray-100 text-gray-500 hover:text-gray-800'
              }`}
            >
              {f === 'All' ? t('all') : f}
            </button>
          ))}
        </div>

        {/* Cards Grid — 1 col on mobile, 2 col on md+ */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      loading="lazy"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-pink-100 shadow-sm"
                    />
                    {doctor.available && (
                      <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white whitespace-nowrap">
                        {t('available_today')}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base group-hover:text-[#FF6B8A] transition-colors truncate">{doctor.name}</h3>
                    <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full inline-block mt-1 mb-1.5">{doctor.specialization}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <MapPin size={11} /><span>{doctor.city}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold">
                        <Star size={11} fill="currentColor" /><span>{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-center flex-shrink-0">
                  <button
                    id={`book-${doctor.id}`}
                    onClick={() => toast(`${t('coming_soon')} 🌸`, { icon: '🏥' })}
                    className="px-3 py-2 min-h-[40px] rounded-full bg-pink-50 text-[#FF6B8A] text-xs font-semibold hover:bg-pink-100 transition-colors whitespace-nowrap"
                  >
                    {t('book_appointment')}
                  </button>
                  <button
                    id={`view-${doctor.id}`}
                    className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF6B8A] group-hover:text-white transition-all"
                  >
                    <ArrowRight size={16} />
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
