import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Member from '@/lib/models/Member';
import Meal from '@/lib/models/Meal';
import Bazar from '@/lib/models/Bazar';
import Payment from '@/lib/models/Payment';

export async function GET() {
  try {
    await dbConnect();

    const [
      totalMembers,
      mealAgg,
      bazarAgg,
      paymentAgg,
    ] = await Promise.all([
      Member.countDocuments({}),
      Meal.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),
      Bazar.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),
      Payment.aggregate([
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
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
