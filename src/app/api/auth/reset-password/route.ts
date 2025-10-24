import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { hash } from 'bcrypt-ts';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const db = client.db('Cluster0');
    
    // Find user with valid token
    const user = await db.collection('users').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update user password and clear reset token
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        },
        $unset: {
          resetToken: '',
          resetTokenExpiry: ''
        }
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Error in reset password:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
