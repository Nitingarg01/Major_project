"use server"
import client from "@/lib/db";
import { hash } from "bcrypt-ts";

export const handleResetPassword = async (token: string, newPassword: string) => {
  if (!token || !newPassword) {
    throw new Error("Invalid request parameters");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  try {
    const db = client.db();
    
    // Find user with valid reset token
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });
    
    if (!user) {
      return { 
        success: false, 
        error: "Invalid or expired reset token. Please request a new password reset." 
      }
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 12);

    // Update user password and remove reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: ""
        }
      }
    );

    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error);
    return { 
      success: false, 
      error: "Failed to reset password. Please try again." 
    }
  }
}