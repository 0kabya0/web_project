import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Member from '@/lib/models/Member';
import User from '@/lib/models/User';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;
    await dbConnect();
    const { id } = await context.params;

    const result = await Member.findByIdAndUpdate(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!result) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member updated successfully' });
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;

    // Find the member first to get username
    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const username = member.username;

    // Mark member as inactive and delete from Member collection
    await Member.findByIdAndDelete(id);

    // Also mark the user as inactive so they can't log in
    await User.findOneAndUpdate(
      { username },
      { isActive: false, status: 'inactive' },
      { new: true }
    );

    return NextResponse.json({ message: 'Member removed successfully. Removed member cannot log in until re-approved by admin.' });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}