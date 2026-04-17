import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Bazar from '@/lib/models/Bazar';
import Member from '@/lib/models/Member';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('memberId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter
    const filter: any = {};
    if (memberId) filter.memberId = memberId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const bazars = await Bazar.find(filter)
      .populate('memberId', 'username email')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(bazars);
  } catch (error: any) {
    console.error('Error fetching bazar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (!body.memberId || !body.item || !body.price) {
      return NextResponse.json(
        { error: 'memberId, item, and price are required' },
        { status: 400 }
      );
    }

    // Verify member exists
    const member = await Member.findById(body.memberId);
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Create bazar entry
    const bazarData = {
      memberId: body.memberId,
      userId: body.userId || null,
      date: new Date(body.date),
      item: body.item,
      category: body.category || 'groceries',
      quantity: body.quantity || 1,
      unit: body.unit || 'kg',
      price: body.price,
      vendor: body.vendor || null,
      status: body.status || 'pending',
      notes: body.notes || '',
    };

    const bazar = new Bazar(bazarData);
    await bazar.save();

    // Populate references before returning
    await bazar.populate('memberId', 'username email');
    await bazar.populate('userId', 'username');

    return NextResponse.json(bazar, { status: 201 });
  } catch (error: any) {
    console.error('Error creating bazar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Bazar ID is required' },
        { status: 400 }
      );
    }

    const bazar = await Bazar.findByIdAndUpdate(
      body.id,
      {
        item: body.item,
        quantity: body.quantity,
        price: body.price,
        category: body.category,
        unit: body.unit,
        vendor: body.vendor,
        status: body.status,
        notes: body.notes,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate('memberId', 'username email');

    return NextResponse.json(bazar);
  } catch (error: any) {
    console.error('Error updating bazar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Bazar ID is required' },
        { status: 400 }
      );
    }

    await Bazar.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bazar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}