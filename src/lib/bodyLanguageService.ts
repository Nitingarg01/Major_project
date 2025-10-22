/**
 * Body Language Analysis Service
 * Analyzes posture, eye contact, and fidgeting using face-api.js
 * Provides real-time feedback on non-verbal communication
 */

export interface BodyLanguageData {
  posture: 'excellent' | 'good' | 'fair' | 'poor'
  eyeContact: number // 0-100 percentage
  fidgeting: 'low' | 'moderate' | 'high'
  headPosition: 'centered' | 'left' | 'right' | 'down' | 'up'
  confidence: number // 0-100 overall confidence score
  timestamp: Date
}

export interface BodyLanguageAnalytics {
  averagePosture: number // 0-10 score
  averageEyeContact: number // 0-100
  fidgetingLevel: number // 0-10
  overallBodyLanguageScore: number // 0-100
  recommendations: string[]
  timeline: BodyLanguageData[]
}

export class BodyLanguageService {
  private static instance: BodyLanguageService
  private bodyLanguageHistory: BodyLanguageData[] = []
  private lastHeadPosition: { x: number; y: number } | null = null
  private movementFrames: number[] = []
  
  private constructor() {}

  public static getInstance(): BodyLanguageService {
    if (!BodyLanguageService.instance) {
      BodyLanguageService.instance = new BodyLanguageService()
    }
    return BodyLanguageService.instance
  }

