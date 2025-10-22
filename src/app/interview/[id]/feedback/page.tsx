import React from 'react'
import { getInterviewDetails, getQuestions } from '../perform/actions'
import FeedbackAccordion from '@/components/FeedbackAccordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EnhancedFeedback from '@/components/EnhancedFeedback'
import CompanyPreparationDashboard from '@/components/CompanyPreparationDashboard'
import { auth } from '@/app/auth'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
<<<<<<< HEAD
import {
  Building2,
  TrendingUp,
  Target,
  Award,
  FileText,
  Home,
=======
import { 
  Building2, 
  TrendingUp, 
  Target, 
  Award, 
  FileText, 
  Home, 
  RotateCcw,
>>>>>>> e191508 (Initial commit)
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react'
import Link from 'next/link'
<<<<<<< HEAD
import PerformanceSaver from '@/components/PerformanceSaver'
import ManualPerformanceSaver from '@/components/ManualPerformanceSaver'
import FeedbackLoader from '@/components/FeedbackLoader'
import PerformanceDebugger from '@/components/PerformanceDebugger'
=======
import CompanyIntelligenceService from '@/lib/companyIntelligence'
import FeedbackLoader from '@/components/FeedbackLoader'
>>>>>>> e191508 (Initial commit)

interface PageProps {
  params: Promise<{ id: string }>
}

const page = async ({ params }: PageProps) => {
  const session = await auth()
<<<<<<< HEAD
  if (!session?.user) {
=======
  if(!session?.user){
>>>>>>> e191508 (Initial commit)
    redirect('/login')
  }

  const id = (await params).id as string
  console.log("feedback", id)

  const interview = await getInterviewDetails(id)
  const det = await getQuestions(id)

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-2xl font-bold text-red-600">Interview Not Found</div>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    )
  }

<<<<<<< HEAD
  // Generate simple company data (company intelligence service was removed)
  const companyData = {
    name: interview.companyName,
    industry: 'Technology',
    difficulty: 'medium',
    preparationTips: [
      'Study the company culture and values thoroughly',
      'Practice common interview questions for this role',
      'Research recent company developments and news',
      'Prepare specific examples that demonstrate relevant skills'
    ],
    focusAreas: ['Technical Skills', 'Problem Solving', 'Communication'],
    techStack: ['JavaScript', 'React', 'Node.js', 'Python'],
    culture: ['Innovation', 'Collaboration', 'Excellence']
  }
=======
  // Get company intelligence for enhanced feedback
  const companyIntelligence = await CompanyIntelligenceService.getInstance().getCompanyIntelligence(interview.companyName)
>>>>>>> e191508 (Initial commit)

  const arr = det?.extracted?.parameterScores || {}
  console.log(det)

  const labels = Object.keys(arr) as string[]
  const data = Object.values(arr) as number[]
<<<<<<< HEAD
  console.log(data, labels)

  if (!det || !det.extracted) {
=======
  console.log(data,labels)

  if(!det || !det.extracted){
>>>>>>> e191508 (Initial commit)
    return <FeedbackLoader interviewId={id} />
  }

  // Calculate company-specific insights
  const overallScore = det?.extracted?.overallScore || 0
  const readinessScore = Math.min(100, Math.max(0, overallScore * 10))
<<<<<<< HEAD

  // Generate company-specific recommendations
  const companySpecificTips = companyData.preparationTips
=======
  
  // Generate company-specific recommendations
  const companySpecificTips = companyIntelligence?.companyData?.preparationTips || [
    'Study the company culture and values thoroughly',
    'Practice common interview questions for this role',
    'Research recent company developments and news',
    'Prepare specific examples that demonstrate relevant skills'
  ]
>>>>>>> e191508 (Initial commit)

  // Create preparation metrics based on performance
  const preparationMetrics = {
    technicalReadiness: Math.max(0, Math.min(100, (data.find((_, i) => labels[i].toLowerCase().includes('technical') || labels[i].toLowerCase().includes('problem')) || overallScore) * 10)),
    behavioralReadiness: Math.max(0, Math.min(100, (data.find((_, i) => labels[i].toLowerCase().includes('behavioral') || labels[i].toLowerCase().includes('communication')) || overallScore) * 10)),
    companyKnowledge: Math.max(0, Math.min(100, readinessScore * 0.8)), // Based on overall performance
    culturalFit: Math.max(0, Math.min(100, readinessScore * 0.9))
  }
<<<<<<< HEAD

  // Generate strengths and improvements
  const strengths = labels.filter((_, index) => data[index] >= 7).map(label =>
    `Strong ${label.toLowerCase()} skills demonstrated`
  )
  const improvements = labels.filter((_, index) => data[index] < 5).map(label =>
=======
  
  // Generate strengths and improvements
  const strengths = labels.filter((_, index) => data[index] >= 7).map(label => 
    `Strong ${label.toLowerCase()} skills demonstrated`
  )
  const improvements = labels.filter((_, index) => data[index] < 5).map(label => 
>>>>>>> e191508 (Initial commit)
    `Focus on improving ${label.toLowerCase()} abilities`
  )

  // Company insights for dashboard
  const companyInsights = {
    companyName: interview.companyName,
    readinessScore,
    strengths: strengths.length > 0 ? strengths : ['Completed full interview session', 'Showed engagement and effort'],
    improvements: improvements.length > 0 ? improvements : ['Continue practicing to build confidence'],
    companySpecificTips,
    interviewIntelligence: {
<<<<<<< HEAD
      averageRounds: 4,
      expectedDifficulty: companyData.difficulty,
      keyFocusAreas: companyData.focusAreas,
      culturalValues: companyData.culture,
      techStack: companyData.techStack,
      recentNews: [`${interview.companyName} continues to innovate in technology`, `${interview.companyName} expands engineering team`]
=======
      averageRounds: companyIntelligence?.interviewInsights?.averageRounds || 4,
      expectedDifficulty: companyIntelligence?.companyData?.difficulty || 'medium',
      keyFocusAreas: companyIntelligence?.interviewInsights?.keySkillsRequired || ['Technical Skills', 'Problem Solving'],
      culturalValues: companyIntelligence?.companyData?.culture || ['Innovation', 'Collaboration'],
      techStack: companyIntelligence?.companyData?.techStack || [],
      recentNews: companyIntelligence?.recentUpdates || []
>>>>>>> e191508 (Initial commit)
    },
    preparationMetrics,
    confidenceBuilder: {
      completedMockInterviews: 1,
      averageScore: Math.round(overallScore * 10),
      improvementTrend: Math.max(0, Math.round((overallScore - 5) * 2)),
      readyForRealInterview: overallScore >= 7
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-400'
<<<<<<< HEAD
    if (score >= 6) return 'bg-blue-400'
=======
    if (score >= 6) return 'bg-blue-400' 
>>>>>>> e191508 (Initial commit)
    if (score >= 4) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 8) return { message: "Excellent performance! You're ready for the real interview.", icon: CheckCircle, color: "text-green-800" }
    if (score >= 6) return { message: "Good performance with room for improvement.", icon: Target, color: "text-blue-800" }
    if (score >= 4) return { message: "Average performance. Focus on key areas for improvement.", icon: AlertTriangle, color: "text-yellow-800" }
    return { message: "Needs significant improvement before interviewing.", icon: AlertTriangle, color: "text-red-800" }
  }

  const scoreInfo = getScoreMessage(overallScore)
  const ScoreIcon = scoreInfo.icon

<<<<<<< HEAD
  // Debug logging (moved outside JSX)
  console.log('Feedback page data:', {
    interviewId: id,
    interview: interview,
    feedbackData: det?.extracted
  })

  return (
    <div className='flex flex-col'>
      {/* Performance Debugger (Development Only) */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <PerformanceDebugger interviewId={id} />
      </div>

      {/* Save performance data automatically */}
      <PerformanceSaver
        interviewData={{
          interviewId: id,
          jobTitle: interview.jobTitle,
          companyName: interview.companyName,
          interviewType: interview.interviewType || 'mixed',
          experienceLevel: interview.experienceLevel || 'mid'
        }}
        feedbackData={{
          overallScore: det.extracted.overallScore || 0,
          parameterScores: det.extracted.parameterScores || {},
          overallVerdict: det.extracted.overallVerdict || '',
          adviceForImprovement: det.extracted.adviceForImprovement || []
        }}
        timeSpent={det.extracted.timeSpent || 30} // Default 30 minutes if not tracked
      />

      {/* Manual Performance Saver for Testing */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <ManualPerformanceSaver
          interviewData={{
            interviewId: id,
            jobTitle: interview.jobTitle,
            companyName: interview.companyName,
            interviewType: interview.interviewType || 'mixed',
            experienceLevel: interview.experienceLevel || 'mid'
          }}
          feedbackData={{
            overallScore: det.extracted.overallScore || 0,
            parameterScores: det.extracted.parameterScores || {},
            overallVerdict: det.extracted.overallVerdict || '',
            adviceForImprovement: det.extracted.adviceForImprovement || []
          }}
          timeSpent={det.extracted.timeSpent || 30}
        />
      </div>

=======
  return (
    <div className='flex flex-col'>
>>>>>>> e191508 (Initial commit)
      <div className='flex flex-col mx-4 p-2 mt-3 gap-6 max-w-7xl mx-auto'>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className='flex flex-col items-center text-center mb-4'>
            <span className='bg-gradient-to-r from-orange-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-4xl mb-2'>
              Interview Feedback Report
            </span>
            <div className="flex items-center gap-2 text-lg text-gray-600">
              <Building2 className="w-5 h-5" />
              <span>{interview?.jobTitle} Role at {interview?.companyName}</span>
            </div>
          </div>
<<<<<<< HEAD

=======
          
>>>>>>> e191508 (Initial commit)
          {/* Overall Score Display */}
          <div className="flex justify-center mb-6">
            <div className={`${getScoreColor(overallScore)} w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-lg`}>
              <div className="text-3xl font-bold">{overallScore}</div>
              <div className="text-sm">/ 10</div>
            </div>
          </div>
<<<<<<< HEAD

=======
          
>>>>>>> e191508 (Initial commit)
          {/* Score Message */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className={`flex items-center justify-center gap-2 ${scoreInfo.color} mb-2`}>
              <ScoreIcon className="w-5 h-5" />
              <span className="font-semibold">{scoreInfo.message}</span>
            </div>
<<<<<<< HEAD
            <div className="text-sm text-gray-600">
              Based on {companyData.name}'s interview standards and {companyData.difficulty} difficulty level
            </div>
=======
            {companyIntelligence && (
              <div className="text-sm text-gray-600">
                Based on {companyIntelligence.companyData.name}'s interview standards and {companyIntelligence.companyData.difficulty} difficulty level
              </div>
            )}
>>>>>>> e191508 (Initial commit)
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue='visual' className='w-full' color='black'>
          <TabsList className='w-full flex flex-row gap-2 bg-white p-1 rounded-lg border'>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Analysis
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Question-wise Feedback
            </TabsTrigger>
            <TabsTrigger value="preparation" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Preparation Dashboard
            </TabsTrigger>
          </TabsList>
<<<<<<< HEAD

=======
          
>>>>>>> e191508 (Initial commit)
          {/* Performance Analysis Tab */}
          <TabsContent value="visual" className='flex flex-col gap-5 mt-6'>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <span className="text-lg">
<<<<<<< HEAD
                <span className='font-semibold text-blue-800'>Overall Verdict:</span>
                <span className="text-blue-700 ml-2">{det?.extracted?.overallVerdict}</span>
              </span>
            </div>

            <EnhancedFeedback
              data={data}
=======
                <span className='font-semibold text-blue-800'>Overall Verdict:</span> 
                <span className="text-blue-700 ml-2">{det?.extracted?.overallVerdict}</span>
              </span>
            </div>
            
            <EnhancedFeedback 
              data={data} 
>>>>>>> e191508 (Initial commit)
              labels={labels}
              overallScore={det?.extracted?.overallScore || 0}
            />

            {/* Company-Specific Insights */}
<<<<<<< HEAD
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  {companyData.name} Interview Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Company Focus Areas:</h4>
                    <div className="flex flex-wrap gap-1">
                      {companyData.focusAreas.map((area: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Interview Difficulty:</h4>
                    <Badge
                      variant={companyData.difficulty === 'hard' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {companyData.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Key Preparation Tip</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {companyData.preparationTips[0]}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Question-wise Feedback Tab */}
          <TabsContent value="questions" className="mt-6">
            <FeedbackAccordion advice={det?.extracted?.adviceForImprovement} />
          </TabsContent>

          {/* Preparation Dashboard Tab */}
          <TabsContent value="preparation" className="mt-6">
            <CompanyPreparationDashboard
              companyInsights={companyInsights}
              onStartNewInterview={() => { }}
              onViewDetailedFeedback={() => { }}
=======
            {companyIntelligence && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    {companyIntelligence.companyData.name} Interview Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Company Focus Areas:</h4>
                      <div className="flex flex-wrap gap-1">
                        {companyIntelligence.companyData.focusAreas.map((area: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Interview Difficulty:</h4>
                      <Badge 
                        variant={companyIntelligence.companyData.difficulty === 'hard' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {companyIntelligence.companyData.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Key Preparation Tip</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      {companyIntelligence.companyData.preparationTips[0]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Question-wise Feedback Tab */}
          <TabsContent value="questions" className="mt-6">
            <FeedbackAccordion advice={det?.extracted?.adviceForImprovement}/>
          </TabsContent>
          
          {/* Preparation Dashboard Tab */}
          <TabsContent value="preparation" className="mt-6">
            <CompanyPreparationDashboard 
              companyInsights={companyInsights}
              onStartNewInterview={() => {}}
              onViewDetailedFeedback={() => {}}
>>>>>>> e191508 (Initial commit)
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
<<<<<<< HEAD
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go to Dashboard
=======
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Dashboard
>>>>>>> e191508 (Initial commit)
              </Button>
            </Link>
            <Link href="/create">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Star className="w-4 h-4" />
                Practice Again
              </Button>
            </Link>
<<<<<<< HEAD
            <Link href="/performance">
              <Button variant="outline" className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                <TrendingUp className="w-4 h-4" />
                View Performance Stats
              </Button>
            </Link>
          </div>

=======
          </div>
          
>>>>>>> e191508 (Initial commit)
          {overallScore >= 7 && (
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <span className="text-green-800 font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                Ready for Real Interview!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default page
