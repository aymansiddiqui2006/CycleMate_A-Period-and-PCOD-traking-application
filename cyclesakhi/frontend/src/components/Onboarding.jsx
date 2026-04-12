import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const SYMPTOMS = ['Cramps', 'Bloating', 'Mood Swings', 'Headache', 'Fatigue', 'Acne'];
const CYCLE_DEFAULTS = { lastPeriod: '', cycleLength: 28, symptoms: [] };

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(CYCLE_DEFAULTS);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s) => {
    setData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s]
    }));
  };

  const handleDone = async () => {
    setLoading(true);
    try {
      if (data.lastPeriod) {
        await api.post('/cycle/log', {
          startDate: data.lastPeriod,
          symptoms: data.symptoms,
        });
      }
      localStorage.setItem('onboarded', 'true');
      toast.success('You\'re all set! 🌸');
      onComplete();
    } catch (err) {
      toast.error('Failed to save. Skipping...');
      localStorage.setItem('onboarded', 'true');
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    localStorage.setItem('onboarded', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-pink-100 relative"
      >
        <button onClick={skip} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={22} />
        </button>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-[#FF6B8A]' : 'bg-gray-200'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">When was your last period? 🌸</h2>
              <p className="text-gray-500 mb-6">This helps us predict your next cycle accurately.</p>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={data.lastPeriod}
                onChange={e => setData(p => ({ ...p, lastPeriod: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-[#FF6B8A] rounded-2xl px-4 py-4 outline-none transition-colors text-gray-800 text-lg"
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">How long is your average cycle?</h2>
              <p className="text-gray-500 mb-6">Drag to set the number of days in your typical cycle.</p>
              <div className="text-center mb-4">
                <span className="text-6xl font-black text-[#FF6B8A]">{data.cycleLength}</span>
                <span className="text-xl text-gray-400 ml-2">days</span>
              </div>
              <input
                type="range" min={21} max={45} step={1}
                value={data.cycleLength}
                onChange={e => setData(p => ({ ...p, cycleLength: Number(e.target.value) }))}
                className="w-full accent-[#FF6B8A]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>21 days</span><span>45 days</span>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Any usual symptoms? 💭</h2>
              <p className="text-gray-500 mb-6">Select all that typically apply to you.</p>
              <div className="flex flex-wrap gap-3">
                {SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-4 py-2 rounded-full font-medium border-2 transition-all text-sm ${
                      data.symptoms.includes(s)
                        ? 'bg-[#FF6B8A] text-white border-[#FF6B8A] shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          <button onClick={skip} className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-500 font-medium hover:border-pink-300 transition-colors">
            Skip
          </button>
          <button
            onClick={step < 3 ? () => setStep(s => s + 1) : handleDone}
            disabled={loading}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#FF6B8A] to-pink-400 text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {step < 3 ? <>Next <ChevronRight size={18} /></> : loading ? 'Saving...' : 'Get Started 🌸'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
