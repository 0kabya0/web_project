import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Payment from '@/lib/models/Payment';
import Member from '@/lib/models/Member';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('memberId');
    const month = searchParams.get('month'); // YYYY-MM

    const filter: any = {};
    if (memberId) filter.memberId = memberId;
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, mon - 1, 1));
      const endDate = new Date(Date.UTC(year, mon, 1));
      filter.$or = [
        { monthKey: month },
        { paidDate: { $gte: startDate, $lt: endDate } },
      ];
    }

    const payments = await Payment.find(filter)
      .populate('memberId', 'username email')
      .sort({ paidDate: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.memberId || !body.amount || !body.monthKey || !body.date) {
      return NextResponse.json(
        { error: 'memberId, amount, monthKey, and date are required' },
        { status: 400 }
      );
    }

    const member = await Member.findById(body.memberId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const [year, mon] = String(body.monthKey).split('-').map(Number);
    const startDate = new Date(Date.UTC(year, mon - 1, 1));
    const endDate = new Date(Date.UTC(year, mon, 1));

    const existingMonthlyPayment = await Payment.findOne({
      memberId: body.memberId,
      status: 'completed',
      $or: [
        { monthKey: body.monthKey, isMonthlyExpense: true },
        { paidDate: { $gte: startDate, $lt: endDate } },
      ],
    });

    if (existingMonthlyPayment) {
      return NextResponse.json(
        { error: 'Monthly payment already marked as paid for this member' },
        { status: 409 }
      );
    }

    const payment = new Payment({
      memberId: body.memberId,
      // Fallback keeps compatibility with cached dev schemas where userId is still required.
      userId: body.userId || member._id,
      amount: Number(body.amount),
      paymentMethod: body.paymentMethod || 'cash',
      status: 'completed',
      description: body.description || 'Monthly expense payment',
      paidDate: new Date(body.date),
      monthKey: body.monthKey,
      isMonthlyExpense: true,
      notes: body.notes || '',
    });

    await payment.save();
    await payment.populate('memberId', 'username email');

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
