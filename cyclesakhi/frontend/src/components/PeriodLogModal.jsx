import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { X, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const SYMPTOMS = ['Cramps', 'Bloating', 'Mood Swings', 'Headache', 'Fatigue', 'Acne'];
const MOODS = ['😊', '😢', '😤', '😴', '🤒'];
const FLOW_LEVELS = ['Light', 'Medium', 'Heavy'];

const PeriodLogModal = ({ date, onClose, onLogged }) => {
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
      await api.post('/cycle/log', { startDate: date, flowLevel, symptoms, mood, notes });
      toast.success('Period logged successfully! 🌸');
      onLogged();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log period');
    } finally {
      setLoading(false);
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
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 rounded-full p-1.5 hover:bg-white/30 transition-colors">
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

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Flow Level */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Flow Level</p>
            <div className="flex gap-3">
              {FLOW_LEVELS.map(f => (
                <button key={f} onClick={() => setFlowLevel(f)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                    flowLevel === f ? 'bg-[#FF6B8A] text-white border-[#FF6B8A] shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                    symptoms.includes(s) ? 'bg-[#FF6B8A] text-white border-[#FF6B8A]' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">How are you feeling?</p>
            <div className="flex gap-3">
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(m)}
                  className={`w-12 h-12 rounded-2xl text-2xl transition-all ${
                    mood === m ? 'bg-pink-100 ring-2 ring-[#FF6B8A] scale-110 shadow-md' : 'bg-gray-50 hover:bg-pink-50 hover:scale-105'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Notes (optional)</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-[#FF6B8A] transition-colors text-gray-700 resize-none text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-500 font-medium hover:border-pink-300 transition-colors">
            Cancel
          </button>
          <button onClick={handleLog} disabled={loading}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#FF6B8A] to-pink-400 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 active:scale-95"
          >
            {loading ? 'Saving...' : 'Log Period 🌸'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default PeriodLogModal;
