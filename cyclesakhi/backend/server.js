import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import cycleRoutes from './routes/cycle.js';
import reportRoutes from './routes/report.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin.startsWith('http://localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/report', reportRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'CycleSakhi API is running 🌸' });
});

const PORT = process.env.PORT || 5000;

// Database connectionnode ser
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
  });