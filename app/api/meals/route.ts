import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Meal from '@/lib/models/Meal';
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

    const meals = await Meal.find(filter)
      .populate('memberId', 'username email')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(meals);
  } catch (error: any) {
    console.error('Error fetching meals:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (!body.memberId || !body.date) {
      return NextResponse.json(
        { error: 'memberId and date are required' },
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

    // Create meal with auto-calculated total
    const mealData = {
      memberId: body.memberId,
      userId: body.userId || null,
      date: new Date(body.date),
      breakfast: body.breakfast || 0,
      lunch: body.lunch || 0,
      dinner: body.dinner || 0,
      mealType: body.mealType || 'own',
      notes: body.notes || '',
    };

    const meal = new Meal(mealData);
    await meal.save();

    // Populate references before returning
    await meal.populate('memberId', 'username email');

    return NextResponse.json(meal, { status: 201 });
  } catch (error: any) {
    console.error('Error creating meal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Meal ID is required' },
        { status: 400 }
      );
    }

    const meal = await Meal.findByIdAndUpdate(
      body.id,
      {
        breakfast: body.breakfast,
        lunch: body.lunch,
        dinner: body.dinner,
        mealType: body.mealType,
        notes: body.notes,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate('memberId', 'username email');

    return NextResponse.json(meal);
  } catch (error: any) {
    console.error('Error updating meal:', error);
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
        { error: 'Meal ID is required' },
        { status: 400 }
      );
    }

    await Meal.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting meal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}