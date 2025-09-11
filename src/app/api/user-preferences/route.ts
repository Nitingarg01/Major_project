import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { userPreferencesService } from '@/lib/userPreferencesService';
import { UserInterviewPreferences } from '@/types/userPreferences';

/**
 * Get user interview preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const preferences = await userPreferencesService.getUserPreferences(session.user.id);
    
    return NextResponse.json({
      success: true,
      preferences,
      message: 'User preferences retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error getting user preferences:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve user preferences',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Update user interview preferences
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences data provided' },
        { status: 400 }
      );
    }

    // Validate key preference fields
    const requiredFields = ['defaultDifficulty', 'questionDistribution', 'dsaPreferences'];
    const missingFields = requiredFields.filter(field => !preferences[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required preference fields',
          missingFields 
        },
        { status: 400 }
      );
    }

    // Validate question distribution percentages
    const distribution = preferences.questionDistribution;
    if (distribution) {
      const totalPercentage = Object.values(distribution).reduce((sum: number, val) => sum + Number(val || 0), 0);
      if (Math.abs(totalPercentage - 100) > 1) { // Allow for small rounding errors
        return NextResponse.json(
          { 
            error: 'Question distribution percentages must sum to 100',
            currentTotal: totalPercentage
          },
          { status: 400 }
        );
      }
    }

    console.log(`📝 Updating preferences for user: ${session.user.id}`);

    const updatedPreferences = await userPreferencesService.updateUserPreferences(
      session.user.id,
      preferences
    );

    console.log('✅ User preferences updated successfully');

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
      message: 'User preferences updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating user preferences:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to update user preferences',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Reset user preferences to defaults
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`🔄 Resetting preferences to defaults for user: ${session.user.id}`);

    // Get smart defaults based on query parameters
    const { searchParams } = new URL(request.url);
    const jobTitle = searchParams.get('jobTitle') || '';
    const companyName = searchParams.get('companyName') || '';

    const smartDefaults = userPreferencesService.getSmartDefaults(jobTitle, companyName);
    
    const resetPreferences = await userPreferencesService.updateUserPreferences(
      session.user.id,
      {
        ...smartDefaults,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0'
      }
    );

    console.log('✅ User preferences reset to smart defaults');

    return NextResponse.json({
      success: true,
      preferences: resetPreferences,
      message: `Preferences reset to smart defaults${jobTitle ? ` for ${jobTitle}` : ''}${companyName ? ` at ${companyName}` : ''}`
    });

  } catch (error: any) {
    console.error('❌ Error resetting user preferences:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to reset user preferences',
        details: error.message
      },
      { status: 500 }
    );
  }
}