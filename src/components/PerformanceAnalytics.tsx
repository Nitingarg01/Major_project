'use client'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { InterviewPerformance, InterviewRound } from '@/types/interview';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Award,
  Brain,
  Users,
  Code,
  Lightbulb
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';

interface PerformanceAnalyticsProps {
  performance: InterviewPerformance,
  rounds: InterviewRound[];
  companyName: string,
  jobTitle: string,
  skills: string[];
}

const PerformanceAnalytics = ({ 
  performance, 
  rounds, 
  companyName, 
  jobTitle, 
  skills 
}: PerformanceAnalyticsProps) => {
  // Calculate scores by category
  const categoryScores: {[key: string]: number} = {
    technical: 0,
    behavioral: 0,
    aptitude: 0,
    dsa: 0,
    mixed: 0
  };

  rounds.forEach(round => {
    if (round.score) {
      categoryScores[round.type] = round.score;
    }
  });

  // Prepare data for charts
  const radarData = [
    { subject: 'Technical', score: categoryScores.technical || 0, fullMark: 100 },
    { subject: 'Behavioral', score: categoryScores.behavioral || 0, fullMark: 100 },
    { subject: 'Aptitude', score: categoryScores.aptitude || 0, fullMark: 100 },
    { subject: 'DSA', score: categoryScores.dsa || 0, fullMark: 100 },
  ];

  const progressData = rounds.map((round, index) => ({
    name: round.type,
    score: round.score || 0,
    time: round.duration
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'bg-green-600' };
    if (score >= 80) return { grade: 'A', color: 'bg-green-500' };
    if (score >= 70) return { grade: 'B+', color: 'bg-blue-500' };
    if (score >= 60) return { grade: 'B', color: 'bg-blue-400' };
    if (score >= 50) return { grade: 'C+', color: 'bg-yellow-500' };
    if (score >= 40) return { grade: 'C', color: 'bg-yellow-400' };
    return { grade: 'D', color: 'bg-red-500' };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Code className="w-5 h-5" />;
      case 'behavioral': return <Users className="w-5 h-5" />;
      case 'aptitude': return <Brain className="w-5 h-5" />;
      case 'dsa': return <Lightbulb className="w-5 h-5" />,
      default: return <Target className="w-5 h-5" />
    }
  };

  const { grade, color } = getGradeFromScore(performance.totalScore);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Interview Performance Report
        </h1>
        <p className="text-lg text-gray-600">
          {companyName} - {jobTitle}
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`text-6xl font-bold px-6 py-3 rounded-lg text-white ${color}`}>
              {grade}
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-800">{performance.totalScore}%</p>
              <p className="text-gray-600">Total Score</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className={`h-4 rounded-full ${color.replace('bg-', 'bg-')}`}
              style={{ width: `${performance.totalScore}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Assessment</CardTitle>
            <CardDescription>Performance across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Round Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Round-wise Performance</CardTitle>
            <CardDescription>Score breakdown by interview rounds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Round Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Round Analysis</CardTitle>
          <CardDescription>Detailed breakdown of each interview round</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rounds.map((round, index) => (
              <div key={round.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(round.type)}
                    <h3 className="font-semibold capitalize">{round.type} Round</h3>
                  </div>
                  <Badge className={getScoreColor(round.score || 0)}>
                    {round.score || 0}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions:</span>
                    <span>{round.questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span>{round.duration} min</span>
                  </div>
                  <Progress value={round.score || 0} className="h-2" />
                  {round.feedback && (
                    <p className="text-xs text-gray-600 mt-2">{round.feedback}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performance.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performance.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performance.recommendations.map((recommendation, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Monitoring Report */}
      {performance.anomalousActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Interview Monitoring Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg border ${
              performance.anomalousActivity.riskLevel === 'high';
                ? 'bg-red-50 border-red-200' 
                : performance.anomalousActivity.riskLevel === 'medium';
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={
                  performance.anomalousActivity.riskLevel === 'high' ? 'destructive' :;
                  performance.anomalousActivity.riskLevel === 'medium' ? 'secondary' : 'default'
                }>
                  {performance.anomalousActivity.riskLevel.toUpperCase()} RISK
                </Badge>
                <span className="text-sm font-medium">
                  {performance.anomalousActivity.detected ? 'Issues Detected' : 'No Issues'}
                </span>
              </div>
              {performance.anomalousActivity.concerns.length > 0 && (
                <ul className="text-sm space-y-1">
                  {performance.anomalousActivity.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                      {concern}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{performance.overallFeedback}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;