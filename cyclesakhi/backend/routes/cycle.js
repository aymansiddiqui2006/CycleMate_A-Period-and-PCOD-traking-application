import express from 'express';
import CycleData from '../models/CycleData.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Log period date
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { startDate, duration, endDate, symptoms, mood, flowLevel, notes } = req.body;

    let calculatedEndDate;
    if (duration) {
  // If duration is provided → calculate endDate
  calculatedEndDate = new Date(startDate);
  calculatedEndDate.setDate(calculatedEndDate.getDate() + (duration - 1));

} else if (endDate) {
  // If frontend sends endDate → use it
  calculatedEndDate = new Date(endDate);

} else {
  // ✅ DEFAULT FIX (no more error)
  calculatedEndDate = new Date(startDate);
  calculatedEndDate.setDate(calculatedEndDate.getDate() + 4); // default 5 days
}

    const newLog = new CycleData({
      userId: req.user.id,
      startDate,
      endDate: calculatedEndDate,
      symptoms: symptoms || [],
      mood,
      flowLevel,
      notes,
    });

    const cycle = await newLog.save();
    res.json(cycle);

  } catch (err) {
    console.error("LOG ERROR:", err); // 👈 important for debugging
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

// Predict next period (Improved)
// Predict next period (Median + Cap)
router.get('/predict', authMiddleware, async (req, res) => {
  try {
    // Get last 5 cycles
    const history = await CycleData.find({ userId: req.user.id })
      .sort({ startDate: -1 })
      .limit(5);

    if (history.length < 3) {
      return res.json({
        message: 'Not enough data to predict accurately',
        predictedDate: null,
        ovulationDate: null,
      });
    }

    // Calculate cycle lengths
    let cycleLengths = [];
    for (let i = 0; i < history.length - 1; i++) {
      const current = new Date(history[i].startDate);
      const previous = new Date(history[i + 1].startDate);
      const diffDays = Math.ceil((current - previous) / (1000 * 60 * 60 * 24));
      cycleLengths.push(diffDays);
    }

    // Use median of recent cycles to avoid outlier inflation
    const recentCycles = cycleLengths.slice(0, 5); // last 5
    recentCycles.sort((a, b) => a - b);

    let predictedCycle;
    const mid = Math.floor(recentCycles.length / 2);
    if (recentCycles.length % 2 === 0) {
      predictedCycle = Math.round((recentCycles[mid - 1] + recentCycles[mid]) / 2);
    } else {
      predictedCycle = recentCycles[mid];
    }

    // Cap cycle length to realistic range
    predictedCycle = Math.min(Math.max(predictedCycle, 21), 35);

    const lastPeriodDate = new Date(history[0].startDate);
    const predictedDate = new Date(lastPeriodDate);
    predictedDate.setDate(predictedDate.getDate() + predictedCycle);

    // Ovulation ~ 14 days before next period
    const ovulationDate = new Date(predictedDate);
    ovulationDate.setDate(predictedDate.getDate() - 14);

    // Confidence based on standard deviation
    const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance =
      cycleLengths.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      cycleLengths.length;
    const stdDev = Math.sqrt(variance);

    let confidence = 'Low';
    if (stdDev < 2) confidence = 'High';
    else if (stdDev < 5) confidence = 'Medium';

    res.json({
      predictedDate,
      predictedCycleLength: predictedCycle,
      ovulationDate,
      confidence,
    });

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
        message: 'Not enough data to assess PCOD risk',
        averageGap: 0,
      });
    }

    let cycleLengths = [];
    let irregularCyclesCount = 0;

    // Calculate cycle lengths and count irregular cycles
    for (let i = 0; i < history.length - 1; i++) {
      const current = new Date(history[i].startDate);
      const previous = new Date(history[i + 1].startDate);
      const diffDays = Math.ceil((current - previous) / (1000 * 60 * 60 * 24));
      cycleLengths.push(diffDays);

      if (diffDays > 35 || diffDays < 21) {
        irregularCyclesCount++;
      }
    }

    // Average gap between periods
    const averageGap = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;

    // Percentage of irregular cycles
    const irregularPercent = (irregularCyclesCount / cycleLengths.length) * 100;

    // Symptom scoring per entry (average impact)
    let totalSymptomScore = 0;
    history.forEach(entry => {
      if (entry.symptoms?.includes("acne")) totalSymptomScore += 2;
      if (entry.symptoms?.includes("hair_growth")) totalSymptomScore += 2;
      if (entry.symptoms?.includes("weight_gain")) totalSymptomScore += 1;
      if (entry.symptoms?.includes("irregular_periods")) totalSymptomScore += 2;
    });
    const avgSymptomScore = totalSymptomScore / history.length;

    // Base risk from average gap
    let baseRisk = 0;
    if (averageGap > 35) baseRisk = 70;
    else if (averageGap >= 28 && averageGap <= 35) baseRisk = 40;
    else baseRisk = 10;

    // Weighted combination of risks
    let riskScore = baseRisk * 0.7 + irregularPercent * 0.2 + avgSymptomScore * 0.1;

    // Cap at 100
    riskScore = Math.min(Math.round(riskScore), 100);

    // Determine risk level
    let riskLevel = 'normal';
    if (riskScore >= 70) riskLevel = 'high';
    else if (riskScore >= 40) riskLevel = 'moderate';

    // User-friendly message
    let message = '';
    if (riskLevel === 'high') {
      message = 'High risk of PCOD. Consider consulting a doctor.';
    } else if (riskLevel === 'moderate') {
      message = 'Moderate risk. Monitor your cycle and symptoms.';
    } else {
      message = 'Your cycle looks normal.';
    }

    res.json({
      riskScore,
      level: riskLevel,
      averageGap,
      message,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// Delete a cycle log
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await CycleData.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id, // 🔥 IMPORTANT SECURITY FIX
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Log not found or not yours' });
    }

    res.json({ message: 'Log deleted successfully' });

  } catch (err) {
    console.error("DELETE ERROR FULL:", err); // 👈 THIS WILL SHOW REAL ERROR
    res.status(500).json({ message: 'Server error while deleting' });
  }
});
export default router;