import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { X, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const SYMPTOMS = ['Cramps', 'Bloating', 'Mood Swings', 'Headache', 'Fatigue', 'Acne'];
const MOODS = ['😊', '😢', '😤', '😴', '🤒'];
const FLOW_LEVELS = ['Light', 'Medium', 'Heavy'];

const PeriodLogModal = ({ date, onClose, onLogged, logId }) => {
  const [flowLevel, setFlowLevel] = useState('Medium');
  const [symptoms, setSymptoms] = useState([]);
  const [mood, setMood] = useState('😊');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleLog = async () => {
  setLoading(true);
  try {
    if (logId) {
      // 🚫 Prevent duplicate logging
      toast("Already logged for this date ⚠️");
      return;
    }

    await api.post('/cycle/log', {
      startDate: date,
      flowLevel,
      symptoms,
      mood,
      notes
    });

    toast.success('Period logged successfully! 🌸');
    onLogged();
    onClose();

  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to log period');
  } finally {
    setLoading(false);
  }
};
  const handleDelete = async () => {
  console.log("DELETE CLICKED");
  console.log("logId:", logId);

  try {
    const res = await api.delete(`/cycle/delete/${logId}`);
    console.log("SUCCESS:", res.data);

    toast.success("Log deleted 🗑");
    onLogged();
    onClose();

  } catch (err) {
    console.log("FULL ERROR:", err);
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);

    toast.error("Delete failed ❌");
  }
};
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ✅ createPortal renders directly to document.body, completely
  // escaping any Framer Motion transform containers on the Dashboard
  return ReactDOM.createPortal(
  <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-pink-100 overflow-hidden"
    >

      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF6B8A] to-pink-400 p-6 text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 rounded-full p-1.5">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <Droplets size={28} />
          <div>
            <h3 className="text-xl font-bold">Log Period</h3>
            <p className="text-pink-100 text-sm mt-0.5">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* FORM (only if no log exists) */}
      {!logId && (
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Flow */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-3">Flow Level</p>
            <div className="flex gap-3">
              {FLOW_LEVELS.map(f => (
                <button key={f} onClick={() => setFlowLevel(f)}
                  className={`flex-1 py-2.5 rounded-xl border-2 ${
                    flowLevel === f ? 'bg-[#FF6B8A] text-white' : 'bg-white text-gray-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-3">Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1 rounded-full border ${
                    symptoms.includes(s) ? 'bg-[#FF6B8A] text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-3">Mood</p>
            <div className="flex gap-3">
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes..."
            className="w-full border rounded p-2"
          />

        </div>
      )}

      {/* ACTIONS */}
      {logId ? (
        <div className="flex flex-col gap-3 p-6 text-center">
          <p>Already logged 📅</p>

          <button onClick={handleDelete} className="bg-red-500 text-white py-2 rounded">
            Delete
          </button>

          <button onClick={onClose} className="border py-2 rounded">
            Close
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-6">
          <button onClick={onClose} className="border py-2 rounded">
            Cancel
          </button>

          <button onClick={handleLog} disabled={loading} className="bg-pink-500 text-white py-2 rounded">
            {loading ? 'Saving...' : 'Log Period 🌸'}
          </button>
        </div>
      )}

    </motion.div>
  </div>,
  document.body
);
};
export default PeriodLogModal;