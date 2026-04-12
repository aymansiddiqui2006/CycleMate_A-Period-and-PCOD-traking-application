import express from 'express';
import CycleData from '../models/CycleData.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const history = await CycleData.find({ userId: req.user.id }).sort({ startDate: -1 });

    // Dummy mock logic for generating a report that frontend will put into PDF
    // (since PDF generation is requested to be in frontend using jsPDF)
    
    // Calculate basic report details
    const totalPeriods = history.length;
    let reportString = "Insufficient data to generate comprehensive report.";
    if (totalPeriods > 1) {
      reportString = `You have logged ${totalPeriods} cycles. Ensure you stay consistent with your logs.`;
    }

    res.json({
      history,
      reportSummary: reportString,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
