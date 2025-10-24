import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, Target, TrendingUp, CheckCircle, AlertCircle, 
  Lightbulb, Zap, Award, ArrowRight, Download
} from 'lucide-react';

export default async function ResumeResultPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const { db } = await connectToDatabase();
  
  let analysis;
  try {
    analysis = await db.collection('resumeAnalyses').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return <div>Analysis not found</div>;
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analysis not found</h1>
          <Link href="/resume-analyzer" className="text-green-600 hover:text-green-700">
            Go back to Resume Analyzer
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getAssessmentBadge = (assessment: string) => {
    const badges: any = {
      'good': { bg: 'bg-green-100', text: 'text-green-800', label: 'Strong Resume' },
      'average': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Good Foundation' },
      'needs improvement': { bg: 'bg-red-100', text: 'text-red-800', label: 'Needs Work' }
    };
    const badge = badges[assessment.toLowerCase()] || badges['average'];
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50\">
      {/* Navigation */}
      <nav className=\"bg-white border-b border-gray-200 shadow-sm\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex justify-between items-center h-16\">
            <Link href=\"/resume-analyzer\" className=\"flex items-center space-x-2\">
              <div className=\"w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center\">
                <FileText className=\"w-6 h-6 text-white\" />
              </div>
              <span className=\"text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent\">
                Resume Analysis
              </span>
            </Link>
            
            <Link
              href=\"/dashboard\"
              className=\"flex items-center text-gray-700 hover:text-green-600 text-sm font-medium transition-colors\"
            >
              <ArrowLeft className=\"w-4 h-4 mr-1\" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className=\"max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12\">
        {/* Header */}
        <div className=\"text-center mb-10\">
          <div className=\"inline-flex items-center space-x-3 mb-4\">
            {getAssessmentBadge(analysis.overallAssessment)}
          </div>
          <h1 className=\"text-4xl font-bold text-gray-900 mb-3\">Resume Analysis Report</h1>
          <p className=\"text-lg text-gray-600\">
            {analysis.targetRole}
            {analysis.targetCompany && ` at ${analysis.targetCompany}`}
          </p>
          <p className=\"text-sm text-gray-500 mt-2\">
            Analyzed on {new Date(analysis.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* ATS Score - Hero Section */}
        <div className=\"bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-xl\">
          <div className=\"flex items-center justify-between mb-6\">
            <div>
              <h2 className=\"text-2xl font-bold mb-2\">ATS Compatibility Score</h2>
              <p className=\"text-green-100\">{analysis.summary}</p>
            </div>
            <div className=\"flex items-center justify-center w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/30\">
              <div className=\"text-center\">
                <div className=\"text-5xl font-bold\">{analysis.atsScore}</div>
                <div className=\"text-sm opacity-90\">{getScoreLabel(analysis.atsScore)}</div>
              </div>
            </div>
          </div>
          
          {/* ATS Breakdown */}
          {analysis.atsAnalysis && (
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
              <div className=\"bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20\">
                <div className=\"flex items-center justify-between mb-2\">
                  <span className=\"text-sm font-medium\">Keywords</span>
                  <span className=\"text-lg font-bold\">{analysis.atsAnalysis.keywords.score}%</span>
                </div>
                <div className=\"w-full bg-white/20 rounded-full h-2\">
                  <div
                    className=\"bg-white rounded-full h-2 transition-all\"
                    style={{ width: `${analysis.atsAnalysis.keywords.score}%` }}
                  />
                </div>
              </div>
              
              <div className=\"bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20\">
                <div className=\"flex items-center justify-between mb-2\">
                  <span className=\"text-sm font-medium\">Formatting</span>
                  <span className=\"text-lg font-bold\">{analysis.atsAnalysis.formatting.score}%</span>
                </div>
                <div className=\"w-full bg-white/20 rounded-full h-2\">
                  <div
                    className=\"bg-white rounded-full h-2 transition-all\"
                    style={{ width: `${analysis.atsAnalysis.formatting.score}%` }}
                  />
                </div>
              </div>
              
              <div className=\"bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20\">
                <div className=\"flex items-center justify-between mb-2\">
                  <span className=\"text-sm font-medium\">Sections</span>
                  <span className=\"text-lg font-bold\">{analysis.atsAnalysis.sections.score}%</span>
                </div>
                <div className=\"w-full bg-white/20 rounded-full h-2\">
                  <div
                    className=\"bg-white rounded-full h-2 transition-all\"
                    style={{ width: `${analysis.atsAnalysis.sections.score}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Wins */}
        {analysis.quickWins && analysis.quickWins.length > 0 && (
          <div className=\"bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8\">
            <div className=\"flex items-start space-x-3 mb-4\">
              <Zap className=\"w-6 h-6 text-yellow-600 mt-1 flex-shrink-0\" />
              <div className=\"flex-1\">
                <h3 className=\"text-xl font-bold text-gray-900 mb-2\">Quick Wins - Immediate Improvements</h3>
                <p className=\"text-gray-700 text-sm mb-4\">Make these changes today for instant impact:</p>
                <div className=\"space-y-2\">
                  {analysis.quickWins.map((win: string, index: number) => (
                    <div key={index} className=\"flex items-start space-x-3 bg-white rounded-lg p-3\">
                      <div className=\"w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm\">
                        {index + 1}
                      </div>
                      <p className=\"text-gray-800 flex-1\">{win}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strengths and Weaknesses */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-8 mb-8\">
          {/* Strengths */}
          <div className=\"bg-green-50 rounded-2xl border border-green-200 p-6\">
            <div className=\"flex items-center space-x-2 mb-4\">
              <CheckCircle className=\"w-6 h-6 text-green-600\" />
              <h3 className=\"text-xl font-bold text-gray-900\">Strengths</h3>
            </div>
            <ul className=\"space-y-3\">
              {analysis.strengths.map((strength: string, index: number) => (
                <li key={index} className=\"flex items-start space-x-2\">
                  <Award className=\"w-5 h-5 text-green-600 mt-0.5 flex-shrink-0\" />
                  <span className=\"text-gray-800\">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className=\"bg-orange-50 rounded-2xl border border-orange-200 p-6\">
            <div className=\"flex items-center space-x-2 mb-4\">
              <AlertCircle className=\"w-6 h-6 text-orange-600\" />
              <h3 className=\"text-xl font-bold text-gray-900\">Areas for Improvement</h3>
            </div>
            <ul className=\"space-y-3\">
              {analysis.weaknesses.map((weakness: string, index: number) => (
                <li key={index} className=\"flex items-start space-x-2\">
                  <TrendingUp className=\"w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0\" />
                  <span className=\"text-gray-800\">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Role-Specific Feedback */}
        {analysis.roleSpecificFeedback && (
          <div className=\"bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8\">
            <div className=\"flex items-start space-x-3 mb-6\">
              <Target className=\"w-6 h-6 text-indigo-600 mt-1 flex-shrink-0\" />
              <div className=\"flex-1\">
                <h3 className=\"text-xl font-bold text-gray-900 mb-4\">Role-Specific Analysis for {analysis.targetRole}</h3>
                
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6\">
                  <div>
                    <h4 className=\"font-semibold text-gray-900 mb-2\">Relevance Score</h4>
                    <div className=\"flex items-center space-x-3\">
                      <div className=\"flex-1 bg-gray-200 rounded-full h-3\">
                        <div
                          className=\"bg-indigo-600 rounded-full h-3 transition-all\"
                          style={{ width: `${analysis.roleSpecificFeedback.relevance}%` }}
                        />
                      </div>
                      <span className=\"text-lg font-bold text-gray-900\">{analysis.roleSpecificFeedback.relevance}%</span>
                    </div>
                  </div>
                </div>

                {analysis.roleSpecificFeedback.keySkillsMatch && analysis.roleSpecificFeedback.keySkillsMatch.length > 0 && (
                  <div className=\"mb-4\">
                    <h4 className=\"font-semibold text-gray-900 mb-2\">✓ Matching Skills:</h4>
                    <div className=\"flex flex-wrap gap-2\">
                      {analysis.roleSpecificFeedback.keySkillsMatch.map((skill: string, index: number) => (
                        <span key={index} className=\"px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium\">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.roleSpecificFeedback.missingSkills && analysis.roleSpecificFeedback.missingSkills.length > 0 && (
                  <div className=\"mb-4\">
                    <h4 className=\"font-semibold text-gray-900 mb-2\">⚠ Missing Important Skills:</h4>
                    <div className=\"flex flex-wrap gap-2\">
                      {analysis.roleSpecificFeedback.missingSkills.map((skill: string, index: number) => (
                        <span key={index} className=\"px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium\">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className=\"bg-indigo-50 rounded-lg p-4 mb-4\">
                  <p className=\"text-gray-800\"><strong>Experience Alignment:</strong> {analysis.roleSpecificFeedback.experienceAlignment}</p>
                </div>

                {analysis.roleSpecificFeedback.recommendations && analysis.roleSpecificFeedback.recommendations.length > 0 && (
                  <div>
                    <h4 className=\"font-semibold text-gray-900 mb-3\">Recommendations:</h4>
                    <ul className=\"space-y-2\">
                      {analysis.roleSpecificFeedback.recommendations.map((rec: string, index: number) => (
                        <li key={index} className=\"flex items-start space-x-2\">
                          <ArrowRight className=\"w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0\" />
                          <span className=\"text-gray-700\">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Suggestions */}
        {analysis.detailedSuggestions && (
          <div className=\"bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8\">
            <h3 className=\"text-xl font-bold text-gray-900 mb-6\">Detailed Improvement Suggestions</h3>
            
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
              {analysis.detailedSuggestions.content && (
                <div className=\"bg-blue-50 rounded-lg p-4\">
                  <h4 className=\"font-semibold text-gray-900 mb-3 flex items-center\">
                    <FileText className=\"w-5 h-5 mr-2 text-blue-600\" />
                    Content Improvements
                  </h4>
                  <ul className=\"space-y-2\">
                    {analysis.detailedSuggestions.content.map((suggestion: string, index: number) => (
                      <li key={index} className=\"text-sm text-gray-700 flex items-start\">
                        <span className=\"mr-2\">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.detailedSuggestions.formatting && (
                <div className=\"bg-purple-50 rounded-lg p-4\">
                  <h4 className=\"font-semibold text-gray-900 mb-3 flex items-center\">
                    <Target className=\"w-5 h-5 mr-2 text-purple-600\" />
                    Formatting Tips
                  </h4>
                  <ul className=\"space-y-2\">
                    {analysis.detailedSuggestions.formatting.map((suggestion: string, index: number) => (
                      <li key={index} className=\"text-sm text-gray-700 flex items-start\">
                        <span className=\"mr-2\">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.detailedSuggestions.keywords && (
                <div className=\"bg-green-50 rounded-lg p-4\">
                  <h4 className=\"font-semibold text-gray-900 mb-3 flex items-center\">
                    <Zap className=\"w-5 h-5 mr-2 text-green-600\" />
                    Keyword Optimization
                  </h4>
                  <ul className=\"space-y-2\">
                    {analysis.detailedSuggestions.keywords.map((suggestion: string, index: number) => (
                      <li key={index} className=\"text-sm text-gray-700 flex items-start\">
                        <span className=\"mr-2\">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.detailedSuggestions.impact && (
                <div className=\"bg-orange-50 rounded-lg p-4\">
                  <h4 className=\"font-semibold text-gray-900 mb-3 flex items-center\">
                    <TrendingUp className=\"w-5 h-5 mr-2 text-orange-600\" />
                    Impact Enhancement
                  </h4>
                  <ul className=\"space-y-2\">
                    {analysis.detailedSuggestions.impact.map((suggestion: string, index: number) => (
                      <li key={index} className=\"text-sm text-gray-700 flex items-start\">
                        <span className=\"mr-2\">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {analysis.nextSteps && analysis.nextSteps.length > 0 && (
          <div className=\"bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8\">
            <div className=\"flex items-start space-x-3 mb-6\">
              <Lightbulb className=\"w-6 h-6 text-amber-600 mt-1 flex-shrink-0\" />
              <div className=\"flex-1\">
                <h3 className=\"text-xl font-bold text-gray-900 mb-4\">Your Action Plan</h3>
                <p className=\"text-gray-600 mb-4\">Follow these steps to significantly improve your resume:</p>
                <div className=\"space-y-3\">
                  {analysis.nextSteps.map((step: string, index: number) => (
                    <div key={index} className=\"flex items-start space-x-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200\">
                      <div className=\"w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold\">
                        {index + 1}
                      </div>
                      <p className=\"text-gray-800 flex-1 pt-1\">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">
          <Link
            href=\"/resume-analyzer\"
            className=\"inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all\"
          >
            Analyze Another Resume
          </Link>
          <Link
            href=\"/create\"
            className=\"inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all\"
          >
            Practice Interview
          </Link>
          <Link
            href=\"/dashboard\"
            className=\"inline-flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:shadow-md transition-all\"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
