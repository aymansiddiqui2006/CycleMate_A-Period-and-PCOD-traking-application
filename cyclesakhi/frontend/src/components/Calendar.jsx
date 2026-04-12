import React, { useState, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCycle } from '../context/CycleContext';
import PeriodLogModal from './PeriodLogModal';

// BUG FIX: previous toDateStr used `new Date(value)` which parses "YYYY-MM-DD"
// as UTC midnight — causing a -5:30 IST shift and making every date appear as
// the previous day. This version uses local date parts to avoid the shift.
const toDateStr = (value) => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // For ISO strings / Date objects: extract LOCAL year/month/day
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// BUG FIX: parse "YYYY-MM-DD" as LOCAL date (not UTC) for all comparisons
const parseLocal = (dateStr) => {
  const s = toDateStr(dateStr); // normalise first
  if (!s) return new Date(NaN);
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const Calendar = memo(() => {
  const [currentDate,  setCurrentDate]  = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal,    setShowModal]    = useState(false);

  const { history, prediction, refreshData } = useCycle();

  // ── Build Set of all period date strings ──────────────────────────────────
  const periodDateSet = new Set(
    history.flatMap(item => {
      // Prefer periodDates array if available
      if (item.periodDates?.length) {
        return item.periodDates.map(toDateStr).filter(Boolean);
      }
      // Fallback: reconstruct from startDate + length
      const startStr = toDateStr(item.startDate);
      if (!startStr) return [];
      const len   = item.length || 5;
      const start = parseLocal(startStr);
      return Array.from({ length: len }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return toDateStr(d);
      });
    })
  );

  // ── Ovulation window (±2 days around ovulation date) ─────────────────────
  const ovulationWindowSet = new Set();
  let ovulationCoreDateStr = null;
  if (prediction?.ovulationDate) {
    const core = toDateStr(prediction.ovulationDate);
    ovulationCoreDateStr = core;
    const base = parseLocal(core);
    for (let i = -2; i <= 2; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      ovulationWindowSet.add(toDateStr(d));
    }
  }

  // ── Predicted next period ─────────────────────────────────────────────────
  let predictedDateStr = null;

  if (history.length >= 2) {
    const sorted = [...history].sort(
      (a, b) => parseLocal(toDateStr(b.startDate)) - parseLocal(toDateStr(a.startDate))
    );

    const cycleLengths = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = parseLocal(toDateStr(sorted[i].startDate));
      const prev = parseLocal(toDateStr(sorted[i + 1].startDate));
      const diff = Math.ceil((curr - prev) / 86_400_000);
      if (diff >= 21 && diff <= 40) cycleLengths.push(diff);
    }

    if (cycleLengths.length > 0) {
      const median = [...cycleLengths].sort((a, b) => a - b)[
        Math.floor(cycleLengths.length / 2)
      ];
      const lastStart = parseLocal(toDateStr(sorted[0].startDate));
      const nextStart = new Date(lastStart);
      nextStart.setDate(lastStart.getDate() + median);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (nextStart >= today) {
        predictedDateStr = toDateStr(nextStart);
      }
    }
  }

  // Fall back to server prediction
  if (!predictedDateStr && prediction?.predictedDate) {
    const pd    = parseLocal(toDateStr(prediction.predictedDate));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (pd >= today) predictedDateStr = toDateStr(pd);
  }

  const todayStr = toDateStr(new Date());

  // ── Navigation ──────────────────────────────────────────────────────────
  const prevMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1));

  // ── Date click ──────────────────────────────────────────────────────────
  const handleDateClick = (day) => {
    const yyyy = currentDate.getFullYear();
    const mm   = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd   = String(day).padStart(2, '0');
    const clickedDate = `${yyyy}-${mm}-${dd}`;

    if (clickedDate > todayStr) {
      toast('Cannot log future dates 📅');
      return;
    }

    setSelectedDate(clickedDate);
    setShowModal(true);
  };

  // ── Classify each day ──────────────────────────────────────────────────
  const getDayMeta = (day) => {
    const yyyy    = currentDate.getFullYear();
    const mm      = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd      = String(day).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (periodDateSet.has(dateStr))       return { type: 'period',    dateStr };
    if (dateStr === ovulationCoreDateStr) return { type: 'ovulation', dateStr };
    if (ovulationWindowSet.has(dateStr))  return { type: 'fertile',   dateStr };
    if (dateStr === predictedDateStr)     return { type: 'predicted', dateStr };
    if (dateStr === todayStr)             return { type: 'today',     dateStr };
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

  // ── Find the log entry that contains the selected date ─────────────────
  // BUG FIX: all date comparisons now use parseLocal() to avoid UTC shift —
  // previously `new Date(item.startDate)` caused off-by-one errors in IST,
  // so `selectedLog` would come back null and `logId` would be undefined.
  const selectedLog = selectedDate
    ? history.find(item => {
        if (item.periodDates?.length) {
          return item.periodDates.map(toDateStr).includes(selectedDate);
        }
        const startStr = toDateStr(item.startDate);
        const endStr   = toDateStr(item.endDate ?? item.startDate);
        if (!startStr) return false;
        const start    = parseLocal(startStr);
        const end      = parseLocal(endStr);
        const selected = parseLocal(selectedDate);
        return selected >= start && selected <= end;
      })
    : null;

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
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const { type } = getDayMeta(day);

          const base = 'mx-auto w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-150 active:scale-90 cursor-pointer relative';

          const variants = {
            period:    `${base} bg-[#FF6B8A] text-white shadow-sm shadow-pink-200`,
            ovulation: `${base} bg-violet-500 text-white shadow-sm shadow-violet-200`,
            fertile:   `${base} bg-violet-50 text-violet-500 ring-1 ring-violet-300`,
            predicted: `${base} bg-pink-50 text-[#FF6B8A] font-bold ring-2 ring-[#FF6B8A] ring-offset-1`,
            today:     `${base} bg-gray-100 text-gray-800 font-bold ring-2 ring-gray-300 ring-offset-1`,
            default:   `${base} text-gray-500 hover:bg-pink-50 hover:text-[#FF6B8A]`,
          };

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={variants[type]}
            >
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
          { color: 'bg-[#FF6B8A]',                          label: 'Period'         },
          { color: 'bg-violet-500',                         label: 'Ovulation'      },
          { color: 'bg-violet-50 ring-1 ring-violet-300',   label: 'Fertile window' },
          { color: 'bg-pink-50 ring-2 ring-[#FF6B8A]',     label: 'Predicted'      },
          { color: 'bg-gray-200',                           label: 'Today'          },
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
            logId={selectedLog?._id ?? null}
            existingLog={selectedLog ?? null}
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