  /**
   * Analyze body language from video frame and face detection data
   */
  public async analyzeBodyLanguage(
    video: HTMLVideoElement,
    faceDetectionData?: any
  ): Promise<BodyLanguageData> {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      // Analyze various aspects
      const eyeContact = this.analyzeEyeContact(faceDetectionData)
      const posture = this.analyzePosture(faceDetectionData, canvas)
      const fidgeting = this.analyzeFidgeting(faceDetectionData)
      const headPosition = this.analyzeHeadPosition(faceDetectionData, canvas)
      
      // Calculate overall confidence score
      const confidence = this.calculateConfidenceScore({
        posture,
        eyeContact,
        fidgeting,
        headPosition
      })

      const bodyLanguageData: BodyLanguageData = {
        posture,
        eyeContact,
        fidgeting,
        headPosition,
        confidence,
        timestamp: new Date()
      }

      // Store in history
      this.bodyLanguageHistory.push(bodyLanguageData)
      
      // Keep only last 100 entries
      if (this.bodyLanguageHistory.length > 100) {
        this.bodyLanguageHistory.shift()
      }

      return bodyLanguageData
      
    } catch (error) {
      console.error('Body language analysis error:', error)
      return this.getDefaultBodyLanguage()
    }
  }

  /**
   * Analyze eye contact - checks if face is looking at camera
   */
  private analyzeEyeContact(faceData: any): number {
    if (!faceData || !faceData.landmarks) {
      return 50 // Default neutral score
    }

    // Check face orientation
    // If face is detected and centered, assume good eye contact
    const faceCentered = this.isFaceCentered(faceData)
    const faceSize = this.getFaceSize(faceData)
    
    let eyeContactScore = 50
    
    if (faceCentered) eyeContactScore += 30
    if (faceSize > 0.2) eyeContactScore += 20 // Face is close enough
    
    return Math.min(100, eyeContactScore)
  }

  /**
   * Analyze posture based on face position and size
   */
  private analyzePosture(
    faceData: any,
    canvas: HTMLCanvasElement
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (!faceData || !faceData.detection) {
      return 'poor'
    }

    const box = faceData.detection.box
    const canvasHeight = canvas.height
    const canvasWidth = canvas.width

    // Check if face is in upper half of frame (good posture)
    const faceVerticalPosition = (box.y + box.height / 2) / canvasHeight
    
    // Check face size (too close or too far)
    const faceSize = (box.width * box.height) / (canvasWidth * canvasHeight)
    
    if (faceVerticalPosition < 0.4 && faceSize > 0.15 && faceSize < 0.4) {
      return 'excellent'
    } else if (faceVerticalPosition < 0.5 && faceSize > 0.1 && faceSize < 0.5) {
      return 'good'
    } else if (faceVerticalPosition < 0.6 && faceSize > 0.08) {
      return 'fair'
    } else {
      return 'poor'
    }
  }

  /**
   * Analyze fidgeting based on head movement
   */
  private analyzeFidgeting(faceData: any): 'low' | 'moderate' | 'high' {
    if (!faceData || !faceData.detection) {
      return 'low'
    }

    const currentPosition = {
      x: faceData.detection.box.x,
      y: faceData.detection.box.y
    }

    if (!this.lastHeadPosition) {
      this.lastHeadPosition = currentPosition
      return 'low'
    }

    // Calculate movement distance
    const dx = currentPosition.x - this.lastHeadPosition.x
    const dy = currentPosition.y - this.lastHeadPosition.y
    const movement = Math.sqrt(dx * dx + dy * dy)

    this.lastHeadPosition = currentPosition

    // Store movement for trend analysis
    this.movementFrames.push(movement)
    if (this.movementFrames.length > 10) {
      this.movementFrames.shift()
    }

    // Calculate average movement
    const avgMovement = this.movementFrames.reduce((a, b) => a + b, 0) / this.movementFrames.length

    if (avgMovement < 5) return 'low'
    if (avgMovement < 15) return 'moderate'
    return 'high'
  }

  /**
   * Analyze head position
   */
  private analyzeHeadPosition(
    faceData: any,
    canvas: HTMLCanvasElement
  ): 'centered' | 'left' | 'right' | 'down' | 'up' {
    if (!faceData || !faceData.detection) {
      return 'centered'
    }

    const box = faceData.detection.box
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Check horizontal position
    if (centerX < canvasWidth * 0.35) return 'left'
    if (centerX > canvasWidth * 0.65) return 'right'
    
    // Check vertical position
    if (centerY < canvasHeight * 0.3) return 'up'
    if (centerY > canvasHeight * 0.6) return 'down'
    
    return 'centered'
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidenceScore(data: {
    posture: string
    eyeContact: number
    fidgeting: string
    headPosition: string
  }): number {
    let score = 0

    // Posture score (0-30)
    const postureScores = { excellent: 30, good: 22, fair: 15, poor: 5 }
    score += postureScores[data.posture as keyof typeof postureScores] || 15

    // Eye contact score (0-35)
    score += (data.eyeContact / 100) * 35

    // Fidgeting score (0-20, lower fidgeting = higher score)
    const fidgetingScores = { low: 20, moderate: 12, high: 5 }
    score += fidgetingScores[data.fidgeting as keyof typeof fidgetingScores] || 12

    // Head position score (0-15)
    score += data.headPosition === 'centered' ? 15 : 8

    return Math.round(Math.min(100, score))
  }

  /**
   * Get body language analytics
   */
  public getBodyLanguageAnalytics(): BodyLanguageAnalytics {
    if (this.bodyLanguageHistory.length === 0) {
      return {
        averagePosture: 5,
        averageEyeContact: 50,
        fidgetingLevel: 5,
        overallBodyLanguageScore: 50,
        recommendations: ['Maintain good posture', 'Make eye contact with camera'],
        timeline: []
      }
    }

    // Calculate averages
    const postureScores = { excellent: 10, good: 7.5, fair: 5, poor: 2.5 }
    const avgPosture = this.bodyLanguageHistory.reduce((sum, data) => 
      sum + postureScores[data.posture], 0) / this.bodyLanguageHistory.length

    const avgEyeContact = this.bodyLanguageHistory.reduce((sum, data) => 
      sum + data.eyeContact, 0) / this.bodyLanguageHistory.length

    const fidgetingScores = { low: 2, moderate: 5, high: 8 }
    const avgFidgeting = this.bodyLanguageHistory.reduce((sum, data) => 
      sum + fidgetingScores[data.fidgeting], 0) / this.bodyLanguageHistory.length

    const avgConfidence = this.bodyLanguageHistory.reduce((sum, data) => 
      sum + data.confidence, 0) / this.bodyLanguageHistory.length

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      avgPosture,
      avgEyeContact,
      avgFidgeting,
      avgConfidence
    })

    return {
      averagePosture: avgPosture,
      averageEyeContact: avgEyeContact,
      fidgetingLevel: avgFidgeting,
      overallBodyLanguageScore: avgConfidence,
      recommendations,
      timeline: [...this.bodyLanguageHistory]
    }
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = []

    if (metrics.avgPosture < 6) {
      recommendations.push('Sit upright and keep your shoulders back for better posture')
    }

    if (metrics.avgEyeContact < 60) {
      recommendations.push('Look directly at the camera more often to simulate eye contact')
    }

    if (metrics.avgFidgeting > 6) {
      recommendations.push('Try to minimize excessive head and body movements')
    }

    if (metrics.avgConfidence < 60) {
      recommendations.push('Practice maintaining consistent body language throughout the interview')
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent body language! Keep it up!')
    }

    return recommendations
  }

  /**
   * Helper methods
   */
  private isFaceCentered(faceData: any): boolean {
    if (!faceData?.detection?.box) return false
    const box = faceData.detection.box
    // Assume canvas is 640x480 or similar
    const centerX = box.x + box.width / 2
    return centerX > 200 && centerX < 440
  }

  private getFaceSize(faceData: any): number {
    if (!faceData?.detection?.box) return 0
    const box = faceData.detection.box
    return (box.width * box.height) / (640 * 480) // Normalized
  }

  private getDefaultBodyLanguage(): BodyLanguageData {
    return {
      posture: 'fair',
      eyeContact: 50,
      fidgeting: 'low',
      headPosition: 'centered',
      confidence: 50,
      timestamp: new Date()
    }
  }

  /**
   * Reset analysis history
   */
  public reset(): void {
    this.bodyLanguageHistory = []
    this.lastHeadPosition = null
    this.movementFrames = []
  }

  /**
   * Get real-time feedback message
   */
  public getBodyLanguageFeedback(data: BodyLanguageData): string {
    const messages: string[] = []

    if (data.posture === 'poor') {
      messages.push('Sit up straight')
    } else if (data.posture === 'excellent') {
      messages.push('Great posture!')
    }

    if (data.eyeContact < 50) {
      messages.push('Look at the camera')
    } else if (data.eyeContact > 80) {
      messages.push('Excellent eye contact!')
    }

    if (data.fidgeting === 'high') {
      messages.push('Try to stay still')
    }

    if (messages.length === 0) {
      return 'Good body language'
    }

    return messages.join(' • ')
  }
}

export default BodyLanguageService