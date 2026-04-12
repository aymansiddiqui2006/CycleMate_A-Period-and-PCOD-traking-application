import React, { useState, memo } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

/* ── Custom Tooltip ─────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-xl border border-pink-100">
      <p className="text-[10px] sm:text-[11px] text-gray-400 mb-1 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl sm:text-2xl font-black text-[#FF6B8A] leading-none">
        {payload[0].value}
        <span className="text-xs sm:text-sm font-medium text-gray-400 ml-1">days</span>
      </p>
    </div>
  );
};

const axisProps = {
  tick: { fill: '#d1d5db', fontSize: 11, fontWeight: 600 },
  axisLine: false,
  tickLine: false,
};

const CHART_TYPES = [
  { key: 'bar',  label: '▊ Bar'  },
  { key: 'line', label: '∿ Line' },
  { key: 'area', label: '◈ Area' },
];

/* ── Graph ──────────────────────────────────────────────────────────────── */
const Graph = memo(({ data }) => {
  const [chartType, setChartType] = useState('bar');

  if (!data || data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-pink-50 flex items-center justify-center text-2xl sm:text-3xl">
          📊
        </div>
        <p className="text-sm font-medium text-gray-400 text-center">Log at least 2 cycles to see trends</p>
      </div>
    );
  }

  // ─── Aggregate period days by month ────────────────────────────────────
  const chartData = Object.values(
    data.reduce((acc, item) => {
      let dates;
      if (item.periodDates?.length) {
        dates = item.periodDates.map(d => new Date(d));
      } else if (item.startDate && item.endDate) {
        const start  = new Date(item.startDate);
        const end    = new Date(item.endDate);
        const length = Math.ceil((end - start + 1) / 86_400_000);
        dates = Array.from({ length }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
      } else if (item.startDate) {
        dates = [new Date(item.startDate)];
      } else {
        dates = [];
      }

      dates.forEach(d => {
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) acc[monthKey] = { month: monthKey, total: 0, count: 0 };
        acc[monthKey].total += 1;
        acc[monthKey].count += 1;
      });

      return acc;
    }, {})
  )
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(({ month, total }) => {
      const d = new Date(month + '-01');
      return {
        name: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        days: total,
      };
    });

  const sharedProps = {
    data: chartData,
    margin: { top: 10, right: 16, left: -20, bottom: 0 },
  };

  const referenceLines = (
    <>
      <ReferenceLine
        y={28}
        stroke="#a855f7"
        strokeDasharray="4 3"
        strokeWidth={1.5}
        label={{ value: '28d avg', position: 'insideTopRight', fill: '#a855f7', fontSize: 10, fontWeight: 700 }}
      />
      <ReferenceLine
        y={35}
        stroke="#f87171"
        strokeDasharray="4 3"
        strokeWidth={1.5}
        label={{ value: 'Risk >35d', position: 'insideTopRight', fill: '#f87171', fontSize: 10, fontWeight: 700 }}
      />
    </>
  );

  const commonAxisElements = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
      <XAxis dataKey="name" {...axisProps} />
      <YAxis {...axisProps} domain={[0, 'dataMax + 6']} />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,107,138,0.05)' }} />
      {referenceLines}
    </>
  );

  return (
    <div className="w-full h-full flex flex-col min-w-0">
      {/* Chart type toggle */}
      <div className="flex justify-end gap-1.5 mb-3 flex-shrink-0 flex-wrap">
        {CHART_TYPES.map(t => (
          <button
            key={t.key}
            id={`chart-type-${t.key}`}
            onClick={() => setChartType(t.key)}
            className={`px-2.5 py-1.5 min-h-[36px] rounded-xl text-[11px] font-bold tracking-wide transition-all ${
              chartType === t.key
                ? 'bg-[#FF6B8A] text-white shadow-sm shadow-pink-200'
                : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-[#FF6B8A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart — fills the given height from parent */}
      <div className="flex-1 w-full min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart {...sharedProps}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#FF6B8A" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ff477e" stopOpacity={0.75} />
                </linearGradient>
              </defs>
              {commonAxisElements}
              <Bar
                dataKey="days"
                fill="url(#barGrad)"
                radius={[8, 8, 0, 0]}
                barSize={28}
                animationBegin={0}
                animationDuration={1200}
              />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart {...sharedProps}>
              {commonAxisElements}
              <Line
                type="monotone"
                dataKey="days"
                stroke="#FF6B8A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#FF6B8A', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#FF6B8A', stroke: '#fff', strokeWidth: 2 }}
                animationBegin={0}
                animationDuration={1200}
              />
            </LineChart>
          ) : (
            <AreaChart {...sharedProps}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF6B8A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF6B8A" stopOpacity={0} />
                </linearGradient>
              </defs>
              {commonAxisElements}
              <Area
                type="monotone"
                dataKey="days"
                stroke="#FF6B8A"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={{ r: 4, fill: '#FF6B8A', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
                animationBegin={0}
                animationDuration={1200}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
});

Graph.displayName = 'Graph';
export default Graph;
