import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema({
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
  breakfast: {
    type: Number,
    default: 0,
    min: 0,
  },
  lunch: {
    type: Number,
    default: 0,
    min: 0,
  },
  dinner: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  mealType: {
    type: String,
    enum: ['own', 'guest', 'regular', 'special', 'paid_separately'],
    default: 'own',
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

// Auto-calculate total meals before saving - Using async/await syntax
MealSchema.pre('save', async function() {
  this.total = (this.breakfast || 0) + (this.lunch || 0) + (this.dinner || 0);
});

export default mongoose.models.Meal || mongoose.model('Meal', MealSchema);