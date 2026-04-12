import express from 'express';
import CycleData from '../models/CycleData.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// ── Helper: parse "YYYY-MM-DD" as a local calendar date (no timezone shift) ──
function parseDateAsLocal(dateStr) {
  const cleaned = String(dateStr).trim().slice(0, 10); // guard against ISO strings like "2024-05-01T00:00:00.000Z"
  const [year, month, day] = cleaned.split('-').map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
}

// ── Helper: convert any date value (Date object or ISO string) → "YYYY-MM-DD" ─
function toDateString(value) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ── Helper: generate an array of "YYYY-MM-DD" strings between two local dates ─
function buildPeriodDates(startStr, endDate) {
  const dates = [];
  const limit = new Date(endDate); // copy so we don't mutate caller's value
  for (
    let d = parseDateAsLocal(startStr);
    d <= limit;
    d.setDate(d.getDate() + 1)
  ) {
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

// ── POST /cycle/log ──────────────────────────────────────────────────────────
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { startDate, duration, endDate, symptoms, mood, flowLevel, notes } = req.body;

    const start = parseDateAsLocal(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid startDate' });
    }

    let calculatedEnd;
    if (duration && Number(duration) > 0) {
      calculatedEnd = parseDateAsLocal(startDate);
      calculatedEnd.setDate(calculatedEnd.getDate() + (Number(duration) - 1));
    } else if (endDate) {
      calculatedEnd = parseDateAsLocal(endDate);
    } else {
      calculatedEnd = parseDateAsLocal(startDate);
      calculatedEnd.setDate(calculatedEnd.getDate() + 4); // default 5 days
    }

    const periodDates = buildPeriodDates(startDate, calculatedEnd);

    // ── Duplicate guard ──────────────────────────────────────────────────────
    const existing = await CycleData.findOne({
      userId:      req.user.id,
      periodDates: { $in: periodDates },
    });

    if (existing) {
      const merged = [
        ...new Set([...existing.periodDates.map(toDateString), ...periodDates])
      ].filter(Boolean);
      merged.sort();
      existing.periodDates = merged;
      existing.startDate   = merged[0];
      existing.endDate     = parseDateAsLocal(merged[merged.length - 1]);
      if (flowLevel)        existing.flowLevel = flowLevel;
      if (symptoms?.length) existing.symptoms  = symptoms;
      if (mood)             existing.mood      = mood;
      if (notes)            existing.notes     = notes;
      existing.markModified('periodDates');
      const saved = await existing.save();
      return res.json(saved);
    }

    const newLog = new CycleData({
      userId: req.user.id,
      startDate,
      endDate: calculatedEnd,
      periodDates,
      symptoms: symptoms || [],
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

// ── GET /cycle/history ────────────────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id }).sort({ startDate: -1 });

    const updatedHistory = history.map(log => {
      const plain = log.toObject();

      if (plain.periodDates?.length) {
        plain.periodDates = plain.periodDates.map(toDateString).filter(Boolean);
        return plain;
      }

      const startStr = toDateString(plain.startDate);
      const endStr   = toDateString(plain.endDate);
      if (!startStr || !endStr) return plain;

      plain.periodDates = buildPeriodDates(startStr, parseDateAsLocal(endStr));
      return plain;
    });

    res.json(updatedHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// ── GET /cycle/predict ────────────────────────────────────────────────────────
router.get('/predict', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id })
      .sort({ startDate: -1 })
      .limit(6);

    if (history.length < 3) {
      // Fall back to the user's onboarding cycle length if available
      const user = await User.findById(req.user.id).select('cycleLength lastPeriodDate');
      const fallbackLength = user?.cycleLength || 28;
      const baseDate = user?.lastPeriodDate
        ? new Date(user.lastPeriodDate)
        : history.length >= 1
          ? parseDateAsLocal(toDateString(history[0].startDate))
          : null;

      if (!baseDate || isNaN(baseDate.getTime())) {
        return res.json({
          message:       'Not enough data to predict accurately',
          predictedDate: null,
          ovulationDate: null,
        });
      }

      const predictedDate = new Date(baseDate);
      predictedDate.setDate(baseDate.getDate() + fallbackLength);
      const ovulationDate = new Date(predictedDate);
      ovulationDate.setDate(predictedDate.getDate() - 14);

      return res.json({
        predictedDate,
        predictedCycleLength: fallbackLength,
        ovulationDate,
        confidence: 'Low',
        message: 'Based on your onboarding settings',
      });
    }

    const cycleLengths = [];
    for (let i = 0; i < history.length - 1; i++) {
      const curr = parseDateAsLocal(toDateString(history[i].startDate));
      const prev = parseDateAsLocal(toDateString(history[i + 1].startDate));
      const diff = Math.ceil((curr - prev) / 86_400_000);
      if (diff >= 21 && diff <= 40) cycleLengths.push(diff);
    }

    if (cycleLengths.length === 0) {
      return res.json({
        message:       'Cycle data is irregular or insufficient',
        predictedDate: null,
        ovulationDate: null,
      });
    }

    const sorted = [...cycleLengths].sort((a, b) => a - b);
    const mid    = Math.floor(sorted.length / 2);
    const predictedCycle =
      sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
        : sorted[mid];

    const lastPeriodStart = parseDateAsLocal(toDateString(history[0].startDate));
    const predictedDate   = new Date(lastPeriodStart);
    predictedDate.setDate(lastPeriodStart.getDate() + predictedCycle);

    const ovulationDate = new Date(predictedDate);
    ovulationDate.setDate(predictedDate.getDate() - 14);

    const avg        = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance   = cycleLengths.reduce((s, v) => s + (v - avg) ** 2, 0) / cycleLengths.length;
    const stdDev     = Math.sqrt(variance);
    const confidence = stdDev < 2 ? 'High' : stdDev < 5 ? 'Medium' : 'Low';

    res.json({ predictedDate, predictedCycleLength: predictedCycle, ovulationDate, confidence });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during prediction' });
  }
});

// ── GET /cycle/pcod-risk ──────────────────────────────────────────────────────
router.get('/pcod-risk', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id }).sort({ startDate: -1 });

    if (history.length < 2) {
      return res.json({
        riskScore:  0,
        level:      'normal',
        message:    'Not enough data to assess PCOD risk',
        averageGap: 0,
      });
    }

    const cycleLengths         = [];
    let   irregularCyclesCount = 0;

    for (let i = 0; i < history.length - 1; i++) {
      const curr = parseDateAsLocal(toDateString(history[i].startDate));
      const prev = parseDateAsLocal(toDateString(history[i + 1].startDate));
      const diff = Math.ceil((curr - prev) / 86_400_000);
      cycleLengths.push(diff);
      if (diff > 35 || diff < 21) irregularCyclesCount++;
    }

    const averageGap       = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const irregularPercent = (irregularCyclesCount / cycleLengths.length) * 100;

    let totalSymptomScore = 0;
    history.forEach(entry => {
      const s = (entry.symptoms || []).map(x => x.toLowerCase());
      if (s.includes('acne'))              totalSymptomScore += 2;
      if (s.includes('hair_growth'))       totalSymptomScore += 2;
      if (s.includes('weight_gain'))       totalSymptomScore += 1;
      if (s.includes('irregular_periods')) totalSymptomScore += 2;
    });
    const avgSymptomScore = totalSymptomScore / history.length;

    const baseRisk =
      averageGap > 35  ? 70 :
      averageGap >= 28 ? 40 : 10;

    const riskScore = Math.min(
      Math.round(baseRisk * 0.7 + irregularPercent * 0.2 + avgSymptomScore * 0.1),
      100
    );

    const level =
      riskScore >= 70 ? 'high'     :
      riskScore >= 40 ? 'moderate' : 'normal';

    const message =
      level === 'high'     ? 'High risk of PCOD. Consider consulting a doctor.' :
      level === 'moderate' ? 'Moderate risk. Monitor your cycle and symptoms.'  :
                             'Your cycle looks normal.';

    res.json({ riskScore, level, averageGap, message });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /cycle/delete-day/:id/:date ───────────────────────────────────────
