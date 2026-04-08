import React, { useState, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCycle } from '../context/CycleContext';
import PeriodLogModal from './PeriodLogModal';
// Helper: normalize any date to YYYY-MM-DD
const toDateStr = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const Calendar = memo(() => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { history, prediction, refreshData } = useCycle();

  // ─── Build a Set of period date strings (YYYY-MM-DD) from history ───────────
  // FIX: Use consistent YYYY-MM-DD format everywhere (was mixing toDateString vs ISO)
  const periodDateSet = new Set(
    history.flatMap(item => {
      if (item.periodDates?.length) return item.periodDates; // use pre-computed array if available

      // fallback: compute from startDate + length
      const start = new Date(item.startDate);
      const len = item.length || 5;
      return Array.from({ length: len }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d.toISOString().split('T')[0];
      });
    })
  );

  // ─── Find the log entry that covers a given YYYY-MM-DD date ─────────────────
  let predictedDateStr = null;

if (history.length > 0) {
  // 1️⃣ Find latest period start date
  const latestPeriod = history
    .map(item => ({
      start: new Date(item.startDate),
      end: item.periodDates?.length
             ? new Date(item.periodDates[item.periodDates.length - 1])
             : item.endDate ? new Date(item.endDate) : new Date(item.startDate)
    }))
    .sort((a, b) => b.start - a.start)[0];

  const lastPeriodEnd = latestPeriod.end;

  // 2️⃣ Assume cycle length ~28 days
  const nextPeriod = new Date(lastPeriodEnd);
  nextPeriod.setDate(nextPeriod.getDate() + 28);

  // 3️⃣ Only show if it’s not in the past
  const today = new Date();
  if (nextPeriod >= today) {
    predictedDateStr = nextPeriod.toISOString().split('T')[0];
  }
}
// fallback if no history, just show predicted
if (!predictedDateStr && prediction?.predictedDate) {
  predictedDateStr = new Date(prediction.predictedDate).toISOString().split('T')[0];
}
  const ovulationDateStr = prediction?.ovulationDate
    ? new Date(prediction.ovulationDate).toISOString().split('T')[0]
    : null;
  const todayStr = new Date().toISOString().split('T')[0];

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1));

  // ─── Date click ─────────────────────────────────────────────────────────────
  const handleDateClick = (day) => {
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const clickedDate = `${yyyy}-${mm}-${dd}`;

    if (clickedDate > todayStr) {
      toast('Cannot log future dates 📅');
      return;
    }

    setSelectedDate(clickedDate);
    setShowModal(true);
  };

  // ─── Styling per day ─────────────────────────────────────────────────────────
  const getDayMeta = (day) => {
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (periodDateSet.has(dateStr))  return { type: 'period', dateStr };
if (dateStr === ovulationDateStr) return { type: 'ovulation', dateStr };
if (dateStr === predictedDateStr) return { type: 'predicted', dateStr };
if (dateStr === todayStr) return { type: 'today', dateStr };
    return { type: 'default', dateStr };
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(), currentDate.getMonth() + 1, 0
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(), currentDate.getMonth(), 1
  ).getDay();

  const monthLabel = currentDate.toLocaleDateString('default', {
    month: 'long', year: 'numeric',
  });

  return (
    <div className="w-full select-none font-[system-ui]">
      {/* ── Month Nav ── */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-[#FF6B8A] transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        <span className="text-sm font-bold tracking-wide text-gray-800">{monthLabel}</span>

        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-[#FF6B8A] transition-colors"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Day headers ── */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-[10px] font-bold text-gray-400 py-1 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day grid ── */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} />)}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const { type } = getDayMeta(day);

          const base = 'mx-auto w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-150 active:scale-90 cursor-pointer relative';

          const variants = {
            period:    `${base} bg-[#FF6B8A] text-white shadow-sm shadow-pink-200`,
            ovulation: `${base} bg-violet-500 text-white shadow-sm shadow-violet-200`,
            predicted: `${base} bg-pink-50 text-[#FF6B8A] font-bold ring-2 ring-[#FF6B8A] ring-offset-1`,
            today:     `${base} bg-gray-100 text-gray-800 font-bold ring-2 ring-gray-300 ring-offset-1`,
            default:   `${base} text-gray-500 hover:bg-pink-50 hover:text-[#FF6B8A]`,
          };

          return (
            <button key={day} onClick={() => handleDateClick(day)} className={variants[type]}>
              {day}
              {type === 'period' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full border-2 border-[#FF6B8A]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap justify-center gap-3 mt-5 pt-4 border-t border-gray-100">
        {[
          { color: 'bg-[#FF6B8A]', label: 'Period' },
          { color: 'bg-violet-500', label: 'Ovulation' },
          { color: 'bg-pink-50 ring-2 ring-[#FF6B8A]', label: 'Predicted' },
          { color: 'bg-gray-200', label: 'Today' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <span className={`w-3 h-3 rounded-full inline-block flex-shrink-0 ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && selectedDate && (
          <PeriodLogModal
            date={selectedDate}
            logId={selectedLog?._id || null}
            onClose={() => { setShowModal(false); setSelectedDate(null); }}
            onLogged={refreshData}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

Calendar.displayName = 'Calendar';
export default Calendar;
