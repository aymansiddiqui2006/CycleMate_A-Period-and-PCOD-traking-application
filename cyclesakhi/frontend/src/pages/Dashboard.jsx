import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, AlertCircle, HeartPulse, Clock, Flame } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useCycle } from '../context/CycleContext';
import { useLanguage } from '../context/LanguageContext';
import CalendarComponent from '../components/Calendar';
import Graph from '../components/Graph';
import Onboarding from '../components/Onboarding';
import NotificationCenter from '../components/NotificationCenter';
import { DashboardSkeleton } from '../components/Skeleton';

/* ── Animated counter ─────────────────────────────── */
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const increment = value / 40;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(Math.round(value)); clearInterval(timer); }
      else setCount(Math.round(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count || '--'}</span>;
};

/* ── Real-time clock ──────────────────────────────── */
const useClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

/* ── Streak calculator ────────────────────────────── */
const calcStreak = (data) => {
  if (!data?.length) return 0;
  let s = 1;
  for (let i = 0; i < data.length - 1; i++) {
    const diff = Math.abs(new Date(data[i].startDate) - new Date(data[i + 1].startDate)) / (1000 * 60 * 60 * 24);
    if (diff <= 35) s++; else break;
  }
  return s;
};

const Dashboard = () => {
  const { t } = useLanguage();
  const { history, riskData, loading, refreshData } = useCycle();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const time = useClock();
  const streak = calcStreak(history);

  useEffect(() => {
    if (!localStorage.getItem('onboarded')) setShowOnboarding(true);
  }, []);

  const downloadReport = () => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(255, 107, 138);
    doc.rect(0, 0, W, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CycleSakhi Health Report', 20, 28);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Patient: ${user.name || 'N/A'}  |  Age: ${user.age || 'N/A'}  |  ${new Date().toLocaleDateString()}`, 20, 58);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text('PCOD Risk Assessment', 20, 76);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.text(`Risk Level: ${riskData.level?.toUpperCase()}`, 20, 88);
    doc.text(`Risk Score: ${Math.round(riskData.riskScore)}%`, 20, 100);
    doc.text(`Average Cycle Length: ${Math.round(riskData.averageGap) || 'N/A'} days`, 20, 112);
    doc.save('CycleSakhi_Report.pdf');
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVars = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, type: 'spring', bounce: 0.3 } },
  };

  const riskColor = riskData.level === 'high' ? '#ef4444' : riskData.level === 'moderate' ? '#eab308' : '#FF6B8A';

  const formattedTime =
    time.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }) +
    ' • ' + time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="relative min-h-full p-6 md:p-8 w-full overflow-x-hidden">
      {/* BG orbs */}
      <div className="fixed top-[-5%] right-[-5%] w-96 h-96 bg-[#FF6B8A]/15 rounded-full blur-[100px] pointer-events-none animate-float" />
      <div className="fixed bottom-[-5%] left-0 w-[500px] h-[500px] bg-purple-300/15 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />

      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={() => { setShowOnboarding(false); refreshData(); }} />
        )}
      </AnimatePresence>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">

        {/* ── Header ── */}
        <motion.div variants={itemVars} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              {t('welcome')}, <span className="text-[#FF6B8A]">{user.name?.split(' ')[0] || '🌸'}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm font-medium">
              <Clock size={14} />
              <span>{formattedTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <button
              onClick={downloadReport}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#FF6B8A] to-pink-400 text-white font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:shadow-pink-200 transition-all text-sm active:scale-95"
            >
              <Download size={16} /> {t('download_pdf')}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── AI Alert card ── */}
          <motion.div
            variants={itemVars}
            whileHover={{ y: -4 }}
            className="lg:col-span-4 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-7 shadow-[0_4px_20px_rgba(255,107,138,0.1)] flex flex-col justify-between relative overflow-hidden"
          >
            {/* Glow side bar */}
            <div
              className="absolute left-0 top-0 w-1.5 h-full rounded-r-full"
              style={{ background: riskColor, boxShadow: `0 0 14px ${riskColor}` }}
            />
            {/* Pulsing badge */}
            <div className="absolute top-5 right-5">
              {riskData.level === 'high'
                ? <span className="relative flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" /></span>
                : <HeartPulse className="text-[#FF6B8A]/40 animate-pulse" size={22} />}
            </div>

            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${riskData.level === 'high' ? 'bg-red-50' : 'bg-pink-50'}`}>
                <AlertCircle style={{ color: riskColor }} size={26} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('ai_alert')}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {riskData.level === 'high' ? t('high_risk_msg') : riskData.level === 'moderate' ? t('moderate_risk_msg') : t('normal_msg')}
              </p>
            </div>

            {/* PCOD risk animated bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>PCOD Risk</span>
                <span className="font-bold text-gray-700"><AnimatedCounter value={riskData.riskScore} />%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                  style={{ width: `${riskData.riskScore}%`, background: riskColor, boxShadow: `0 0 8px ${riskColor}80` }}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Calendar ── */}
          <motion.div
            variants={itemVars}
            whileHover={{ y: -4 }}
            className="lg:col-span-8 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(255,107,138,0.08)]"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('tracking_calendar')}</h3>
            <CalendarComponent />
          </motion.div>

          {/* ── Stats + Streak ── */}
          <motion.div
            variants={itemVars}
            whileHover={{ y: -4 }}
            className="lg:col-span-4 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-7 shadow-[0_4px_20px_rgba(255,107,138,0.08)] flex flex-col gap-5"
          >
            {history.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-6">
                <div className="text-6xl animate-bounce">🌸</div>
                <h3 className="text-lg font-bold text-gray-700">{t('start_journey')}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Log your first period on the Calendar above to see your health stats here.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('cycle_stats')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FF6B8A] to-purple-500">
                      <AnimatedCounter value={Math.round(riskData.averageGap)} />
                    </span>
                    <span className="text-base text-gray-400 font-medium">{t('days_avg')}</span>
                  </div>
                </div>

                {/* Streak */}
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-4 border border-orange-100 flex items-center gap-3">
                  <span className={`text-3xl ${streak > 7 ? 'animate-bounce' : ''}`}>
                    {streak > 7 ? '🔥' : streak > 3 ? '⭐' : '🌱'}
                  </span>
                  <div>
                    <p className="font-bold text-gray-800">{streak} {t('streak_msg')}</p>
                    <p className="text-xs text-gray-500">
                      {streak > 7 ? 'Amazing dedication! 💪' : streak > 3 ? 'Great consistency! 🌸' : 'Keep logging every cycle!'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* ── Graph ── */}
          <motion.div
            variants={itemVars}
            whileHover={{ y: -4 }}
            className="lg:col-span-8 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(255,107,138,0.08)] flex flex-col"
            style={{ minHeight: 320 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('trends')}</h3>
            <div className="flex-1 w-full">
              {history.length < 2 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                  <div className="text-4xl">📊</div>
                  <p className="text-sm text-center">Log at least 2 cycles on the Calendar to see trends here.</p>
                </div>
              ) : (
                <Graph data={history} />
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;