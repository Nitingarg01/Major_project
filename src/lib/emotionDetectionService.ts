/**
 * Lightweight Emotion Detection Service
 * Uses simple image analysis instead of heavy ML models
 * Provides real-time emotion feedback during interviews
 */

export type EmotionType = 'neutral' | 'happy' | 'focused' | 'confused' | 'stressed' | 'engaged'

export interface EmotionData {
  emotion: EmotionType
  confidence: number
  timestamp: Date
  metrics: {
    brightness: number
    movement: number
    facePresent: boolean
  }
}

export interface EmotionAnalytics {
  dominantEmotion: EmotionType
  emotionDistribution: Record<EmotionType, number>
  averageConfidence: number
  engagementScore: number
  timeline: EmotionData[]
}

export class EmotionDetectionService {
  private static instance: EmotionDetectionService
  private previousFrame: ImageData | null = null
  private emotionHistory: EmotionData[] = []
  private detectionInterval: number = 2000 // Analyze every 2 seconds
  
  private constructor() {}

  public static getInstance(): EmotionDetectionService {
    if (!EmotionDetectionService.instance) {
      EmotionDetectionService.instance = new EmotionDetectionService()
    }
    return EmotionDetectionService.instance
  }

  /**
   * Analyze emotion from video frame using lightweight heuristics
   */
  public async analyzeFrame(video: HTMLVideoElement): Promise<EmotionData> {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Analyze frame metrics
      const metrics = this.analyzeImageMetrics(imageData)
      
      // Detect movement if we have previous frame
      const movement = this.previousFrame 
        ? this.calculateMovement(this.previousFrame, imageData)
        : 0
      
      this.previousFrame = imageData
      
      // Determine emotion based on heuristics
      const emotion = this.determineEmotion(metrics, movement)
      
      const emotionData: EmotionData = {
        emotion: emotion.type,
        confidence: emotion.confidence,
        timestamp: new Date(),
        metrics: {
          brightness: metrics.brightness,
          movement,
          facePresent: metrics.facePresent
        }
      }
      
      // Store in history
      this.emotionHistory.push(emotionData)
      
      // Keep only last 50 entries
      if (this.emotionHistory.length > 50) {
        this.emotionHistory.shift()
      }
      
      return emotionData
      
    } catch (error) {
      console.error('Emotion analysis error:', error)
      return this.getDefaultEmotion()
    }
  }

  /**
   * Analyze basic image metrics
   */
  private analyzeImageMetrics(imageData: ImageData): {
    brightness: number
    contrast: number
    facePresent: boolean
    colorVariance: number
  } {
    const data = imageData.data
    let totalBrightness = 0
    let totalContrast = 0
    let nonZeroPixels = 0
    const colorValues: number[] = []

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (r + g + b) / 3
      
      if (brightness > 10) {
        totalBrightness += brightness
        colorValues.push(brightness)
        nonZeroPixels++
      }
    }

    const avgBrightness = nonZeroPixels > 0 ? totalBrightness / nonZeroPixels : 0
    
    // Calculate variance for contrast
    let variance = 0
    colorValues.forEach(val => {
      variance += Math.pow(val - avgBrightness, 2)
    })
    const colorVariance = colorValues.length > 0 ? variance / colorValues.length : 0
    
    return {
      brightness: avgBrightness,
      contrast: Math.sqrt(colorVariance),
      facePresent: avgBrightness > 30 && nonZeroPixels > (imageData.width * imageData.height * 0.1),
      colorVariance
    }
  }

  /**
   * Calculate movement between frames
   */
  private calculateMovement(prevFrame: ImageData, currentFrame: ImageData): number {
    if (prevFrame.data.length !== currentFrame.data.length) return 0
    
    let diff = 0
    const sampleRate = 4 // Sample every 4th pixel for performance
    
    for (let i = 0; i < prevFrame.data.length; i += sampleRate * 4) {
      const r1 = prevFrame.data[i]
      const g1 = prevFrame.data[i + 1]
      const b1 = prevFrame.data[i + 2]
      
      const r2 = currentFrame.data[i]
      const g2 = currentFrame.data[i + 1]
      const b2 = currentFrame.data[i + 2]
      
      diff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)
    }
    
    const avgDiff = diff / (prevFrame.data.length / sampleRate)
    return Math.min(avgDiff / 255, 1) // Normalize to 0-1
  }

  /**
   * Determine emotion based on heuristics
   */
  private determineEmotion(metrics: any, movement: number): {
    type: EmotionType
    confidence: number
  } {
    if (!metrics.facePresent) {
      return { type: 'neutral', confidence: 0.3 }
    }

    // High brightness + low movement = focused/engaged
    if (metrics.brightness > 100 && movement < 0.1) {
      return { type: 'focused', confidence: 0.75 }
    }

    // High brightness + moderate movement = engaged/happy
    if (metrics.brightness > 100 && movement >= 0.1 && movement < 0.3) {
      return { type: 'engaged', confidence: 0.7 }
    }

    // High movement = stressed/animated
    if (movement >= 0.3) {
      return { type: 'stressed', confidence: 0.65 }
    }

    // Low brightness = confused/uncertain
    if (metrics.brightness < 80) {
      return { type: 'confused', confidence: 0.6 }
    }

    // Moderate contrast + good brightness = happy
    if (metrics.contrast > 30 && metrics.brightness > 90) {
      return { type: 'happy', confidence: 0.7 }
    }

    // Default to neutral
    return { type: 'neutral', confidence: 0.5 }
  }

  /**
   * Get emotion analytics from history
   */
  public getEmotionAnalytics(): EmotionAnalytics {
    if (this.emotionHistory.length === 0) {
      return {
        dominantEmotion: 'neutral',
        emotionDistribution: {
          neutral: 100,
          happy: 0,
          focused: 0,
          confused: 0,
          stressed: 0,
          engaged: 0
        },
        averageConfidence: 0,
        engagementScore: 0,
        timeline: []
      }
    }

    // Count emotion occurrences
    const emotionCounts: Record<EmotionType, number> = {
      neutral: 0,
      happy: 0,
      focused: 0,
      confused: 0,
      stressed: 0,
      engaged: 0
    }

    let totalConfidence = 0

    this.emotionHistory.forEach(data => {
      emotionCounts[data.emotion]++
      totalConfidence += data.confidence
    })

    // Calculate percentages
    const total = this.emotionHistory.length
    const emotionDistribution: Record<EmotionType, number> = {
      neutral: (emotionCounts.neutral / total) * 100,
      happy: (emotionCounts.happy / total) * 100,
      focused: (emotionCounts.focused / total) * 100,
      confused: (emotionCounts.confused / total) * 100,
      stressed: (emotionCounts.stressed / total) * 100,
      engaged: (emotionCounts.engaged / total) * 100
    }

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionCounts).reduce((a, b) => 
      emotionCounts[a[0] as EmotionType] > emotionCounts[b[0] as EmotionType] ? a : b
    )[0] as EmotionType

    // Calculate engagement score (focused + engaged + happy - confused - stressed)
    const engagementScore = Math.max(0, Math.min(100,
      (emotionDistribution.focused + emotionDistribution.engaged + emotionDistribution.happy) -
      (emotionDistribution.confused + emotionDistribution.stressed)
    ))

    return {
      dominantEmotion,
      emotionDistribution,
      averageConfidence: totalConfidence / total,
      engagementScore,
      timeline: [...this.emotionHistory]
    }
  }

  /**
   * Get real-time emotion feedback message
   */
  public getEmotionFeedback(emotion: EmotionType): string {
    const feedback: Record<EmotionType, string> = {
      neutral: 'You appear calm and composed',
      happy: 'Great energy! You seem confident',
      focused: 'Excellent focus and attention',
      confused: 'Take your time to think',
      stressed: 'Take a deep breath, you\'re doing fine',
      engaged: 'You\'re showing great engagement'
    }
    return feedback[emotion]
  }

  /**
   * Get emotion color for UI display
   */
  public getEmotionColor(emotion: EmotionType): string {
    const colors: Record<EmotionType, string> = {
      neutral: '#6B7280', // gray
      happy: '#10B981', // green
      focused: '#3B82F6', // blue
      confused: '#F59E0B', // amber
      stressed: '#EF4444', // red
      engaged: '#8B5CF6' // purple
    }
    return colors[emotion]
  }

  /**
   * Reset emotion history
   */
  public reset(): void {
    this.emotionHistory = []
    this.previousFrame = null
  }

  /**
   * Default emotion when analysis fails
   */
  private getDefaultEmotion(): EmotionData {
    return {
      emotion: 'neutral',
      confidence: 0.5,
      timestamp: new Date(),
      metrics: {
        brightness: 0,
        movement: 0,
        facePresent: false
      }
    }
  }

  /**
   * Get current emotion state
   */
  public getCurrentEmotion(): EmotionData | null {
    return this.emotionHistory.length > 0 
      ? this.emotionHistory[this.emotionHistory.length - 1]
      : null
  }
}

export default EmotionDetectionService
