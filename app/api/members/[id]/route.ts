import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Member from '@/lib/models/Member';

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

    const result = await Member.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}