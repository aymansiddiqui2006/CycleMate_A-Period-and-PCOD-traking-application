import React, { useState, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCycle } from '../context/CycleContext';
import PeriodLogModal from './PeriodLogModal';

const Calendar = memo(() => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // All data comes from shared CycleContext
  const { history, prediction, refreshData } = useCycle();

  // Derive display sets from context data
  const periodDates = new Set(
    history.map(item => new Date(item.startDate).toDateString())
  );
  const predictedDate = prediction?.predictedDate
    ? new Date(prediction.predictedDate).toDateString()
    : null;
  const ovulationDate = prediction?.ovulationDate
    ? new Date(prediction.ovulationDate).toDateString()
    : null;

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (date > new Date()) { toast('Cannot log future dates 📅'); return; }
    setSelectedDate(date.toISOString().split('T')[0]);
    setShowModal(true);
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getDayStyle = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    const todayStr = new Date().toDateString();

    if (periodDates.has(dateStr))  return { bg: 'bg-[#FF6B8A] shadow-md shadow-pink-200',   text: 'text-white', ring: '' };
    if (dateStr === ovulationDate) return { bg: 'bg-purple-500 shadow-md shadow-purple-200', text: 'text-white', ring: '' };
    if (dateStr === predictedDate) return { bg: 'bg-pink-100',  text: 'text-[#FF6B8A] font-bold', ring: 'ring-2 ring-[#FF6B8A] ring-offset-1' };
    if (dateStr === todayStr)      return { bg: 'bg-gray-100',  text: 'text-gray-800 font-bold',   ring: 'ring-2 ring-gray-300 ring-offset-1' };
    return { bg: 'hover:bg-pink-50', text: 'text-gray-600', ring: '' };
  };

  return (
    <div className="w-full flex flex-col">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-pink-50 flex items-center justify-center text-gray-500 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="font-bold text-gray-800">
          {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-pink-50 flex items-center justify-center text-gray-500 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-xs font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const s = getDayStyle(day);
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all active:scale-90 ${s.bg} ${s.text} ${s.ring}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-5 pt-4 border-t border-gray-100">
        <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-full bg-[#FF6B8A] inline-block" />Period</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />Ovulation</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-full bg-pink-200 inline-block ring-2 ring-[#FF6B8A]" />Predicted</span>
      </div>

      {/* Period Log Modal */}
      <AnimatePresence>
        {showModal && selectedDate && (
          <PeriodLogModal
            date={selectedDate}
            onClose={() => setShowModal(false)}
            onLogged={() => {
              // refreshData() triggers context update → Dashboard re-renders automatically
              refreshData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

Calendar.displayName = 'Calendar';
export default Calendar;