import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// ─── Static data ────────────────────────────────────────────────────────────
const SYMPTOMS = [
  { id: 'cramps',       label: '🤕 Cramps' },
  { id: 'bloating',     label: '🫧 Bloating' },
  { id: 'mood_swings',  label: '😢 Mood Swings' },
  { id: 'headaches',    label: '🤯 Headaches' },
  { id: 'fatigue',      label: '😴 Fatigue' },
  { id: 'acne',         label: '🔴 Acne' },
  { id: 'backpain',     label: '🦴 Back Pain' },
  { id: 'nausea',       label: '🤢 Nausea' },
];

const HEALTH_GOALS = [
  { id: 'track_cycle',    label: '📅 Track My Cycle' },
  { id: 'reduce_cramps',  label: '💊 Reduce Cramps' },
  { id: 'get_pregnant',   label: '🤱 Get Pregnant' },
  { id: 'pcod_manage',    label: '💜 Manage PCOD/PCOS' },
  { id: 'mood_improve',   label: '😊 Improve Mood' },
  { id: 'fitness',        label: '🏃 Sync Fitness' },
  { id: 'nutrition',      label: '🥗 Better Nutrition' },
  { id: 'sleep',          label: '🌙 Improve Sleep' },
];

const STEPS = [
  { title: 'Last Period Date',     subtitle: 'When did your last period start?' },
  { title: 'Average Cycle Length', subtitle: 'How many days is your usual cycle?' },
  { title: 'Period Duration',      subtitle: 'How long does your period typically last?' },
  { title: 'Symptoms',             subtitle: 'Which symptoms do you usually experience?' },
  { title: 'Health Goals',         subtitle: 'What would you like to achieve?' },
];

// ─── Slide variants ──────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center:       { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ─── Chip (multi-select) ─────────────────────────────────────────────────────
const Chip = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer select-none
      ${selected
        ? 'bg-gradient-to-r from-[#FF6B8A] to-purple-500 text-white border-transparent shadow-md scale-[1.04]'
        : 'bg-white/60 text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
      }`}
  >
    {label}
  </button>
);

// ─── Main component ──────────────────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [dir,  setDir]        = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    lastPeriodDate: '',
    cycleLength:    28,
    periodDuration: 5,
    symptoms:       [],
    healthGoals:    [],
  });

  const toggleArray = (field, id) =>
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((v) => v !== id)
        : [...prev[field], id],
    }));

  const goNext = () => { setDir(1);  setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const goPrev = () => { setDir(-1); setStep((s) => Math.max(s - 1, 0)); };

  const canProceed = () => {
    if (step === 0) return !!formData.lastPeriodDate;
    if (step === 1) return formData.cycleLength >= 15 && formData.cycleLength <= 60;
    if (step === 2) return formData.periodDuration >= 1 && formData.periodDuration <= 15;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/user/onboarding', formData);
      const cached = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...cached, isOnboarded: true }));
      toast.success("You're all set! Welcome to CycleSakhi 🌸");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center gap-4 w-full">
            <input
              id="onb-last-period-date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.lastPeriodDate}
              onChange={(e) => setFormData({ ...formData, lastPeriodDate: e.target.value })}
              className="onb-input w-full max-w-xs text-center text-lg"
            />
          </div>
        );

      case 1:
        return (
          <SliderStep
            value={formData.cycleLength}
            min={15} max={60} unit="days"
            onChange={(v) => setFormData({ ...formData, cycleLength: v })}
            colorClass="from-pink-400 to-rose-500"
          />
        );

      case 2:
        return (
          <SliderStep
            value={formData.periodDuration}
            min={1} max={15} unit="days"
            onChange={(v) => setFormData({ ...formData, periodDuration: v })}
            colorClass="from-purple-400 to-pink-500"
          />
        );

      case 3:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-md">
            {SYMPTOMS.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                selected={formData.symptoms.includes(s.id)}
                onClick={() => toggleArray('symptoms', s.id)}
              />
            ))}
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-md">
            {HEALTH_GOALS.map((g) => (
              <Chip
                key={g.id}
                label={g.label}
                selected={formData.healthGoals.includes(g.id)}
                onClick={() => toggleArray('healthGoals', g.id)}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden px-4 py-8">
      {/* Background orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tr from-pink-400 to-[#FF6B8A] rounded-full mix-blend-multiply filter blur-[80px] opacity-50 animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tl from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-float-delayed pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-5xl mb-4 block">🌸</span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 mb-1">Let's personalise your experience</h1>
            <p className="text-gray-500 text-sm">Step {step + 1} of {STEPS.length} — {STEPS[step].subtitle}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-pink-100 rounded-full h-2 mb-6 overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-[#FF6B8A] to-purple-500"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300
                  ${i === step ? 'w-6 bg-[#FF6B8A]' : i < step ? 'w-2 bg-purple-400' : 'w-2 bg-gray-200'}`}
              />
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-6 min-h-[180px] justify-center"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-700">{STEPS[step].title}</h2>
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-3">
            <button
              id="onb-back"
              type="button"
              onClick={goPrev}
              disabled={step === 0}
              className="flex items-center gap-1 px-5 py-3 min-h-[48px] rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                id="onb-continue"
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                className="flex items-center gap-1 px-8 py-3 min-h-[48px] rounded-xl bg-gradient-to-r from-[#FF6B8A] to-purple-500 text-white font-semibold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all w-full sm:w-auto justify-center"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="onb-finish"
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 min-h-[48px] rounded-xl bg-gradient-to-r from-[#FF6B8A] to-purple-500 text-white font-semibold shadow-md hover:opacity-90 disabled:opacity-60 transition-all w-full sm:w-auto justify-center"
              >
                {loading
                  ? <Loader2 className="animate-spin w-5 h-5" />
                  : <><CheckCircle2 className="w-5 h-5" /> Finish &amp; Go to Dashboard</>
                }
              </button>
            )}
          </div>

          {/* Skip link */}
          <p className="text-center mt-5 text-sm text-gray-400">
            You can update these anytime in your profile.{' '}
            <button
              id="onb-skip"
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-pink-400 hover:underline font-medium"
            >
              Skip for now
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Reusable slider + number input component ─────────────────────────────────
const SliderStep = ({ value, min, max, unit, onChange, colorClass }) => (
  <div className="flex flex-col items-center gap-4 w-full max-w-xs">
    <div className={`text-4xl sm:text-5xl font-extrabold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
      {value} <span className="text-xl sm:text-2xl font-semibold">{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 accent-pink-500 cursor-pointer"
    />
    <div className="flex w-full justify-between text-xs text-gray-400">
      <span>{min} {unit}</span>
      <span>{max} {unit}</span>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 min-h-[44px] rounded-full border border-gray-200 text-gray-500 hover:bg-pink-50 font-bold flex items-center justify-center transition"
      >−</button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        className="w-16 text-center onb-input text-base font-semibold"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 min-h-[44px] rounded-full border border-gray-200 text-gray-500 hover:bg-pink-50 font-bold flex items-center justify-center transition"
      >+</button>
    </div>
  </div>
);

export default Onboarding;
