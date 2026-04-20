import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'cheque', 'online'],
    default: 'cash',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  description: {
    type: String,
    default: '',
  },
  paidDate: {
    type: Date,
    default: null,
  },
  dueDate: {
    type: Date,
    required: false,
  },
  notes: {
    type: String,
    default: '',
  },
  monthKey: {
    type: String,
    default: '',
  },
  isMonthlyExpense: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
