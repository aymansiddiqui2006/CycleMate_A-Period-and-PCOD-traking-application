import express from 'express';
import CycleData from '../models/CycleData.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// ─── Helper: parse "YYYY-MM-DD" as a local calendar date (no timezone shift) ──
function parseDateAsLocal(dateStr) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

// ─── Helper: convert any date value to "YYYY-MM-DD" string ───────────────────
// FIX: history route was calling .split('-') on a Date object from MongoDB,
//      which would produce NaN. This helper handles both strings and Date objects.
function toDateString(value) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── POST /cycle/log ──────────────────────────────────────────────────────────
router.post('/log', authMiddleware, async (req, res) => {
  try {
    // FIX: frontend now sends `duration` (was sending `length` which backend ignored,
    //      causing every log to default to 5 days regardless of user input)
    const { startDate, duration, endDate, symptoms, mood, flowLevel, notes } = req.body;

    const start = parseDateAsLocal(startDate);

    let calculatedEndDate;
    if (duration && Number(duration) > 0) {
      calculatedEndDate = parseDateAsLocal(startDate);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + (Number(duration) - 1));
    } else if (endDate) {
      calculatedEndDate = parseDateAsLocal(endDate);
    } else {
      // Default 5 days
      calculatedEndDate = parseDateAsLocal(startDate);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + 4);
    }

    // Generate periodDates array (all individual days)
    const periodDates = [];
    for (let d = new Date(start); d <= calculatedEndDate; d.setDate(d.getDate() + 1)) {
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const dd   = String(d.getDate()).padStart(2, '0');
      periodDates.push(`${yyyy}-${mm}-${dd}`);
    }

    const newLog = new CycleData({
      userId:      req.user.id,
      startDate,
      endDate:     calculatedEndDate,
      periodDates,
      symptoms:    symptoms || [],
      mood,
      flowLevel,
      notes,
    });

    const cycle = await newLog.save();
    res.json(cycle);
  } catch (err) {
    console.error('LOG ERROR:', err);
    res.status(500).json({ message: 'Server error while logging' });
  }
});

// ─── GET /cycle/history ───────────────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id }).sort({ startDate: -1 });

    // FIX: was splitting a MongoDB Date object as a string (broke periodDates rebuild).
    //      Now uses toDateString() helper that handles both Date objects and strings.
    const updatedHistory = history.map(log => {
      const plainLog = log.toObject();

      if (plainLog.periodDates?.length) return plainLog; // already correct, skip

      const startStr = toDateString(plainLog.startDate);
      const endStr   = toDateString(plainLog.endDate);

      if (!startStr || !endStr) return plainLog;

      const [startY, startM, startD] = startStr.split('-').map(Number);
      const [endY,   endM,   endD  ] = endStr.split('-').map(Number);

      const periodDates = [];
      let y = startY, m = startM, day = startD;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        periodDates.push(
          `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        );
        if (y === endY && m === endM && day === endD) break;

        day++;
        const daysInMonth = new Date(y, m, 0).getDate();
        if (day > daysInMonth) {
          day = 1;
          m++;
          if (m > 12) { m = 1; y++; }
        }
      }

      plainLog.periodDates = periodDates;
      return plainLog;
    });

    res.json(updatedHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// ─── GET /cycle/predict ───────────────────────────────────────────────────────
router.get('/predict', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id })
      .sort({ startDate: -1 })
      .limit(6);

    if (history.length < 3) {
      return res.json({
        message: 'Not enough data to predict accurately',
        predictedDate: null,
        ovulationDate: null,
      });
    }

    // Cycle lengths between consecutive period starts
    const cycleLengths = [];
    for (let i = 0; i < history.length - 1; i++) {
      const curr = new Date(history[i].startDate);
      const prev = new Date(history[i + 1].startDate);
      const diff = Math.ceil((curr - prev) / 86_400_000);
      if (diff > 0) cycleLengths.push(diff);
    }

    // Median (more robust than mean against outliers)
    const sorted = [...cycleLengths].sort((a, b) => a - b);
    const mid    = Math.floor(sorted.length / 2);
    let predictedCycle =
      sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
        : sorted[mid];

    // Cap to realistic range
    predictedCycle = Math.min(Math.max(predictedCycle, 21), 35);

    const lastPeriodDate = new Date(history[0].startDate);
    const predictedDate  = new Date(lastPeriodDate);
    predictedDate.setDate(predictedDate.getDate() + predictedCycle);

    // Ovulation ~14 days before next period
    const ovulationDate = new Date(predictedDate);
    ovulationDate.setDate(predictedDate.getDate() - 14);

    // Confidence via standard deviation
    const avg      = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((s, v) => s + (v - avg) ** 2, 0) / cycleLengths.length;
    const stdDev   = Math.sqrt(variance);
    const confidence = stdDev < 2 ? 'High' : stdDev < 5 ? 'Medium' : 'Low';

    res.json({ predictedDate, predictedCycleLength: predictedCycle, ovulationDate, confidence });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during prediction' });
  }
});

// ─── GET /cycle/pcod-risk ─────────────────────────────────────────────────────
router.get('/pcod-risk', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id }).sort({ startDate: -1 });

    if (history.length < 2) {
      return res.json({
        riskScore: 0,
        level: 'normal',
        message: 'Not enough data to assess PCOD risk',
        averageGap: 0,
      });
    }

    let cycleLengths       = [];
    let irregularCyclesCount = 0;

    for (let i = 0; i < history.length - 1; i++) {
      const curr = new Date(history[i].startDate);
      const prev = new Date(history[i + 1].startDate);
      const diff = Math.ceil((curr - prev) / 86_400_000);
      cycleLengths.push(diff);
      if (diff > 35 || diff < 21) irregularCyclesCount++;
    }

    const averageGap       = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const irregularPercent = (irregularCyclesCount / cycleLengths.length) * 100;

    // Symptom scoring (case-insensitive)
    let totalSymptomScore = 0;
    history.forEach(entry => {
      const s = (entry.symptoms || []).map(x => x.toLowerCase());
      if (s.includes('acne'))             totalSymptomScore += 2;
      if (s.includes('hair_growth'))      totalSymptomScore += 2;
      if (s.includes('weight_gain'))      totalSymptomScore += 1;
      if (s.includes('irregular_periods')) totalSymptomScore += 2;
    });
    const avgSymptomScore = totalSymptomScore / history.length;

    const baseRisk =
      averageGap > 35 ? 70 :
      averageGap >= 28 ? 40 : 10;

    let riskScore = Math.min(
      Math.round(baseRisk * 0.7 + irregularPercent * 0.2 + avgSymptomScore * 0.1),
      100
    );

    const level   = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'moderate' : 'normal';
    const message =
      level === 'high'     ? 'High risk of PCOD. Consider consulting a doctor.' :
      level === 'moderate' ? 'Moderate risk. Monitor your cycle and symptoms.' :
                             'Your cycle looks normal.';

    res.json({ riskScore, level, averageGap, message });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE /cycle/delete/:id ─────────────────────────────────────────────────
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await CycleData.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user.id, // Security: only delete own records
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Log not found or not yours' });
    }

    res.json({ message: 'Log deleted successfully' });
  } catch (err) {
    console.error('DELETE ERROR:', err);
    res.status(500).json({ message: 'Server error while deleting' });
  }
});

export default router;
