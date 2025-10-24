import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { ArrowLeft, Video, TrendingUp, CheckCircle, AlertCircle, Lightbulb, Star } from 'lucide-react';

export default async function FeedbackPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const { db } = await connectToDatabase();
  
  let interview, report;
  try {
    interview = await db.collection('interviews').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });

    if (!interview) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Interview not found</h1>
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
              Back to Dashboard
            </Link>
          </div>
        </div>
      );
    }

    if (interview.status !== 'completed') {
      redirect(`/interview/${params.id}`);
    }

    // Get performance report
    report = interview.performanceReport || await db.collection('performanceReports').findOne({
      interviewId: new ObjectId(params.id)
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return <div>Error loading feedback</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Mock Interview
              </span>
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200 mb-4">
            <CheckCircle className="w-4 h-4 mr-2" />
            Interview Completed
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Performance Evaluation</h1>
          <p className="text-lg text-gray-600">
            {interview.jobTitle} {interview.companyName && `at ${interview.companyName}`}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Completed on {new Date(interview.completedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Performance</h2>
              <p className="text-indigo-100">{report.summary}</p>
            </div>
            <div className="flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/30">
              <div className="text-center">
                <div className="text-4xl font-bold">{report.overallScore}</div>
                <div className="text-sm opacity-90">{getScoreLabel(report.overallScore)}</div>
              </div>
            </div>
          </div>
          
          {/* Category Scores */}
          {report.categoryScores && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.categoryScores).map(([category, score]: [string, any]) => (
                <div key={category} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-sm opacity-90 mb-1 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-2xl font-bold">{score}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Feedback */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Detailed Analysis</h3>
              <p className="text-gray-700 leading-relaxed">{report.detailedFeedback}</p>
            </div>
          </div>
        </div>

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {report.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <Star className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {report.improvements.map((improvement: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Advice */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps & Recommendations</h3>
              <div className="space-y-3">
                {report.actionableAdvice.map((advice: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-800 flex-1">{advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interview Questions Review */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Question-by-Question Review</h3>
          <div className="space-y-6">
            {interview.questions.map((q: any, index: number) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {q.type}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-3">{q.question}</p>
                    
                    {q.response && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
                        <p className="text-gray-800 text-sm">{q.response}</p>
                      </div>
                    )}
                    
                    {q.feedback && (
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-indigo-900 mb-2">Feedback:</p>
                        <p className="text-indigo-800 text-sm">{q.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create"
            className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            data-testid="practice-again-btn"
          >
            Practice Another Interview
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:shadow-md transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
