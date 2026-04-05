import express from 'express';
import CycleData from '../models/CycleData.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Log period date
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, symptoms, mood, flowLevel, notes } = req.body;

    const newLog = new CycleData({
      userId: req.user.id,
      startDate,
      endDate,
      symptoms,
      mood,
      flowLevel,
      notes,
    });

    const cycle = await newLog.save();
    res.json(cycle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get cycle history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id }).sort({
      startDate: -1,
    });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Predict next period
router.get('/predict', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id })
      .sort({ startDate: -1 })
      .limit(3);

    if (history.length < 2) {
      return res.json({
        message: 'Not enough data to predict accurately',
        predictedDate: null,
        ovulationDate: null,
      });
    }

    let totalCycleLength = 0;
    for (let i = 0; i < history.length - 1; i++) {
      const current = new Date(history[i].startDate);
      const previous = new Date(history[i + 1].startDate);
      const diffTime = Math.abs(current - previous);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalCycleLength += diffDays;
    }

    const averageCycle = Math.round(totalCycleLength / (history.length - 1));
    const lastPeriodDate = new Date(history[0].startDate);

    const predictedDate = new Date(lastPeriodDate);
    predictedDate.setDate(predictedDate.getDate() + averageCycle);

    // Ovulation is usually 14 days before next period
    const ovulationDate = new Date(predictedDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    res.json({ predictedDate, averageCycleLength: averageCycle, ovulationDate });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Calculate PCOD risk score
router.get('/pcod-risk', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id }).sort({
      startDate: -1,
    });

    if (history.length < 2) {
      return res.json({
        riskScore: 0,
        level: 'normal',
        message: 'Not enough data',
        averageGap: 0,
      });
    }

    let irregularCyclesCount = 0;
    let cycleLengths = [];

    for (let i = 0; i < history.length - 1; i++) {
      const current = new Date(history[i].startDate);
      const previous = new Date(history[i + 1].startDate);
      const diffTime = Math.abs(current - previous);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cycleLengths.push(diffDays);

      if (diffDays > 35 || diffDays < 21) {
        irregularCyclesCount++;
      }
    }

    const averageGap =
      cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;

    let riskLevel = 'normal';
    let riskScore = 0;

    if (averageGap > 35) {
      // High risk: cycles too long
      riskLevel = 'high';
      riskScore = 80 + irregularCyclesCount * 5;
    } else if (averageGap >= 28 && averageGap <= 35) {
      // Moderate risk: slightly longer than ideal
      riskLevel = 'moderate';
      riskScore = 40 + irregularCyclesCount * 5;
    } else {
      // ✅ FIXED: Normal range (21-28 days) gets 0 base risk score
      riskLevel = 'normal';
      riskScore = Math.max(0, irregularCyclesCount * 5);
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    res.json({ riskScore, level: riskLevel, averageGap });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;