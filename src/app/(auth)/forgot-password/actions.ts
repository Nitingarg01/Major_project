"use server"
import { Resend } from 'resend';
import client from "@/lib/db";
import { randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handleForgotPassword = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  
  if (!email) {
    throw new Error("Please provide email address!");
  }

  try {
    const db = client.db();
    
    // Check if user exists
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security, don't reveal if email exists or not
      return { success: true }
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token in database
    await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          updatedAt: new Date()
        }
      }
    );

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    const emailHtml = `;
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reset Your Password - AI Interview</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333 }
            .container { max-width: 600px; margin: 0 auto; padding: 20px }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0 }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0 }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666 }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0 }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧠 Reset Your AI Interview Password</h1>
            </div>
            <div class="content">
                <h2>Hello!</h2>
                <p>We received a request to reset your password for your AI Interview account associated with <strong>${email}</strong>.</p>
                
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
                
                <div class="warning">
                    <strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.
                </div>
                
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                
                <p>Best regards,<br>The AI Interview Team</p>
            </div>
            <div class="footer">
                <p>© 2024 AI Interview App. Made with ❤️ for developers.</p>
                <p>© 2024 Interview AI. Made with ❤️ for developers.</p>
                <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            </div>
        </div>
    </body>
    </html>`;

    await resend.emails.send({
      from: 'AI Interview <onboarding@resend.dev>',
      to: [email],
      subject: '🔑 Reset Your AI Interview Password',
      html: emailHtml;
    });

    return { success: true }
  } catch (error) {
    console.error('Forgot password error:', error);
    return { 
      success: false, 
      error: "Failed to send reset email. Please try again." 
    }
  }
}