// Removes a single calendar day from a log's periodDates.
// • No dates remain after removal  → deletes the whole CycleData document.
// • Dates remain                   → resyncs startDate/endDate and saves.
router.delete('/delete-day/:id/:date', authMiddleware, async (req, res) => {
  try {
    const { id, date } = req.params;

    // Validate & sanitise the date param (Express URL-decodes it already)
    const targetDate = String(date).trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return res.status(400).json({
        message: `Invalid date format: "${date}". Expected YYYY-MM-DD.`,
      });
    }

    const log = await CycleData.findOne({ _id: id, userId: req.user.id });
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    // ── Rebuild periodDates if the array is missing or empty ─────────────────
    if (!Array.isArray(log.periodDates) || log.periodDates.length === 0) {
      const startStr = toDateString(log.startDate);
      let endStr;

      if (log.endDate) {
        endStr = toDateString(log.endDate);
      } else if (log.length) {
        const e = parseDateAsLocal(startStr);
        e.setDate(e.getDate() + log.length - 1);
        endStr = toDateString(e);
      } else {
        endStr = startStr; // single-day fallback
      }

      if (startStr && endStr) {
        log.periodDates = buildPeriodDates(startStr, parseDateAsLocal(endStr));
      }
    }

    // Normalise every stored entry to a plain "YYYY-MM-DD" string
    const normalised = log.periodDates.map(toDateString).filter(Boolean);

    if (!normalised.includes(targetDate)) {
      return res.status(404).json({
        message: `Date ${targetDate} not found in this log`,
      });
    }

    const remaining = normalised.filter(d => d !== targetDate);

    const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const isDeletingStart = targetDate === normalised[0];

// check if ALL remaining dates are future
const allFuture = remaining.every(d => {
  return parseDateAsLocal(d) > today;
});

if (isDeletingStart && allFuture) {
  await CycleData.deleteOne({ _id: id, userId: req.user.id });

  return res.json({
    message: "Start date deleted → future dates cleared",
    deleted: true,
    clearedFuture: true
  });
}

    // ── No dates left → delete the whole document ────────────────────────────
    if (remaining.length === 0) {
      await CycleData.deleteOne({ _id: id, userId: req.user.id });
      return res.json({
        message: `Day ${targetDate} removed — log deleted (no dates remaining)`,
        deleted: true,
      });
    }

    // ── Dates still remain → update and save ────────────────────────────────
    remaining.sort();
    log.periodDates = remaining;
    log.startDate   = remaining[0];
    log.endDate     = parseDateAsLocal(remaining[remaining.length - 1]);
    log.markModified('periodDates');

    await log.save();

    res.json({
      message:     `Day ${targetDate} removed successfully`,
      deleted:     false,
      periodDates: remaining,
      startDate:   remaining[0],
      endDate:     remaining[remaining.length - 1],
    });
  } catch (err) {
    console.error('DELETE-DAY ERROR:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;
