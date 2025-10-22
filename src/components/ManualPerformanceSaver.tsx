'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ManualPerformanceSaverProps {
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

export default function ManualPerformanceSaver({ 
  interviewData, 
  feedbackData, 
  timeSpent = 0;
}: ManualPerformanceSaverProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const savePerformanceData = async () => {
    if (saving || saved) return

    setSaving(true);
    try {
      // Calculate performance metrics
      const labels = Object.keys(feedbackData.parameterScores || {});
      const scores = Object.values(feedbackData.parameterScores || {});
      const totalQuestions = Math.max(labels.length, 1) // Ensure at least 1
      const correctAnswers = scores.filter(score => score >= 6).length;
      const overallScore = Math.round((feedbackData.overallScore || 0) * 10);

      // Generate round results based on interview type
      const roundResults = []
      
      // Map interview types to round types
      const getRoundType = (interviewType: string) => {
        switch (interviewType.toLowerCase()) {
          case 'technical': return 'technical'
          case 'behavioral': return 'behavioral'
          case 'dsa': return 'dsa'
          case 'aptitude': return 'aptitude'
          case 'mixed': return 'mixed'
          default: return 'mixed'
        }
      }

      const roundType = getRoundType(interviewData.interviewType);
      
      // Create appropriate round results based on interview type
      if (interviewData.interviewType === 'mixed' && labels.length > 3) {
        // For mixed interviews, try to categorize by parameter names
        const technicalParams = labels.filter(label =>
          label.toLowerCase().includes('technical') || 
          label.toLowerCase().includes('problem') ||
          label.toLowerCase().includes('coding') ||
          label.toLowerCase().includes('algorithm');
        )
        const behavioralParams = labels.filter(label =>
          label.toLowerCase().includes('behavioral') || 
          label.toLowerCase().includes('communication') ||
          label.toLowerCase().includes('leadership') ||
          label.toLowerCase().includes('teamwork');
        )
        const otherParams = labels.filter(label =>
          !technicalParams.includes(label) && !behavioralParams.includes(label)
        )

        if (technicalParams.length > 0) {
          const techScore = technicalParams.reduce((sum, param) =>
            sum + (feedbackData.parameterScores[param] || 0), 0) / technicalParams.length
          roundResults.push({
            roundType: 'technical',
            score: Math.round(techScore * 10),
            questionsAnswered: technicalParams.length,
            totalQuestions: technicalParams.length,
            timeSpent: Math.round(timeSpent * 0.5)
          })
        }

        if (behavioralParams.length > 0) {
          const behavioralScore = behavioralParams.reduce((sum, param) =>
            sum + (feedbackData.parameterScores[param] || 0), 0) / behavioralParams.length
          roundResults.push({
            roundType: 'behavioral',
            score: Math.round(behavioralScore * 10),
            questionsAnswered: behavioralParams.length,
            totalQuestions: behavioralParams.length,
            timeSpent: Math.round(timeSpent * 0.3)
          })
        }

        if (otherParams.length > 0) {
          const otherScore = otherParams.reduce((sum, param) =>
            sum + (feedbackData.parameterScores[param] || 0), 0) / otherParams.length
          roundResults.push({
            roundType: 'mixed',
            score: Math.round(otherScore * 10),
            questionsAnswered: otherParams.length,
            totalQuestions: otherParams.length,
            timeSpent: Math.round(timeSpent * 0.2)
          })
        }
      } else {
        // For single-type interviews
        roundResults.push({
          roundType: roundType,
          score: overallScore,
          questionsAnswered: totalQuestions,
          totalQuestions: totalQuestions,
          timeSpent: timeSpent
        })
      }

      // Generate feedback based on experience level and interview type
      const strengths = labels
        .filter(label => (feedbackData.parameterScores[label] || 0) >= 7)
        .map(label => `Strong performance in ${label.toLowerCase()}`)

      const improvements = labels
        .filter(label => (feedbackData.parameterScores[label] || 0) < 5)
        .map(label => `Focus on improving ${label.toLowerCase()} skills`)

      // Generate experience-level specific recommendations
      const getRecommendations = (experienceLevel: string, interviewType: string, score: number) => {
        const baseRecommendations = []
        
        // Experience level specific advice
        switch (experienceLevel.toLowerCase()) {
          case 'entry':
            baseRecommendations.push(
              'Focus on fundamental concepts and basic problem-solving',
              'Practice explaining your thought process clearly',
              'Build confidence through consistent practice'
            )
            break;
          case 'senior':
            baseRecommendations.push(
              'Demonstrate leadership and system design thinking',
              'Share examples of mentoring and technical decisions',
              'Focus on architectural and scalability considerations'
            )
            break;
          default: // mid-level
            baseRecommendations.push(
              'Balance technical depth with practical application',
              'Show growth mindset and learning ability',
              'Demonstrate problem-solving methodology'
            )
        }

        // Interview type specific advice
        switch (interviewType.toLowerCase()) {
          case 'technical':
            baseRecommendations.push('Practice coding problems and system design');
            break;
          case 'behavioral':
            baseRecommendations.push('Prepare STAR method examples for common scenarios');
            break;
          case 'dsa':
            baseRecommendations.push('Focus on algorithm optimization and complexity analysis');
            break;
          case 'aptitude':
            baseRecommendations.push('Practice logical reasoning and quantitative problems');
            break;
          default:
            baseRecommendations.push('Continue well-rounded interview preparation');
        }

        // Score-based advice
        if (score >= 80) {
          baseRecommendations.push('You are well-prepared for real interviews!');
        } else if (score >= 60) {
          baseRecommendations.push('Good foundation, focus on refining weak areas');
        } else {
          baseRecommendations.push('Significant improvement needed, consider additional practice');
        }

        return baseRecommendations.slice(0, 4) // Limit to 4 recommendations
      }

      const recommendations = getRecommendations(
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
          overall: feedbackData.overallVerdict || `${interviewData.interviewType} interview completed for ${interviewData.experienceLevel} level position`,
          strengths: strengths.length > 0 ? strengths : ['Completed full interview session', 'Demonstrated engagement'],
          improvements: improvements.length > 0 ? improvements : ['Continue practicing regularly', 'Focus on consistency'],
          recommendations
        },
        roundResults
      }

      console.log('Manual save - sending data:', performanceData);

      const response = await fetch('/api/save-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(performanceData),
      })

      const result = await response.json();
      console.log('Manual save - response:', result);

      if (result.success) {
        setSaved(true);
        toast.success('Performance data saved successfully!');
        // Refresh the page to update the dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000)
      } else {
        toast.error(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      console.error('Manual save error:', error);
      toast.error('Error saving performance data');
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 font-medium">✅ Performance data saved successfully!</p>
        <p className="text-green-600 text-sm">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
      <p className="text-blue-800 font-medium mb-3">Save Performance Data</p>
      <p className="text-blue-600 text-sm mb-4">
        Click to manually save your interview performance and remove it from active interviews.
      </p>
      <Button 
        onClick={savePerformanceData}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {saving ? 'Saving...' : 'Save Performance Data'}
      </Button>
    </div>
  )
}