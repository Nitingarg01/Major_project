'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Building2, 
  TrendingUp, 
  Target, 
  Users, 
  Briefcase, 
  Award,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Brain,
  Clock,
  Shield,
  Lightbulb,
  BookOpen,
  Zap
} from 'lucide-react'
import { Button } from './ui/button';

interface CompanyInsights {
  companyName: string,
  readinessScore: number,
  strengths: string[];
  improvements: string[];
  companySpecificTips: string[];
  interviewIntelligence: {
    averageRounds: number,
    expectedDifficulty: string,
    keyFocusAreas: string[];
    culturalValues: string[];
    techStack: string[];
    recentNews: string[];
  };
  preparationMetrics: {
    technicalReadiness: number,
    behavioralReadiness: number,
    companyKnowledge: number,
    culturalFit: number
  };
  confidenceBuilder: {
    completedMockInterviews: number,
    averageScore: number,
    improvementTrend: number,
    readyForRealInterview: boolean
  };
}

interface CompanyPreparationDashboardProps {
  companyInsights: CompanyInsights;
  interviewResults?: any[];
  onStartNewInterview: () => void,
  onViewDetailedFeedback: () => void
}

const CompanyPreparationDashboard = ({ 
  companyInsights, 
  interviewResults,
  onStartNewInterview,
  onViewDetailedFeedback
}: CompanyPreparationDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getReadinessColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getReadinessMessage = (score: number) => {
    if (score >= 85) return '🎉 You\'re ready to interview with confidence!';
    if (score >= 70) return '👍 Almost ready! A bit more practice will get you there.';
    if (score >= 50) return '📈 Good foundation, but needs more preparation.';
    return '📚 Significant preparation needed before interviewing.';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {companyInsights.companyName} Interview Preparation
              </h1>
              <p className="text-gray-600">Your personalized preparation dashboard</p>
            </div>
          </div>
          <div className={`text-center p-4 rounded-lg border-2 ${getReadinessColor(companyInsights.readinessScore)}`}>
            <div className="text-3xl font-bold">{companyInsights.readinessScore}/100</div>
            <div className="text-sm font-medium">Readiness Score</div>
          </div>
        </div>

        {/* Readiness Message */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
          <p className="text-lg font-medium text-gray-700">
            {getReadinessMessage(companyInsights.readinessScore)}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button onClick={onStartNewInterview} className="bg-blue-600 hover:bg-blue-700">
            <Zap className="w-4 h-4 mr-2" />
            Start New Mock Interview
          </Button>
          <Button variant="outline" onClick={onViewDetailedFeedback}>
            <BookOpen className="w-4 h-4 mr-2" />
            View Detailed Feedback
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intelligence">Company Intel</TabsTrigger>
          <TabsTrigger value="preparation">Preparation Plan</TabsTrigger>
          <TabsTrigger value="confidence">Confidence Builder</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Preparation Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Technical Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {companyInsights.preparationMetrics.technicalReadiness}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(companyInsights.preparationMetrics.technicalReadiness)}`}
                    style={{ width: `${companyInsights.preparationMetrics.technicalReadiness}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Behavioral Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {companyInsights.preparationMetrics.behavioralReadiness}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(companyInsights.preparationMetrics.behavioralReadiness)}`}
                    style={{ width: `${companyInsights.preparationMetrics.behavioralReadiness}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Knowledge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {companyInsights.preparationMetrics.companyKnowledge}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(companyInsights.preparationMetrics.companyKnowledge)}`}
                    style={{ width: `${companyInsights.preparationMetrics.companyKnowledge}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Cultural Fit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {companyInsights.preparationMetrics.culturalFit}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(companyInsights.preparationMetrics.culturalFit)}`}
                    style={{ width: `${companyInsights.preparationMetrics.culturalFit}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companyInsights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companyInsights.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-800">{improvement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Company Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Culture & Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Culture & Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyInsights.interviewIntelligence.culturalValues.map((value, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {companyInsights.interviewIntelligence.techStack.map((tech, index) => (
                    <Badge key={index} variant="outline" className="border-purple-200 text-purple-700">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interview Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Interview Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Rounds:</span>
                    <span className="font-semibold">{companyInsights.interviewIntelligence.averageRounds}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Difficulty Level:</span>
                    <Badge variant={
                      companyInsights.interviewIntelligence.expectedDifficulty === 'hard' ? 'destructive' :;
                      companyInsights.interviewIntelligence.expectedDifficulty === 'medium' ? 'default' : 'secondary'
                    }>
                      {companyInsights.interviewIntelligence.expectedDifficulty}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">Key Focus Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {companyInsights.interviewIntelligence.keyFocusAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent News */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-yellow-600" />
                  Recent Company News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companyInsights.interviewIntelligence.recentNews.map((news, index) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <span className="text-sm text-yellow-800">{news}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preparation Plan Tab */}
        <TabsContent value="preparation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                {companyInsights.companyName}-Specific Preparation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyInsights.companySpecificTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-900 font-medium">{tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidence Builder Tab */}
        <TabsContent value="confidence" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mock Interviews Completed:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {companyInsights.confidenceBuilder.completedMockInterviews}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Score:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {companyInsights.confidenceBuilder.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Improvement Trend:</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        +{companyInsights.confidenceBuilder.improvementTrend}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Readiness Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Interview Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  {companyInsights.confidenceBuilder.readyForRealInterview ? (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-green-800">You're Ready!</h3>
                      <p className="text-green-700 text-sm">
                        Based on your performance, you're prepared to interview at {companyInsights.companyName}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-yellow-800">Keep Practicing</h3>
                      <p className="text-yellow-700 text-sm">
                        A few more practice sessions will boost your confidence for {companyInsights.companyName}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyPreparationDashboard;