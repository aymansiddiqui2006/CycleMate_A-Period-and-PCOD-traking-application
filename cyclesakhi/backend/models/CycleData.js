import mongoose from 'mongoose';

const cycleDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  symptoms: [{
    type: String,
  }],
  mood: {
    type: String,
  },
  flowLevel: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CycleData = mongoose.model('CycleData', cycleDataSchema);
export default CycleData;
