import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import RentBill from '@/lib/models/RentBill';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');

    if (!month) {
      const latest = await RentBill.findOne({}).sort({ monthKey: -1 }).lean();
      return NextResponse.json(latest || null);
    }

    const rentBill = await RentBill.findOne({ monthKey: month }).lean();
    return NextResponse.json(rentBill || null);
  } catch (error: any) {
    console.error('Error fetching rent bill:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.monthKey) {
      return NextResponse.json({ error: 'monthKey is required' }, { status: 400 });
    }

    const payload = {
      roomRent: Number(body.roomRent || 0),
      wifiBill: Number(body.wifiBill || 0),
      buaBill: Number(body.buaBill || 0),
      updatedBy: body.updatedBy || 'admin',
      updatedAt: new Date(),
    };

    const updated = await RentBill.findOneAndUpdate(
      { monthKey: body.monthKey },
      { $set: payload, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error saving rent bill:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
