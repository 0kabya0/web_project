import mongoose from 'mongoose';

const RentBillSchema = new mongoose.Schema({
  monthKey: {
    type: String,
    required: true,
    index: true,
  },
  roomRent: {
    type: Number,
    default: 0,
    min: 0,
  },
  wifiBill: {
    type: Number,
    default: 0,
    min: 0,
  },
  buaBill: {
    type: Number,
    default: 0,
    min: 0,
  },
  updatedBy: {
    type: String,
    default: 'admin',
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

RentBillSchema.index({ monthKey: 1 }, { unique: true });

export default mongoose.models.RentBill || mongoose.model('RentBill', RentBillSchema);
