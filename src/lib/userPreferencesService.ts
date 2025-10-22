/**
 * User Preferences Service
 * Manages user interview preferences and provides intelligent defaults
 */

import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import { UserInterviewPreferences, DEFAULT_USER_PREFERENCES, CompanySpecificDSAProfile } from '@/types/userPreferences';

export class UserPreferencesService {
  private static instance: UserPreferencesService;
  private dbName = 'Cluster0';

  private constructor() {}

  public static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  /**
   * Get user preferences with intelligent defaults
   */
  async getUserPreferences(userId: string): Promise<UserInterviewPreferences> {
    try {
      const db = client.db(this.dbName);
      const userPrefs = await db.collection('user_preferences').findOne({
        userId: userId
      });

      if (userPrefs) {
        return userPrefs as UserInterviewPreferences;
      }

      // Create default preferences for new user
      const defaultPrefs: UserInterviewPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert default preferences
      const result = await db.collection('user_preferences').insertOne(defaultPrefs);
      defaultPrefs._id = result.insertedId.toString();

      console.log(`✅ Created default preferences for user: ${userId}`);
      return defaultPrefs;

    } catch (error) {
      console.error('❌ Error getting user preferences:', error);
      // Return default preferences without saving if there's an error
      return {
        ...DEFAULT_USER_PREFERENCES,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserInterviewPreferences>
  ): Promise<UserInterviewPreferences> {
    try {
      const db = client.db(this.dbName);
      
      const updateData = {
        ...preferences,
        userId,
        updatedAt: new Date(),
        version: '1.0'
      };

      const result = await db.collection('user_preferences').findOneAndUpdate(
        { userId },
        { $set: updateData },
        { upsert: true, returnDocument: 'after' }
      );

      console.log(`✅ Updated preferences for user: ${userId}`);
      return result as UserInterviewPreferences;

    } catch (error) {
      console.error('❌ Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }

  /**
   * Get company-specific DSA profile
   */
  async getCompanyDSAProfile(companyName: string): Promise<CompanySpecificDSAProfile | null> {
    try {
      const db = client.db(this.dbName);
      const profile = await db.collection('company_dsa_profiles').findOne({
        companyName: { $regex: new RegExp(companyName, 'i') }
      });

      return profile as CompanySpecificDSAProfile | null;
    } catch (error) {
      console.error('❌ Error getting company DSA profile:', error);
      return null;
    }
  }

  /**
   * Create or update company DSA profile
   */
  async updateCompanyDSAProfile(profile: CompanySpecificDSAProfile): Promise<void> {
    try {
      const db = client.db(this.dbName);
      
      await db.collection('company_dsa_profiles').findOneAndUpdate(
        { companyName: profile.companyName },
        { 
          $set: {
            ...profile,
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );

      console.log(`✅ Updated DSA profile for company: ${profile.companyName}`);
    } catch (error) {
      console.error('❌ Error updating company DSA profile:', error)
    }
  }

  /**
   * Get preferences-based question distribution
   */
  getQuestionDistribution(
    preferences: UserInterviewPreferences, 
    totalQuestions: number,
    interviewType: string
  ): { [key: string]: number } {
    if (interviewType !== 'mixed') {
      // For specific types, return full allocation to that type
      return {
        [interviewType]: totalQuestions,
        technical: 0,
        behavioral: 0,
        dsa: 0,
        aptitude: 0,
        system_design: 0
      };
    }

    // For mixed interviews, use user preferences
    const distribution = preferences.questionDistribution;
    return {
      technical: Math.ceil((distribution.technical / 100) * totalQuestions),
      behavioral: Math.ceil((distribution.behavioral / 100) * totalQuestions),
      dsa: Math.ceil((distribution.dsa / 100) * totalQuestions),
      aptitude: Math.floor((distribution.aptitude / 100) * totalQuestions),
      system_design: Math.floor((distribution.system_design / 100) * totalQuestions)
    };
  }

  /**
   * Determine if company-specific DSA generation is needed
   */
  shouldGenerateCompanySpecificDSA(
    preferences: UserInterviewPreferences,
    companyName: string
  ): boolean {
    return preferences.dsaPreferences.companySpecificFocus &&
           companyName && 
           companyName.trim().length > 0;
  }

  /**
   * Get DSA difficulty progression for user
   */
  getDSADifficultyProgression(
    preferences: UserInterviewPreferences,
    totalDSAQuestions: number,
    experienceLevel: string
  ): Array<'easy' | 'medium' | 'hard'> {
    const progression: Array<'easy' | 'medium' | 'hard'> = [];
    
    if (!preferences.dsaPreferences.difficultyProgression) {
      // No progression, use standard distribution
      const difficulty = this.getStandardDifficulty(experienceLevel);
      return new Array(totalDSAQuestions).fill(difficulty);
    }

    // Create progression based on experience level
    if (experienceLevel === 'entry') {
      // Entry: 60% easy, 30% medium, 10% hard
      const easy = Math.ceil(totalDSAQuestions * 0.6);
      const medium = Math.ceil(totalDSAQuestions * 0.3);
      const hard = totalDSAQuestions - easy - medium;
      
      progression.push(...new Array(easy).fill('easy'));
      progression.push(...new Array(medium).fill('medium'));
      progression.push(...new Array(hard).fill('hard'));
    } else if (experienceLevel === 'senior') {
      // Senior: 10% easy, 40% medium, 50% hard
      const easy = Math.floor(totalDSAQuestions * 0.1);
      const medium = Math.ceil(totalDSAQuestions * 0.4);
      const hard = totalDSAQuestions - easy - medium;
      
      progression.push(...new Array(easy).fill('easy'));
      progression.push(...new Array(medium).fill('medium'));
      progression.push(...new Array(hard).fill('hard'));
    } else {
      // Mid: 20% easy, 50% medium, 30% hard
      const easy = Math.floor(totalDSAQuestions * 0.2);
      const medium = Math.ceil(totalDSAQuestions * 0.5);
      const hard = totalDSAQuestions - easy - medium;
      
      progression.push(...new Array(easy).fill('easy'));
      progression.push(...new Array(medium).fill('medium'));
      progression.push(...new Array(hard).fill('hard'));
    }

    // Shuffle to avoid predictable patterns
    return this.shuffleArray(progression);
  }

  private getStandardDifficulty(experienceLevel: string): 'easy' | 'medium' | 'hard' {
    switch (experienceLevel) {
      case 'entry': return 'easy';
      case 'senior': return 'hard';
      default: return 'medium';
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Check if preferences need updating (version compatibility)
   */
  needsPreferencesUpdate(preferences: UserInterviewPreferences): boolean {
    return !preferences.version || preferences.version !== '1.0';
  }

  /**
   * Get smart defaults based on job title and company
   */
  getSmartDefaults(jobTitle: string, companyName: string): Partial<UserInterviewPreferences> {
    const defaults: Partial<UserInterviewPreferences> = {};
    
    // Adjust defaults based on job title
    if (jobTitle.toLowerCase().includes('senior') || jobTitle.toLowerCase().includes('lead')) {
      defaults.behavioralPreferences = {
        leadershipQuestions: true,
        conflictResolution: true,
        teamCollaboration: true,
        problemSolving: true,
        cultureFit: true,
        situationalJudgment: true
      };
      defaults.questionDistribution = {
        technical: 35,
        behavioral: 35,
        dsa: 20,
        aptitude: 5,
        system_design: 5
      };
    }

    if (jobTitle.toLowerCase().includes('data') || jobTitle.toLowerCase().includes('ml')) {
      defaults.technicalPreferences = {
        focusAreas: ['algorithms', 'statistics', 'machine_learning', 'data_structures'],
        industrySpecific: true,
        modernTechStack: true,
        legacySystemExperience: false
      };
      defaults.dsaPreferences = {
        preferredTopics: ['arrays', 'trees', 'graphs', 'dynamic_programming', 'math'],
        avoidTopics: [],
        companySpecificFocus: true,
        difficultyProgression: true,
        realWorldScenarios: true,
        interviewStylePreference: 'company_specific'
      };
    }

    // Adjust based on company
    const topTechCompanies = ['google', 'meta', 'amazon', 'microsoft', 'apple', 'netflix'];
    if (topTechCompanies.some(company => companyName.toLowerCase().includes(company))) {
      defaults.dsaPreferences = {
        preferredTopics: ['arrays', 'strings', 'trees', 'graphs', 'dynamic_programming'],
        avoidTopics: [],
        companySpecificFocus: true,
        difficultyProgression: true,
        realWorldScenarios: true,
        interviewStylePreference: 'company_specific'
      };
      defaults.questionDistribution = {
        technical: 30,
        behavioral: 25,
        dsa: 35,
        aptitude: 5,
        system_design: 5
      };
    }

    return defaults;
  }
}

export const userPreferencesService = UserPreferencesService.getInstance();