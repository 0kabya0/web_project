import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Member from '@/lib/models/Member';

export async function GET() {
  try {
    await dbConnect();
    const members = await Member.find({}).select('_id username email').lean();
    return NextResponse.json(members);
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (!body.username || !body.email) {
      return NextResponse.json(
        { error: 'username and email are required' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await Member.findOne({
      $or: [{ username: body.username }, { email: body.email }]
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    const member = new Member({
      username: body.username,
      email: body.email,
      phone: body.phone || null,
      role: body.role || 'member',
      roomNumber: body.roomNumber || null,
      address: body.address || null,
      emergencyContact: body.emergencyContact || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    await member.save();
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}