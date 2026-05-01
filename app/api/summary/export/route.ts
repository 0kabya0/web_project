import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Member from '@/lib/models/Member';
import Meal from '@/lib/models/Meal';
import Bazar from '@/lib/models/Bazar';
import Payment from '@/lib/models/Payment';
import RentBill from '@/lib/models/RentBill';

const getMonthBounds = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));
  return { startDate, endDate };
};

const getAmount = (v: any) => Number(v || 0);

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const monthKey = (url.searchParams.get('month') || new Date().toISOString().slice(0, 7)).toString();
    const { startDate, endDate } = getMonthBounds(monthKey);

    const [members, meals, bazars, payments, rent] = await Promise.all([
      Member.find({}).lean(),
      Meal.find({ date: { $gte: startDate, $lt: endDate } }).lean(),
      Bazar.find({ date: { $gte: startDate, $lt: endDate } }).lean(),
      Payment.find({
        $or: [
          { monthKey },
          { paidDate: { $gte: startDate, $lt: endDate } },
        ],
      }).lean(),
      RentBill.findOne({ monthKey }).lean(),
    ]);

    const mealsByMember: Record<string, number> = {};
    meals.forEach((m: any) => {
      const id = m.memberId?._id || (typeof m.memberId === 'string' ? m.memberId : undefined);
      if (!id) return;
      mealsByMember[id] = (mealsByMember[id] || 0) + getAmount(m.total);
    });

    const bazarByMember: Record<string, number> = {};
    bazars.forEach((b: any) => {
      const id = typeof b.memberId === 'string' ? b.memberId : b.memberId?._id;
      if (!id) return;
      const amount = typeof b.total === 'number' && Number.isFinite(b.total) ? b.total : getAmount(b.quantity) * getAmount(b.price);
      bazarByMember[id] = (bazarByMember[id] || 0) + amount;
    });

    const paymentsByMember: Record<string, number> = {};
    payments.forEach((p: any) => {
      const id = typeof p.memberId === 'string' ? p.memberId : p.memberId?._id;
      if (!id) return;
      paymentsByMember[id] = (paymentsByMember[id] || 0) + getAmount(p.amount);
    });

    const totalMeals = Object.values(mealsByMember).reduce((s, v) => s + v, 0);
    const totalBazar = Object.values(bazarByMember).reduce((s, v) => s + v, 0);
    const totalPayments = Object.values(paymentsByMember).reduce((s, v) => s + v, 0);
    const mealRate = totalMeals > 0 ? totalBazar / totalMeals : 0;
    const totalRent = rent ? (getAmount(rent.roomRent) + getAmount(rent.wifiBill) + getAmount(rent.buaBill)) : 0;

    const perMember = members.map((m: any) => {
      const id = String(m._id);
      const memberMeals = mealsByMember[id] || 0;
      const memberBazar = bazarByMember[id] || 0;
      const memberPayments = paymentsByMember[id] || 0;
      const mealCost = memberMeals * mealRate;
      const giveTake = mealCost - memberBazar;
      const balance = totalRent + giveTake - memberPayments;

      return {
        memberId: id,
        username: m.username || '',
        email: m.email || '',
        totalMeals: memberMeals,
        mealCost,
        totalBazar: memberBazar,
        totalPayments: memberPayments,
        giveTake,
        balance,
      };
    });

    return NextResponse.json({
      monthKey,
      totals: { totalMeals, totalBazar, totalPayments, mealRate, totalRent },
      perMember,
    });
  } catch (error: any) {
    console.error('Error exporting summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
