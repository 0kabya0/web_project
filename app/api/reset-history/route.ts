import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Meal from '@/lib/models/Meal';
import Bazar from '@/lib/models/Bazar';
import Payment from '@/lib/models/Payment';
import ResetHistory from '@/lib/models/ResetHistory';

const getMonthBounds = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));
  return { startDate, endDate };
};

const getAmount = (value: any) => Number(value || 0);

export async function GET() {
  try {
    await dbConnect();

    const histories = await ResetHistory.find({}).sort({ resetDate: -1 }).lean();
    return NextResponse.json(histories);
  } catch (error: any) {
    console.error('Error fetching reset history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const monthKey = String(body.monthKey || new Date().toISOString().slice(0, 7));
    const resetBy = String(body.resetBy || 'admin');

    const existingHistory = await ResetHistory.findOne({ monthKey }).lean();
    if (existingHistory) {
      return NextResponse.json({ error: 'This month has already been reset.' }, { status: 409 });
    }

    const { startDate, endDate } = getMonthBounds(monthKey);

    const [meals, bazars, payments] = await Promise.all([
      Meal.find({ date: { $gte: startDate, $lt: endDate } }).lean(),
      Bazar.find({ date: { $gte: startDate, $lt: endDate } }).lean(),
      Payment.find({
        $or: [
          { monthKey },
          { paidDate: { $gte: startDate, $lt: endDate } },
        ],
      }).lean(),
    ]);

    const totalMeals = meals.reduce((sum, meal: any) => sum + getAmount(meal.total), 0);
    const totalBazar = bazars.reduce((sum, bazar: any) => {
      if (typeof bazar.total === 'number' && Number.isFinite(bazar.total)) return sum + bazar.total;
      return sum + getAmount(bazar.quantity) * getAmount(bazar.price);
    }, 0);
    const totalPayments = payments.reduce((sum, payment: any) => sum + getAmount(payment.amount), 0);

    const history = await ResetHistory.create({
      monthKey,
      resetDate: new Date(),
      resetBy,
      mealCount: meals.length,
      bazarCount: bazars.length,
      paymentCount: payments.length,
      totalMeals,
      totalBazar,
      totalPayments,
      meals,
      bazars,
      payments,
    });

    try {
      await Promise.all([
        Meal.deleteMany({ date: { $gte: startDate, $lt: endDate } }),
        Bazar.deleteMany({ date: { $gte: startDate, $lt: endDate } }),
        Payment.deleteMany({
          $or: [
            { monthKey },
            { paidDate: { $gte: startDate, $lt: endDate } },
          ],
        }),
      ]);
    } catch (deleteError) {
      await ResetHistory.findByIdAndDelete(history._id);
      throw deleteError;
    }

    return NextResponse.json(history, { status: 201 });
  } catch (error: any) {
    console.error('Error resetting month data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
