import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/lib/models/User';
import Member from '@/lib/models/Member';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { username, email, password } = await request.json();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const user = new User({
      username,
      email,
      password, // In production, hash the password
      role: 'user',
      status: 'pending'
    });

    await user.save();

    // Do NOT create member here - user must be approved by admin first

    return NextResponse.json({
      message: 'Signup successful. Your account is pending admin approval.',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}