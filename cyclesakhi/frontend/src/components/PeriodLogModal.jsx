import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, AlertCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const SYMPTOMS    = ['Cramps', 'Bloating', 'Mood Swings', 'Headache', 'Fatigue', 'Acne'];
const MOODS       = [
  { emoji: '😊', label: 'Happy'  },
  { emoji: '😢', label: 'Sad'    },
  { emoji: '😤', label: 'Angry'  },
  { emoji: '😴', label: 'Tired'  },
  { emoji: '🤒', label: 'Unwell' },
];
const FLOW_LEVELS = [
  { key: 'Light',  icon: '💧',    desc: '1–2 pads/day' },
  { key: 'Medium', icon: '💧💧',  desc: '3–4 pads/day' },
  { key: 'Heavy',  icon: '💧💧💧', desc: '5+ pads/day' },
];

// ─── Props ────────────────────────────────────────────────────────────────────
// date        – "YYYY-MM-DD" string of the clicked calendar day
// logId       – _id of the existing CycleData document, or null if unlogged
// existingLog – the full log object (pre-fill form fields), or null
// onClose     – callback to close the modal
// onLogged    – callback to refresh calendar data after log/delete
const PeriodLogModal = ({ date, onClose, onLogged, logId, existingLog }) => {
  const [flowLevel, setFlowLevel] = useState(existingLog?.flowLevel ?? 'Medium');
  const [symptoms,  setSymptoms]  = useState(existingLog?.symptoms  ?? []);
  const [mood,      setMood]      = useState(existingLog?.mood       ?? '😊');
  const [notes,     setNotes]     = useState(existingLog?.notes      ?? '');
  const [length,    setLength]    = useState(
    existingLog?.periodDates?.length ?? (existingLog?.duration ?? 5)
  );
  const [loading,       setLoading]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Re-sync if parent passes a different log
  useEffect(() => {
    if (existingLog) {
      setFlowLevel(existingLog.flowLevel ?? 'Medium');
      setSymptoms(existingLog.symptoms   ?? []);
      setMood(existingLog.mood           ?? '😊');
      setNotes(existingLog.notes         ?? '');
      setLength(existingLog.periodDates?.length ?? (existingLog.duration ?? 5));
    }
  }, [existingLog]);

  const toggleSymptom = (s) =>
    setSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ─── Log (POST) ─────────────────────────────────────────────────────────────
  const handleLog = async () => {
    setLoading(true);
    try {
      await api.post('/cycle/log', {
        startDate: date,
        duration: length,
        flowLevel,
        symptoms,
        mood,
        notes,
      });
      toast.success('Period logged! 🌸');
      onLogged();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log period');
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete single day ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await api.delete(`/cycle/delete-day/${logId}/${date}`);
      onLogged();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  return ReactDOM.createPortal(
    /* Backdrop — mobile: bottom sheet, md+: centered overlay */
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden border border-pink-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-[#FF6B8A] via-[#ff5276] to-[#e84393] p-5 sm:p-6 text-white">
          <button
            id="modal-close"
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <Droplets size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {logId ? 'Period Logged' : 'Log Period'}
              </h3>
              <p className="text-pink-100 text-xs mt-0.5 font-medium">{formattedDate}</p>
            </div>
          </div>

          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
            <svg viewBox="0 0 400 20" className="w-full" preserveAspectRatio="none" height="20">
              <path d="M0,10 Q100,20 200,10 T400,10 L400,20 L0,20 Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* ── Already-logged view ── */}
        {logId ? (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-start gap-3 bg-pink-50 rounded-2xl p-4">
              <AlertCircle size={18} className="text-[#FF6B8A] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Already logged</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  This day is part of a logged period. You can remove just this day if it was a mistake.
                </p>
              </div>
            </div>

            {/* Summary chips */}
            {existingLog && (
              <div className="flex flex-wrap gap-2">
                {existingLog.flowLevel && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-[#FF6B8A] border border-pink-100">
                    {existingLog.flowLevel} flow
                  </span>
                )}
                {existingLog.mood && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-500 border border-purple-100">
                    {existingLog.mood}
                  </span>
                )}
                {(existingLog.symptoms ?? []).map(s => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-100">
                    {s}
                  </span>
                ))}
              </div>
            )}

            <AnimatePresence>
              {confirmDelete ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 rounded-2xl p-4 space-y-3 overflow-hidden"
                >
                  <p className="text-sm font-semibold text-red-700 text-center">Remove this day?</p>
                  <p className="text-xs text-red-500 text-center">
                    Only <strong>{formattedDate}</strong> will be removed from your period log.
                  </p>
                  <div className="flex gap-2">
                    <button
                      id="modal-cancel-delete"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-3 min-h-[48px] rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      id="modal-confirm-delete"
                      onClick={handleDelete}
                      disabled={loading}
                      className="flex-1 py-3 min-h-[48px] rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                      {loading ? 'Removing…' : 'Yes, remove'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 1 }} className="flex flex-col gap-2">
                  <button
                    id="modal-remove-day"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 min-h-[48px] rounded-2xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} /> Remove this day
                  </button>
                  <button
                    id="modal-close-logged"
                    onClick={onClose}
                    className="w-full py-3 min-h-[48px] rounded-2xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ── New log form ── */
          <>
            <div className="p-4 sm:p-6 space-y-5 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto overscroll-contain">

              {/* Period length */}
              <div>
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  How long is your period?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    id="modal-length-minus"
                    onClick={() => setLength(l => Math.max(1, l - 1))}
                    className="w-10 h-10 min-h-[44px] rounded-full border-2 border-gray-200 text-gray-600 font-bold flex items-center justify-center hover:border-[#FF6B8A] hover:text-[#FF6B8A] transition-colors text-lg leading-none"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-black text-[#FF6B8A]">{length}</span>
                    <span className="text-sm text-gray-400 ml-1">days</span>
                  </div>
                  <button
                    id="modal-length-plus"
                    onClick={() => setLength(l => Math.min(10, l + 1))}
                    className="w-10 h-10 min-h-[44px] rounded-full border-2 border-gray-200 text-gray-600 font-bold flex items-center justify-center hover:border-[#FF6B8A] hover:text-[#FF6B8A] transition-colors text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B8A] to-pink-400 rounded-full transition-all duration-300"
                    style={{ width: `${(length / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flow level */}
              <div>
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Flow Level</p>
                <div className="grid grid-cols-3 gap-2">
                  {FLOW_LEVELS.map(f => (
                    <button
                      key={f.key}
                      id={`modal-flow-${f.key.toLowerCase()}`}
                      onClick={() => setFlowLevel(f.key)}
                      className={`py-3 min-h-[64px] px-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                        flowLevel === f.key
                          ? 'border-[#FF6B8A] bg-pink-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-pink-200'
                      }`}
                    >
                      <span className="text-base">{f.icon}</span>
                      <span className={`text-xs font-bold ${flowLevel === f.key ? 'text-[#FF6B8A]' : 'text-gray-500'}`}>
                        {f.key}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:block">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.map(s => (
                    <button
                      key={s}
                      id={`modal-symptom-${s.toLowerCase().replace(' ', '-')}`}
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-2 min-h-[40px] rounded-full text-xs font-semibold border-2 transition-all ${
                        symptoms.includes(s)
                          ? 'bg-[#FF6B8A] text-white border-[#FF6B8A] shadow-sm'
                          : 'bg-white text-gray-500 border-gray-100 hover:border-pink-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">How are you feeling?</p>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.emoji}
                      id={`modal-mood-${m.label.toLowerCase()}`}
                      onClick={() => setMood(m.emoji)}
                      title={m.label}
                      className={`flex-1 py-2.5 min-h-[48px] rounded-2xl text-xl border-2 transition-all ${
                        mood === m.emoji
                          ? 'border-[#FF6B8A] bg-pink-50 scale-110 shadow-sm'
                          : 'border-gray-100 hover:border-pink-200'
                      }`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Notes (optional)</p>
                <textarea
                  id="modal-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Anything else you want to remember…"
                  rows={3}
                  className="w-full border-2 border-gray-100 rounded-2xl p-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#FF6B8A] resize-none transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 flex gap-2 border-t border-gray-100">
              <button
                id="modal-cancel"
                onClick={onClose}
                className="flex-none px-4 sm:px-5 py-3 min-h-[48px] rounded-2xl border-2 border-gray-100 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                id="modal-log-submit"
                onClick={handleLog}
                disabled={loading}
                className="flex-1 py-3 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#FF6B8A] to-pink-500 text-white text-sm font-bold shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all disabled:opacity-60 active:scale-[0.98]"
              >
                {loading ? 'Saving…' : 'Log Period 🌸'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>,
    document.body
  );
};

export default PeriodLogModal;
