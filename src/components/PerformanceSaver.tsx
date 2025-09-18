'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface PerformanceSaverProps {
  interviewData: {
    interviewId: string
    jobTitle: string
    companyName: string
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'dsa' | 'aptitude' | string
    experienceLevel: 'entry' | 'mid' | 'senior' | string
  }
  feedbackData: {
    overallScore: number
    parameterScores: { [key: string]: number }
    overallVerdict: string
    adviceForImprovement: any[]
  }
  timeSpent?: number
}

export default function PerformanceSaver({ 
  interviewData, 
  feedbackData, 
  timeSpent = 0 
}: PerformanceSaverProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savePerformanceData = async () => {
      if (saved) return // Prevent duplicate saves

      try {
        // Validate input data
        if (!interviewData.interviewId || !interviewData.jobTitle || !interviewData.companyName) {
          console.error('Missing required interview data:', interviewData)
          return
        }

        if (!feedbackData.parameterScores || typeof feedbackData.overallScore !== 'number') {
          console.error('Missing or invalid feedback data:', feedbackData)
          return
        }

        // Calculate performance metrics with safety checks
        const labels = Object.keys(feedbackData.parameterScores || {})
        const scores = Object.values(feedbackData.parameterScores || {})
        const totalQuestions = Math.max(labels.length, 1) // Ensure at least 1
        const correctAnswers = scores.filter(score => score >= 6).length
        const overallScore = Math.round((feedbackData.overallScore || 0) * 10)

        // Generate round results based on parameter scores
        const roundResults = []
        
        // Group parameters by likely round types
        const technicalParams = labels.filter(label => 
          label.toLowerCase().includes('technical') || 
          label.toLowerCase().includes('problem') ||
          label.toLowerCase().includes('coding')
        )
        const behavioralParams = labels.filter(label => 
          label.toLowerCase().includes('behavioral') || 
          label.toLowerCase().includes('communication') ||
          label.toLowerCase().includes('leadership')
        )
        const otherParams = labels.filter(label => 
          !technicalParams.includes(label) && !behavioralParams.includes(label)
        )

        if (technicalParams.length > 0) {
          const techScore = technicalParams.reduce((sum, param) => 
            sum + feedbackData.parameterScores[param], 0) / technicalParams.length
          roundResults.push({
            roundType: 'technical',
            score: Math.round(techScore * 10),
            questionsAnswered: technicalParams.length,
            totalQuestions: technicalParams.length,
            timeSpent: Math.round(timeSpent * 0.4) // Assume 40% of time on technical
          })
        }

        if (behavioralParams.length > 0) {
          const behavioralScore = behavioralParams.reduce((sum, param) => 
            sum + feedbackData.parameterScores[param], 0) / behavioralParams.length
          roundResults.push({
            roundType: 'behavioral',
            score: Math.round(behavioralScore * 10),
            questionsAnswered: behavioralParams.length,
            totalQuestions: behavioralParams.length,
            timeSpent: Math.round(timeSpent * 0.3) // Assume 30% of time on behavioral
          })
        }

        if (otherParams.length > 0) {
          const otherScore = otherParams.reduce((sum, param) => 
            sum + feedbackData.parameterScores[param], 0) / otherParams.length
          roundResults.push({
            roundType: 'mixed',
            score: Math.round(otherScore * 10),
            questionsAnswered: otherParams.length,
            totalQuestions: otherParams.length,
            timeSpent: Math.round(timeSpent * 0.3) // Remaining time
          })
        }

        // Generate feedback based on scores with safety checks
        const strengths = labels
          .filter(label => (feedbackData.parameterScores[label] || 0) >= 7)
          .map(label => `Strong performance in ${label.toLowerCase()}`)

        const improvements = labels
          .filter(label => (feedbackData.parameterScores[label] || 0) < 5)
          .map(label => `Focus on improving ${label.toLowerCase()} skills`)

        // Generate experience and type-specific recommendations
        const getSmartRecommendations = (experienceLevel: string, interviewType: string, score: number) => {
          const recs = []
          
          // Experience-based recommendations
          if (experienceLevel === 'entry') {
            recs.push('Focus on fundamental concepts and clear communication')
          } else if (experienceLevel === 'senior') {
            recs.push('Demonstrate leadership experience and system design thinking')
          } else {
            recs.push('Balance technical depth with practical problem-solving')
          }

          // Type-based recommendations
          if (interviewType.includes('technical')) {
            recs.push('Practice coding problems and system architecture')
          } else if (interviewType.includes('behavioral')) {
            recs.push('Prepare STAR method examples for behavioral questions')
          } else if (interviewType.includes('dsa')) {
            recs.push('Focus on algorithm optimization and complexity analysis')
          } else {
            recs.push('Continue comprehensive interview preparation')
          }

          // Score-based recommendations
          if (score >= 80) {
            recs.push('Excellent performance - you are interview-ready!')
          } else if (score >= 60) {
            recs.push('Good foundation, refine areas for improvement')
          } else {
            recs.push('Focus on consistent practice and skill building')
          }

          return recs
        }

        const recommendations = getSmartRecommendations(
          interviewData.experienceLevel,
          interviewData.interviewType,
          overallScore
        )

        const performanceData = {
          interviewId: interviewData.interviewId,
          jobTitle: interviewData.jobTitle,
          companyName: interviewData.companyName,
          interviewType: interviewData.interviewType,
          experienceLevel: interviewData.experienceLevel,
          totalQuestions,
          correctAnswers,
          score: overallScore,
          timeSpent,
          feedback: {
            overall: feedbackData.overallVerdict || 'Interview completed successfully',
            strengths: strengths.length > 0 ? strengths : ['Completed full interview session'],
            improvements: improvements.length > 0 ? improvements : ['Continue practicing regularly'],
            recommendations
          },
          roundResults
        }

        console.log('Sending performance data:', performanceData)
        
        const response = await fetch('/api/save-performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(performanceData),
        })

        console.log('Response status:', response.status)
        const result = await response.json()
        console.log('Response data:', result)

        if (result.success) {
          setSaved(true)
          console.log('Performance data saved successfully')
          toast.success('Performance data saved successfully!')
        } else {
          console.error('Failed to save performance data:', result.error)
          if (result.details) {
            console.error('Error details:', result.details)
          }
          toast.error('Failed to save performance data')
        }
      } catch (error) {
        console.error('Error saving performance data:', error)
      }
    }

    // Save performance data when component mounts
    savePerformanceData()
  }, [interviewData, feedbackData, timeSpent, saved])

  return null // This component doesn't render anything
}