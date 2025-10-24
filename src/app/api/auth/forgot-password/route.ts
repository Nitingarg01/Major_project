import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = client.db('Cluster0');
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        success: true,
        message: 'If an account exists, a reset link will be sent' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await db.collection('users').updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          updatedAt: new Date()
        }
      }
    );

    // Send email with Resend
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    try {
      await resend.emails.send({
        from: 'AI Interview Coach <onboarding@resend.dev>',
        to: email,
        subject: 'Reset Your Password - AI Interview Coach',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .content {
                  background: white;
                  padding: 30px;
                  border: 1px solid #e0e0e0;
                }
                .button {
                  display: inline-block;
                  padding: 14px 30px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                  margin: 20px 0;
                }
                .footer {
                  text-align: center;
                  padding: 20px;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>We received a request to reset your password for your AI Interview Coach account.</p>
                  <p>Click the button below to reset your password:</p>
                  <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                  </p>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                  <p><strong>This link will expire in 1 hour.</strong></p>
                  <p>If you didn't request this password reset, you can safely ignore this email.</p>
                  <p>Best regards,<br>AI Interview Coach Team</p>
                </div>
                <div class="footer">
                  <p>© 2024 AI Interview Coach. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password reset email sent' 
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
