import mongoose from 'mongoose';

const BazarSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  item: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['groceries', 'vegetables', 'meat', 'spices', 'dairy', 'others'],
    default: 'groceries',
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    enum: ['kg', 'liter', 'piece', 'dozen', 'box', 'pack', 'gram', 'ml'],
    default: 'kg',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    default: function() {
      return this.quantity * this.price;
    },
  },
  vendor: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
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

// Auto-calculate total before saving - Using async/await syntax
BazarSchema.pre('save', async function() {
  this.total = this.quantity * this.price;
});

export default mongoose.models.Bazar || mongoose.model('Bazar', BazarSchema);