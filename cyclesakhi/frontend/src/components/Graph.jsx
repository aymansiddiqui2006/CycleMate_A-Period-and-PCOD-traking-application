import React, { useState, memo } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

/* ── Custom Tooltip ─────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-2xl shadow-lg border border-pink-100">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-black text-[#FF6B8A]">
          {payload[0].value} <span className="text-sm font-medium text-gray-400">days</span>
        </p>
      </div>
    );
  }
  return null;
};

const axisProps = {
  tick: { fill: '#9ca3af', fontSize: 12 },
  axisLine: false,
  tickLine: false,
};

/* ── Graph ──────────────────────────────────────── */
const Graph = memo(({ data }) => {
  const [chartType, setChartType] = useState('bar');

  if (!data || data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
        <div className="text-4xl">📊</div>
        <p className="text-sm">Log at least 2 cycles to see trends</p>
      </div>
    );
  }

  // Build chart data from history
  const chartData = [];
  for (let i = data.length - 1; i > 0; i--) {
    const curr = new Date(data[i - 1].startDate);
    const prev = new Date(data[i].startDate);
    const days = Math.ceil(Math.abs(curr - prev) / (1000 * 60 * 60 * 24));
    chartData.push({
      name: prev.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      days,
    });
  }

  const sharedProps = {
    data: chartData,
    margin: { top: 10, right: 10, left: -10, bottom: 5 },
  };

  const referenceLines = (
    <>
      <ReferenceLine
        y={28}
        stroke="#a855f7"
        strokeDasharray="4 4"
        label={{ value: 'Normal', position: 'insideTopRight', fill: '#a855f7', fontSize: 11, fontWeight: 600 }}
      />
      <ReferenceLine
        y={35}
        stroke="#ef4444"
        strokeDasharray="4 4"
        label={{ value: 'Risk Zone', position: 'insideTopRight', fill: '#ef4444', fontSize: 11, fontWeight: 600 }}
      />
    </>
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toggle buttons */}
      <div className="flex justify-end gap-1.5 mb-4 flex-shrink-0">
        {[
          { key: 'bar',  label: 'Bar' },
          { key: 'line', label: 'Line' },
          { key: 'area', label: 'Area' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setChartType(t.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartType === t.key
                ? 'bg-[#FF6B8A] text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-[#FF6B8A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart {...sharedProps}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#FF6B8A" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ff477e" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 'dataMax + 5']} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,107,138,0.05)' }} />
              {referenceLines}
              <Bar dataKey="days" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={38} animationBegin={0} animationDuration={1500} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart {...sharedProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 'dataMax + 5']} />
              <Tooltip content={<CustomTooltip />} />
              {referenceLines}
              <Line
                type="monotone"
                dataKey="days"
                stroke="#FF6B8A"
                strokeWidth={3}
                dot={{ r: 5, fill: '#FF6B8A', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: '#FF6B8A', stroke: '#fff', strokeWidth: 2 }}
                animationBegin={0}
                animationDuration={1500}
              />
            </LineChart>
          ) : (
            <AreaChart {...sharedProps}>
              <defs>
                <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF6B8A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B8A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 'dataMax + 5']} />
              <Tooltip content={<CustomTooltip />} />
              {referenceLines}
              <Area
                type="monotone"
                dataKey="days"
                stroke="#FF6B8A"
                strokeWidth={3}
                fill="url(#pinkGradient)"
                dot={{ r: 5, fill: '#FF6B8A', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                animationBegin={0}
                animationDuration={1500}
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
