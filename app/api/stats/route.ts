import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Member from '@/lib/models/Member';
import Meal from '@/lib/models/Meal';
import Bazar from '@/lib/models/Bazar';
import Payment from '@/lib/models/Payment';

const getLocalMonthKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getMonthBounds = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  return { startDate, endDate };
};

export async function GET() {
  try {
    await dbConnect();

    const monthKey = getLocalMonthKey();
    const { startDate, endDate } = getMonthBounds(monthKey);

    const [
      totalMembers,
      mealAgg,
      bazarAgg,
      paymentAgg,
    ] = await Promise.all([
      Member.countDocuments({ role: { $ne: 'admin' } }),
      Meal.aggregate([
        {
          $match: { date: { $gte: startDate, $lt: endDate } },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),
      Bazar.aggregate([
        {
          $match: { date: { $gte: startDate, $lt: endDate } },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            $or: [
              { monthKey },
              { paidDate: { $gte: startDate, $lt: endDate } },
            ],
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const totalMeals = mealAgg[0]?.total || 0;
    const totalBazar = bazarAgg[0]?.total || 0;
    const totalPayments = paymentAgg[0]?.total || 0;
    const mealRate = totalMeals > 0 ? totalBazar / totalMeals : 0;

    return NextResponse.json({
      totalMembers,
      totalMeals,
      totalBazar,
      totalPayments,
      mealRate,
      monthKey,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
