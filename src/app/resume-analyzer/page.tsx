'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderFive } from '@/components/ui/loader';
import { 
  FileText, Upload, Trash2, Eye, Calendar, Target, 
  BarChart3, CheckCircle, AlertCircle, XCircle, Sparkles,
  TrendingUp, Award, Briefcase, GraduationCap, Code, Star
} from 'lucide-react'
import { toast } from 'sonner';
import Link from 'next/link';

interface ResumeAnalysis {
  id: string
  fileName: string
  targetRole: string
  overallScore: number
  breakdown: {
    structure: number
    skills: number
    experience: number  
    projects: number
    education: number
    language: number
  }
  recommendations: string[]
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  createdAt: string
}

const ResumeAnalyzer = () => {
  const [analysisHistory, setAnalysisHistory] = useState<ResumeAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');

  useEffect(() => {
    fetchAnalysisHistory();
  }, [])

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch('/api/resume-analysis-history');
      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data.analyses || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const analyzeResume = async (file: File) => {
    if (!targetRole.trim()) {
      toast.error('Please specify a target role for better analysis');
      return
    }

    setUploading(true);
    toast('🔍 Analyzing your resume...');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', targetRole);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData
      })

      const result = await response.json();

      if (response.ok) {
        setCurrentAnalysis(result.analysis);
        setAnalysisHistory(prev => [result.analysis, ...prev]);
        toast.success('✅ Resume analysis complete!');
      } else {
        toast.error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setUploading(false);
    }
  }

  const deleteAnalysis = async (id: string) => {
    try {
      const response = await fetch(`/api/resume-analysis-history/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAnalysisHistory(prev => prev.filter(analysis => analysis.id !== id));
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(null);
        }
        toast.success('Analysis deleted successfully');
      } else {
        toast.error('Failed to delete analysis');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete analysis');
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              AI Resume Analyzer
            </h1>
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get comprehensive feedback on your resume with AI-powered analysis, scoring, and role-specific recommendations
          </p>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline" className="mr-4">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <Button
              variant={activeTab === 'analyze' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analyze')}
              className="px-6"
            >
              <Upload className="w-4 h-4 mr-2" />
              Analyze Resume
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className="px-6"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Analysis History ({analysisHistory.length})
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'analyze' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card className="p-8">
                <div className="text-center mb-6">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">Upload Resume</h3>
                  <p className="text-gray-600">Get instant AI-powered analysis and feedback</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target Role <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="mb-4"
                    />
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <div className="flex flex-col items-center gap-4">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <div>
                        <label
                          htmlFor="resume-upload"
                          className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 py-3 hover:from-blue-700 hover:to-purple-700 transition font-medium"
                        >
                          {uploading ? "Analyzing..." : "Choose Resume File"}
                        </label>
                        <div className="text-sm text-gray-500 mt-2">
                          {uploading ? (
                            <div className="flex items-center gap-2 justify-center">
                              <LoaderFive />
                              Analyzing resume for {targetRole}...
                            </div>
                          ) : (
                            <div>
                              Upload PDF, DOC, or DOCX • Max 5MB
                              {fileName && <><br /><span className="text-green-600 font-medium">📄 {fileName}</span></>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileName(file.name);
                        analyzeResume(file);
                      }
                    }}
                    disabled={uploading}
                  />
                </div>
              </Card>

              {/* Analysis Results */}
              <Card className="p-8">
                {currentAnalysis ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {getScoreIcon(currentAnalysis.overallScore)}
                        <span className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(currentAnalysis.overallScore)}`}>
                          {currentAnalysis.overallScore}/100
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Analysis Results</h3>
                      <Badge variant="outline" className="mb-4">
                        {currentAnalysis.targetRole}
                      </Badge>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Score Breakdown
                      </h4>
                      
                      {Object.entries({
                        'Structure & Format': currentAnalysis.breakdown.structure,
                        'Skills & Technical': currentAnalysis.breakdown.skills,
                        'Work Experience': currentAnalysis.breakdown.experience,
                        'Projects & Achievements': currentAnalysis.breakdown.projects,
                        'Education': currentAnalysis.breakdown.education,
                        'Language Quality': currentAnalysis.breakdown.language
                      }).map(([category, score]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${(score / 25) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{score}/25</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('history')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-16">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No Analysis Yet</p>
                    <p className="text-sm">Upload a resume to see detailed analysis results</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {analysisHistory.length > 0 ? (
                <div className="grid gap-6">
                  {analysisHistory.map((analysis) => (
                    <Card key={analysis.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${getScoreColor(analysis.overallScore)}`}>
                            {getScoreIcon(analysis.overallScore)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{analysis.fileName}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {analysis.targetRole}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(analysis.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold px-3 py-1 rounded ${getScoreColor(analysis.overallScore)}`}>
                            {analysis.overallScore}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Detailed Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {/* Strengths */}
                        <div>
                          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {analysis.strengths.slice(0, 3).map((strength, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Improvements */}
                        <div>
                          <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Improvements
                          </h4>
                          <ul className="space-y-1">
                            {analysis.improvements.slice(0, 3).map((improvement, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Top Recommendations */}
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <Sparkles className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-3">Score Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {Object.entries({
                            'Structure': analysis.breakdown.structure,
                            'Skills': analysis.breakdown.skills,
                            'Experience': analysis.breakdown.experience,
                            'Projects': analysis.breakdown.projects,
                            'Education': analysis.breakdown.education,
                            'Language': analysis.breakdown.language
                          }).map(([category, score]) => (
                            <div key={category} className="text-center">
                              <div className={`text-lg font-bold px-2 py-1 rounded ${getScoreColor((score / 25) * 100)}`}>
                                {score}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{category}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-16 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Analysis History</h3>
                  <p className="text-gray-600 mb-6">Start by analyzing your first resume</p>
                  <Button onClick={() => setActiveTab('analyze')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeAnalyzer;