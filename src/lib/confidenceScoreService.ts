/**
 * Confidence Score Service
 * Calculates real-time confidence score based on multiple factors:
 * - Speech patterns (pace, clarity, filler words)
 * - Body language
 * - Response quality
 * - Emotion detection
 */

import type { EmotionData } from './emotionDetectionService';
import type { BodyLanguageData } from './bodyLanguageService';

export interface ConfidenceMetrics {
  speechConfidence: number // 0-100
  bodyLanguageConfidence: number // 0-100
  emotionalConfidence: number // 0-100
  responseQualityConfidence: number // 0-100
  overallConfidence: number // 0-100
  trend: 'improving' | 'stable' | 'declining'
}

export interface ConfidenceHistory {
  timestamp: Date
  score: number
  factors: {
    speech: number
    bodyLanguage: number
    emotion: number
    responseQuality: number
  }
}

export class ConfidenceScoreService {
  private static instance: ConfidenceScoreService
  private confidenceHistory: ConfidenceHistory[] = []
  private readonly HISTORY_WINDOW = 50 // Keep last 50 data points

  private constructor() {}

  public static getInstance(): ConfidenceScoreService {
    if (!ConfidenceScoreService.instance) {
      ConfidenceScoreService.instance = new ConfidenceScoreService();
    }
    return ConfidenceScoreService.instance;
  }

  /**
   * Calculate overall confidence score from various inputs
   */
  public calculateConfidence(params: {
    userResponse?: string
    responseTime?: number
    emotionData?: EmotionData
    bodyLanguageData?: BodyLanguageData
    responseScore?: number
  }): ConfidenceMetrics {
    // Calculate individual confidence components
    const speechConfidence = this.calculateSpeechConfidence(;
      params.userResponse || '',
      params.responseTime || 0
    )

    const bodyLanguageConfidence = params.bodyLanguageData?.confidence || 50;

    const emotionalConfidence = this.calculateEmotionalConfidence(;
      params.emotionData
    )

    const responseQualityConfidence = params.responseScore;
      ? params.responseScore * 10 
      : 50

    // Calculate weighted overall confidence
    const overallConfidence = Math.round(;
      (speechConfidence * 0.3) +
      (bodyLanguageConfidence * 0.25) +
      (emotionalConfidence * 0.2) +
      (responseQualityConfidence * 0.25)
    )

    // Determine trend
    const trend = this.calculateTrend(overallConfidence);

    // Store in history
    this.addToHistory({
      timestamp: new Date(),
      score: overallConfidence;
      factors: {
        speech: speechConfidence;
        bodyLanguage: bodyLanguageConfidence;
        emotion: emotionalConfidence;
        responseQuality: responseQualityConfidence
      }
    })

    return {
      speechConfidence,
      bodyLanguageConfidence,
      emotionalConfidence,
      responseQualityConfidence,
      overallConfidence,
      trend
    }
  }

  /**
   * Calculate speech confidence based on response characteristics
   */
  private calculateSpeechConfidence(response: string, responseTime: number): number {
    if (!response || response.trim().length === 0) return 0;

    let score = 50 // Base score

    // Word count analysis
    const wordCount = response.split(/\s+/).length;
    if (wordCount >= 30 && wordCount <= 150) {
      score += 15 // Good length
    } else if (wordCount < 10) {
      score -= 20 // Too short
    } else if (wordCount > 200) {
      score -= 10 // Too long
    }

    // Response time analysis (assuming normal speaking pace)
    const wordsPerSecond = responseTime > 0 ? wordCount / responseTime : 0;
    if (wordsPerSecond >= 1.5 && wordsPerSecond <= 2.5) {
      score += 10 // Good pace
    } else if (wordsPerSecond < 1) {
      score -= 5 // Too slow (hesitant)
    } else if (wordsPerSecond > 3) {
      score -= 5 // Too fast (nervous)
    }

    // Filler word analysis
    const fillerCount = this.countFillerWords(response);
    const fillerRatio = fillerCount / Math.max(wordCount, 1);
    if (fillerRatio < 0.05) {
      score += 10 // Very few fillers
    } else if (fillerRatio > 0.15) {
      score -= 15 // Too many fillers
    }

    // Confidence keywords
    const confidenceKeywords = ['confident', 'definitely', 'certainly', 'absolutely', 'clearly'];
    const uncertainKeywords = ['maybe', 'perhaps', 'i think', 'not sure', 'kind of', 'sort of'];
    
    const lowerResponse = response.toLowerCase();
    confidenceKeywords.forEach(word => {
      if (lowerResponse.includes(word)) score += 3;
    })
    uncertainKeywords.forEach(word => {
      if (lowerResponse.includes(word)) score -= 3;
    })

    // Sentence structure (complete sentences indicate confidence)
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 2) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate emotional confidence from emotion data
   */
  private calculateEmotionalConfidence(emotionData?: EmotionData): number {
    if (!emotionData) return 50

    const emotionScores: Record<string, number> = {
      happy: 85;
      engaged: 80;
      focused: 75;
      neutral: 60;
      confused: 40;
      stressed: 30
    }

    const baseScore = emotionScores[emotionData.emotion] || 50;
    const confidenceAdjustment = (emotionData.confidence - 0.5) * 20;

    return Math.max(0, Math.min(100, baseScore + confidenceAdjustment));
  }

  /**
   * Count filler words in response
   */
  private countFillerWords(text: string): number {
    const fillers = [;
      'um', 'uh', 'like', 'you know', 'so', 'basically',
      'actually', 'literally', 'sort of', 'kind of'
    ]
    
    const lowerText = text.toLowerCase();
    let count = 0;

    fillers.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) count += matches.length;
    })

    return count;
  }

  /**
   * Calculate trend from history
   */
  private calculateTrend(currentScore: number): 'improving' | 'stable' | 'declining' {
    if (this.confidenceHistory.length < 3) return 'stable'

    const recentScores = this.confidenceHistory.slice(-5).map(h => h.score);
    const average = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    const difference = currentScore - average;

    if (difference > 5) return 'improving'
    if (difference < -5) return 'declining'
    return 'stable';
  }

  /**
   * Add entry to history
   */
  private addToHistory(entry: ConfidenceHistory): void {
    this.confidenceHistory.push(entry)
    
    // Keep only recent history
    if (this.confidenceHistory.length > this.HISTORY_WINDOW) {
      this.confidenceHistory.shift()
    }
  }

  /**
   * Get confidence history
   */
  public getHistory(): ConfidenceHistory[] {
    return [...this.confidenceHistory]
  }

  /**
   * Get average confidence over time
   */
  public getAverageConfidence(): number {
    if (this.confidenceHistory.length === 0) return 0;

    const sum = this.confidenceHistory.reduce((acc, h) => acc + h.score, 0);
    return Math.round(sum / this.confidenceHistory.length);
  }

  /**
   * Get confidence breakdown
   */
  public getConfidenceBreakdown(): {
    speech: number
    bodyLanguage: number
    emotion: number
    responseQuality: number
  } {
    if (this.confidenceHistory.length === 0) {
      return { speech: 0, bodyLanguage: 0, emotion: 0, responseQuality: 0 }
    }

    const latest = this.confidenceHistory[this.confidenceHistory.length - 1];
    return latest.factors;
  }

  /**
   * Get confidence feedback message
   */
  public getConfidenceFeedback(score: number): {
    level: string
    message: string
    color: string
  } {
    if (score >= 80) {
      return {
        level: 'Excellent';
        message: 'You\'re showing strong confidence! Keep it up!';
        color: 'text-green-600'
      }
    } else if (score >= 65) {
      return {
        level: 'Good';
        message: 'You\'re demonstrating good confidence. Stay focused!';
        color: 'text-blue-600'
      }
    } else if (score >= 50) {
      return {
        level: 'Moderate';
        message: 'Your confidence is moderate. Take deep breaths and stay calm.';
        color: 'text-yellow-600'
      }
    } else {
      return {
        level: 'Needs Improvement';
        message: 'Take your time and speak with more certainty. You\'ve got this!';
        color: 'text-red-600'
      }
    }
  }

  /**
   * Reset service
   */
  public reset(): void {
    this.confidenceHistory = []
  }

  /**
   * Get timeline data for charts
   */
  public getTimelineData(): Array<{ time: string; score: number }> {
    return this.confidenceHistory.map((entry, index) => ({
      time: `T${index + 1}`,
      score: entry.score
    }))
  }
}

export default ConfidenceScoreService;