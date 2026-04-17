import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME || 'Admin';
    const adminPassword = process.env.ADMIN_PASSWORD || '123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';

    // Ensure a default admin exists in the database.
    const existingAdmin = await User.findOne({ username: adminUsername });
    if (!existingAdmin) {
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        status: 'approved',
      });
    }

    // Authenticate by database record only.
    const user = await User.findOne({ username, password });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status !== 'approved') {
      return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
    }

    return NextResponse.json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}