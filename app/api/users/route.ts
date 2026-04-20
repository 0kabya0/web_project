import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/lib/models/User';
import Member from '@/lib/models/Member';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { id, status } = await request.json();

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If approved, create member record; if rejected, remove it
    if (status === 'approved') {
      // Check if member already exists
      let member = await Member.findOne({
        $or: [{ username: user.username }, { email: user.email }]
      });

      if (!member) {
        // Create member record when user is approved
        member = new Member({
          username: user.username,
          email: user.email,
          role: user.role === 'admin' ? 'admin' : 'member',
          isActive: true,
        });
        await member.save();
      }
    } else if (status === 'rejected') {
      // Remove member record if user is rejected
      await Member.deleteOne({
        $or: [{ username: user.username }, { email: user.email }]
      });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}