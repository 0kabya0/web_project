import mongoose from 'mongoose';

const SummarySchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalMeals: {
    type: Number,
    default: 0,
  },
  breakfastCount: {
    type: Number,
    default: 0,
  },
  lunchCount: {
    type: Number,
    default: 0,
  },
  dinnerCount: {
    type: Number,
    default: 0,
  },
  totalBazarAmount: {
    type: Number,
    default: 0,
  },
  totalPayments: {
    type: Number,
    default: 0,
  },
  mealRate: {
    type: Number,
    default: 0,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  dueAmount: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Summary || mongoose.model('Summary', SummarySchema);
