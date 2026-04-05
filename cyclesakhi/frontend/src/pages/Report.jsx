import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, TrendingUp, Activity } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useCycle } from '../context/CycleContext';
import { useLanguage } from '../context/LanguageContext';
import Graph from '../components/Graph';

/* ── Animated counter (same pattern as Dashboard) ── */
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const inc = value / 40;
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(Math.round(value)); clearInterval(timer); }
      else setCount(Math.round(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count || '--'}</span>;
};

const Report = () => {
  const { t } = useLanguage();
  // ✅ All data from shared CycleContext — no duplicate API calls
  const { history, riskData, loading } = useCycle();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const riskColor = riskData.level === 'high'
    ? '#ef4444' : riskData.level === 'moderate' ? '#eab308' : '#FF6B8A';

  const downloadPDF = () => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // ── Header band
    doc.setFillColor(255, 107, 138);
    doc.rect(0, 0, W, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('CycleSakhi', 20, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text("Women's Health Report", 20, 33);
    doc.text(
      new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      W - 20, 33, { align: 'right' }
    );

    // ── Patient info
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text(`Patient Name: ${user.name || 'N/A'}`, 20, 60);
    doc.text(`Age: ${user.age || 'N/A'} years`, 20, 70);
    doc.text(`Email: ${user.email || 'N/A'}`, 20, 80);

    // ── Divider
    doc.setDrawColor(255, 107, 138);
    doc.setLineWidth(0.5);
    doc.line(20, 90, W - 20, 90);

    // ── Risk assessment
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(40, 40, 40);
    doc.text('PCOD Risk Assessment', 20, 104);

    const rgb = riskData.level === 'high' ? [220, 38, 38] : riskData.level === 'moderate' ? [234, 179, 8] : [34, 197, 94];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...rgb);
    doc.text(`Risk Level: ${riskData.level?.toUpperCase()}  (${Math.round(riskData.riskScore)}%)`, 20, 116);
    doc.setTextColor(60, 60, 60);
    doc.text(`Average Cycle Length: ${Math.round(riskData.averageGap) || 'N/A'} days`, 20, 128);
    doc.text(`Total Cycles Logged: ${history.length}`, 20, 140);

    // ── Cycle history table (last 5)
    doc.line(20, 150, W - 20, 150);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Cycle History (Last 5)', 20, 164);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const last5 = history.slice(0, 5);
    last5.forEach((c, i) => {
      doc.setTextColor(80, 80, 80);
      doc.text(
        `${i + 1}. Start: ${new Date(c.startDate).toLocaleDateString()}  |  Flow: ${c.flowLevel || 'N/A'}  |  Mood: ${c.mood || 'N/A'}`,
        20, 176 + i * 12
      );
    });

    // ── Recommendations
    const recY = 176 + last5.length * 12 + 14;
    doc.line(20, recY, W - 20, recY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Doctor Recommendations', 20, recY + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const rec =
      riskData.level === 'high'
        ? 'Your data strongly suggests PCOD-related symptoms. Schedule a gynecologist appointment immediately. Consider hormonal testing, maintain a low-sugar diet, and engage in 30 min daily exercise.'
        : riskData.level === 'moderate'
        ? 'Some cycle irregularities detected. Monitor for 2 more cycles. Reduce processed food, manage stress, ensure 8 hours of sleep. Consult a doctor if irregularity persists.'
        : 'Your menstrual cycle is within healthy parameters. Maintain your current routine — balanced diet, regular exercise, and adequate hydration go a long way.';
    const lines = doc.splitTextToSize(rec, W - 40);
    doc.setTextColor(60, 60, 60);
    doc.text(lines, 20, recY + 26);

    // ── Footer
    doc.setTextColor(170, 170, 170);
    doc.setFontSize(9);
    doc.text('AI-generated report — not a medical diagnosis. CycleSakhi © 2025 🌸', 20, H - 12);

    doc.save(`CycleSakhi_Report_${(user.name || 'user').replace(' ', '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring' } },
  };

  return (
    <div className="p-6 md:p-8 min-h-full relative">
      {/* BG orb */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-purple-300/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-start justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-1">{t('report_title')}</h1>
            <p className="text-gray-500 text-sm">Comprehensive analysis and PCOD risk assessment.</p>
          </div>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B8A] to-pink-400 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:shadow-pink-200 transition-all active:scale-95"
          >
            <Download size={18} /> {t('export_pdf')}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* ── Risk gauge ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-4 bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-[0_4px_20px_rgba(255,107,138,0.08)] flex flex-col items-center gap-5"
          >
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest self-start">PCOD Risk Score</h3>

            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 drop-shadow-md">
                <circle cx="88" cy="88" r="76" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                <circle
                  cx="88" cy="88" r="76" fill="none"
                  stroke={riskColor} strokeWidth="14"
                  strokeDasharray="477.5"
                  strokeDashoffset={477.5 - (477.5 * riskData.riskScore) / 100}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1.5s ease-out',
                    filter: `drop-shadow(0 0 8px ${riskColor}60)`,
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-black" style={{ color: riskColor }}>
                  <AnimatedCounter value={Math.round(riskData.riskScore)} />%
                </span>
                <span className="text-sm font-bold uppercase mt-1" style={{ color: riskColor }}>
                  {riskData.level}
                </span>
              </div>
            </div>

            {/* Risk scale legend */}
            <div className="w-full space-y-2.5">
              {[
                { label: 'Normal',    range: '21–28 days', color: '#FF6B8A' },
                { label: 'Moderate',  range: '28–35 days', color: '#eab308' },
                { label: 'High Risk', range: '>35 days',   color: '#ef4444' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-xs">{item.range}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Analysis summary ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-8 bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-[0_4px_20px_rgba(255,107,138,0.08)] flex flex-col gap-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                <FileText className="text-[#FF6B8A]" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{t('ai_alert')}</h3>
            </div>

            {/* Stat chips */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Avg Cycle Length',  value: `${Math.round(riskData.averageGap) || '--'} days`, icon: TrendingUp },
                { label: 'Cycles Logged',     value: `${history.length}`,                               icon: Activity },
              ].map(stat => (
                <div key={stat.label} className="bg-gradient-to-br from-pink-50 to-purple-50/50 rounded-2xl p-5 border border-pink-100">
                  <stat.icon className="text-[#FF6B8A] mb-2" size={20} />
                  <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-br from-pink-50/80 to-purple-50/60 rounded-2xl p-5 border border-pink-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Our Recommendation</p>
              <p className="text-gray-700 leading-relaxed text-sm">
                {riskData.level === 'high'
                  ? 'Your tracking data shows cycles exceeding 35 days — a primary PCOD indicator. We strongly recommend visiting a gynecologist via our Doctors page as soon as possible.'
                  : riskData.level === 'moderate'
                  ? 'Cycle fluctuations between 28–35 days detected. Reduce sugar intake, add light exercise, and monitor for 2 more cycles. See a doctor if irregularity continues.'
                  : 'Your cycles fall within the healthy 21–28 day range. Great job tracking consistently! Maintain your balanced routine and stay hydrated.'}
              </p>
            </div>
          </motion.div>

          {/* ── Yearly Chart ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-12 bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(255,107,138,0.08)]"
            style={{ minHeight: 360 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6">Yearly Cycle Overview</h3>
            <div style={{ height: 280 }}>
              <Graph data={history} />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Report;