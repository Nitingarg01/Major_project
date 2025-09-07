'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Target,
  MessageSquare,
  Star,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Brain,
  Zap,
  Users,
  Code,
  Lightbulb,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface PerformanceData {
  overallScore: number
  parameterScores: {
    [key: string]: number
  }
  overallVerdict: string
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  metadata: {
    companyName: string
    jobTitle: string
    interviewType: string
    totalQuestions: number
    answeredQuestions: number
    completionRate: number
    completedAt: string
  }
  detailedScores: {
    categoryBreakdown: any
    responseMetrics: any
    completionStats: any
    historicalComparison: any
  }
  feedbackSummary: {
    performanceLevel: string
    keyMessage: string
    topStrength: string
    mainImprovement: string
    quickWins: string[]
    nextSteps: string[]
  }
}

export default function InterviewPerformancePage() {
  const params = useParams()
  const router = useRouter()
  const interviewId = params.id as string
  
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false)

  useEffect(() => {
    if (interviewId) {
      fetchPerformanceData()
    }
  }, [interviewId])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch(`/api/analyze-performance?interviewId=${interviewId}`)
      const data = await response.json()

      if (data.success) {
        setPerformanceData(data.performance)
      } else {
        toast.error('Failed to load performance data')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
      toast.error('Failed to load performance data')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getGradeFromScore = (score: number) => {
    if (score >= 9) return { grade: 'A+', color: 'bg-green-600' }
    if (score >= 8) return { grade: 'A', color: 'bg-green-500' }
    if (score >= 7) return { grade: 'B+', color: 'bg-blue-500' }
    if (score >= 6) return { grade: 'B', color: 'bg-blue-400' }
    if (score >= 5) return { grade: 'C+', color: 'bg-yellow-500' }
    if (score >= 4) return { grade: 'C', color: 'bg-yellow-400' }
    return { grade: 'D', color: 'bg-red-500' }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical': return <Code className="w-5 h-5" />
      case 'behavioral': return <Users className="w-5 h-5" />
      case 'aptitude': return <Brain className="w-5 h-5" />
      case 'dsa': return <Lightbulb className="w-5 h-5" />
      case 'system_design': return <Target className="w-5 h-5" />
      default: return <MessageSquare className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your performance analysis...</p>
        </div>
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Data Not Found</h3>
          <p className="text-gray-600 mb-6">The performance analysis for this interview could not be found</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { grade, color } = getGradeFromScore(performanceData.overallScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Interview <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Performance</span>
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                {performanceData.metadata.companyName} • {performanceData.metadata.jobTitle}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => toast.info('Download feature coming soon!')}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" onClick={() => toast.info('Share feature coming soon!')}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
            </Link>
          </div>
        </div>

        {/* Performance Summary Banner */}
        <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full text-white text-4xl font-bold ${color} mb-4`}>
                  {grade}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{performanceData.overallScore}/10</h3>
                <p className="text-lg text-gray-600">{performanceData.feedbackSummary.performanceLevel}</p>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-gray-900">{performanceData.metadata.completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Questions Answered</span>
                  <span className="font-semibold text-gray-900">
                    {performanceData.metadata.answeredQuestions}/{performanceData.metadata.totalQuestions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Interview Type</span>
                  <Badge variant="secondary" className="capitalize">
                    {performanceData.metadata.interviewType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(performanceData.metadata.completedAt)}
                  </span>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    Top Strength
                  </h4>
                  <p className="text-sm text-gray-600">{performanceData.feedbackSummary.topStrength}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    Focus Area
                  </h4>
                  <p className="text-sm text-gray-600">{performanceData.feedbackSummary.mainImprovement}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parameter Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(performanceData.parameterScores).map(([parameter, score]) => (
                    <div key={parameter}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{parameter}</span>
                        <Badge className={getScoreColor(score as number)}>
                          {score}/10
                        </Badge>
                      </div>
                      <Progress value={(score as number) * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            {performanceData.detailedScores.categoryBreakdown && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Category Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(performanceData.detailedScores.categoryBreakdown).map(([category, data]: [string, any]) => (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(category)}
                          <h4 className="font-semibold capitalize">{category}</h4>
                          <Badge className={getScoreColor(data.average)}>
                            {data.average}/10
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Questions:</span>
                            <span>{data.count}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Answered:</span>
                            <span>{data.total > 0 ? Math.floor(data.total / data.average) : 0}</span>
                          </div>
                          <Progress value={data.average * 10} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overall Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Overall Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {performanceData.overallVerdict}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Message</h4>
                  <p className="text-blue-800">{performanceData.feedbackSummary.keyMessage}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {performanceData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvement Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Target className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {performanceData.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <ArrowRight className="w-5 h-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {performanceData.feedbackSummary.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Historical Performance */}
            {performanceData.detailedScores.historicalComparison && 
             !performanceData.detailedScores.historicalComparison.isFirstAttempt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Previous Attempts</span>
                      <span className="text-sm font-semibold">
                        {performanceData.detailedScores.historicalComparison.previousAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Best Score</span>
                      <span className="text-sm font-semibold">
                        {performanceData.detailedScores.historicalComparison.bestScore}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trend</span>
                      <Badge variant={
                        performanceData.detailedScores.historicalComparison.improvementTrend === 'improving' 
                          ? 'default' : 'secondary'
                      }>
                        {performanceData.detailedScores.historicalComparison.improvementTrend}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Zap className="w-5 h-5 mr-2" />
              Start New Interview
            </Button>
          </Link>
          <Link href="/performance">
            <Button size="lg" variant="outline">
              <BarChart3 className="w-5 h-5 mr-2" />
              View All Performance
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => setShowDetailedFeedback(!showDetailedFeedback)}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {showDetailedFeedback ? 'Hide' : 'Show'} Detailed Feedback
          </Button>
        </div>
      </div>
    </div>
  )
}