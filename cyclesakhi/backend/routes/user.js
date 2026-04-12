import express from 'express';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import CycleData from '../models/CycleData.js';

// ── helpers (mirrors cycle.js) ────────────────────────────────────────────────
function parseDateAsLocal(dateStr) {
  const cleaned = String(dateStr).trim().slice(0, 10);
  const [year, month, day] = cleaned.split('-').map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
}

function buildPeriodDates(startStr, endDate) {
  const dates = [];
  const limit = new Date(endDate);
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

const router = express.Router();

// POST /api/user/onboarding  — protected
router.post('/onboarding', authMiddleware, async (req, res) => {
  const { lastPeriodDate, cycleLength, periodDuration, symptoms, healthGoals } = req.body;

  try {
    // 1. Update the user profile with onboarding data
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          lastPeriodDate: lastPeriodDate || null,
          cycleLength:    cycleLength    || 28,
          periodDuration: periodDuration || 5,
          symptoms:       symptoms       || [],
          healthGoals:    healthGoals    || [],
          isOnboarded:    true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Seed / re-seed a CycleData entry from the last period date so the
    //    dashboard immediately has real cycle history to work with.
    if (lastPeriodDate) {
      const duration   = Number(periodDuration) || 5;
      const startStr   = String(lastPeriodDate).trim().slice(0, 10);
      const startLocal = parseDateAsLocal(startStr);

      if (!isNaN(startLocal.getTime())) {
        const endLocal = new Date(startLocal);
        endLocal.setDate(startLocal.getDate() + (duration - 1));
        const periodDates = buildPeriodDates(startStr, endLocal);

        // Remove any previous onboarding-seeded entry then re-create fresh.
        // We identify it as the earliest single log whose startDate matches
        // the user's previous lastPeriodDate (or any overlapping dates).
        await CycleData.deleteMany({
          userId:      req.user.id,
          periodDates: { $in: periodDates },
        });

        await CycleData.create({
          userId:      req.user.id,
          startDate:   startLocal,
          endDate:     endLocal,
          periodDates,
          symptoms:    symptoms || [],
        });
      }
    }

    res.json({ message: 'Onboarding complete', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
