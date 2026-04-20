import mongoose from 'mongoose';

const ResetHistorySchema = new mongoose.Schema({
  monthKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  resetDate: {
    type: Date,
    default: Date.now,
  },
  resetBy: {
    type: String,
    default: 'admin',
  },
  mealCount: {
    type: Number,
    default: 0,
  },
  bazarCount: {
    type: Number,
    default: 0,
  },
  paymentCount: {
    type: Number,
    default: 0,
  },
  totalMeals: {
    type: Number,
    default: 0,
  },
  totalBazar: {
    type: Number,
    default: 0,
  },
  totalPayments: {
    type: Number,
    default: 0,
  },
  meals: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  bazars: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  payments: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
});

export default mongoose.models.ResetHistory || mongoose.model('ResetHistory', ResetHistorySchema);
