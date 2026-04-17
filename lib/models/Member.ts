import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  },
  roomNumber: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  emergencyContact: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  joinDate: {
    type: Date,
    default: Date.now,
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

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);