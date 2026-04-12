import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'en',
  },
  refreshToken: {
    type: String,
    default: null,
  },
  // ── Onboarding fields ──────────────────────────────
  lastPeriodDate: {
    type: Date,
    default: null,
  },
  cycleLength: {
    type: Number,
    default: 28,
  },
  periodDuration: {
    type: Number,
    default: 5,
  },
  symptoms: {
    type: [String],
    default: [],
  },
  healthGoals: {
    type: [String],
    default: [],
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
export default User;
