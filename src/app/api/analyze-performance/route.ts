/**
 * Enhanced Overall Performance Analysis API
 * Uses Enhanced Groq AI Service for comprehensive interview evaluation
 * Replaced legacy Emergent AI with optimized Groq integration
 */

import { NextRequest, NextResponse } from 'next/server';
import EnhancedGroqAIService from '@/lib/enhancedGroqAIService';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    console.log('📊 Enhanced Performance Analysis API called');
    
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      questions = [],
      answers = [],
      jobTitle = 'Software Engineer',
      companyName = 'Technology Company',
      skills = [],
      interviewType = 'mixed',
      experienceLevel = 'mid'
    } = body;

    // Validate required fields
    if (!questions.length || !answers.length) {
      return NextResponse.json(
        { error: 'Questions and answers are required for analysis' },
        { status: 400 }
      );
    }

    if (questions.length !== answers.length) {
      return NextResponse.json(
        { error: 'Number of questions and answers must match' },
        { status: 400 }
      );
    }

    console.log(`🎯 Analyzing interview performance for ${jobTitle} at ${companyName}`);
    console.log(`📝 Interview details: ${questions.length} questions, ${interviewType} type, ${experienceLevel} level`);
    console.log(`🛠️ Required skills: ${skills.join(', ')}`);

    // Initialize Enhanced Groq AI Service
    const aiService = EnhancedGroqAIService.getInstance();

    try {
      // Prepare questions with enhanced metadata
      const enhancedQuestions = questions.map((q, index) => ({
        ...q,
        userAnswer: answers[index] || '',
        answerLength: (answers[index] || '').length,
        wordCount: (answers[index] || '').split(' ').length
      }));

      // Calculate basic statistics
      const stats = {
        totalQuestions: questions.length,
        answeredQuestions: answers.filter(ans => ans && ans.trim().length > 0).length,
        averageAnswerLength: answers.reduce((sum, ans) => sum + (ans || '').length, 0) / answers.length,
        averageWordCount: answers.reduce((sum, ans) => sum + (ans || '').split(' ').length, 0) / answers.length,
        categoryDistribution: {
          technical: questions.filter(q => q.category === 'technical').length,
          behavioral: questions.filter(q => q.category === 'behavioral').length,
          dsa: questions.filter(q => q.category === 'dsa').length,
          aptitude: questions.filter(q => q.category === 'aptitude').length,
          system_design: questions.filter(q => q.category === 'system_design').length
        }
      };

      console.log(`📈 Basic stats: ${stats.answeredQuestions}/${stats.totalQuestions} answered, avg ${stats.averageWordCount.toFixed(1)} words per answer`);

      // Perform individual question analysis for detailed feedback
      const individualAnalyses = [];
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] && answers[i].trim().length > 0) {
          try {
            const analysis = await aiService.analyzeInterviewResponse(
              questions[i].question,
              answers[i],
              questions[i].expectedAnswer || 'Comprehensive answer expected',
              questions[i].category || 'technical',
              companyName
            );
            
            individualAnalyses.push({
              questionIndex: i,
              questionId: questions[i].id,
              analysis: analysis
            });
          } catch (analysisError) {
            console.error(`⚠️ Failed to analyze question ${i + 1}:`, analysisError);
            // Continue with other questions
          }
        }
      }

      // Calculate aggregate scores from individual analyses
      const aggregateScores = individualAnalyses.length > 0 ? {
        averageScore: individualAnalyses.reduce((sum, a) => sum + a.analysis.score, 0) / individualAnalyses.length,
        averageCompanyFit: individualAnalyses.reduce((sum, a) => sum + a.analysis.companyFit, 0) / individualAnalyses.length,
        totalStrengths: [...new Set(individualAnalyses.flatMap(a => a.analysis.strengths))],
        totalImprovements: [...new Set(individualAnalyses.flatMap(a => a.analysis.improvements))],
        allSuggestions: [...new Set(individualAnalyses.flatMap(a => a.analysis.suggestions))]
      } : null;

      // Generate comprehensive overall analysis
      const overallAnalysis = await generateOverallAnalysis(
        enhancedQuestions,
        answers,
        jobTitle,
        companyName,
        skills,
        stats,
        aggregateScores,
        aiService
      );

      console.log(`✅ Performance analysis completed - Overall Score: ${overallAnalysis.overallScore}/10`);

      // Store performance analysis in database
      try {
        const { db } = await connectToDatabase();
        const performanceData = {
          userId: session.user?.email || session.user?.name,
          jobTitle,
          companyName,
          skills,
          interviewType,
          experienceLevel,
          questions: questions.map(q => ({ id: q.id, question: q.question, category: q.category })),
          answers,
          individualAnalyses,
          overallAnalysis,
          stats,
          createdAt: new Date(),
          aiProvider: 'enhanced-groq',
          version: '2.0'
        };

        await db.collection('performance_analyses').insertOne(performanceData);
        console.log('💾 Performance analysis stored in database');
      } catch (dbError) {
        console.error('⚠️ Database storage failed:', dbError);
        // Continue anyway - analysis succeeded
      }

      return NextResponse.json({
        success: true,
        analysis: {
          overall: overallAnalysis,
          individual: individualAnalyses,
          statistics: stats,
          aggregate: aggregateScores,
          metadata: {
            jobTitle,
            companyName,
            skills,
            interviewType,
            experienceLevel,
            analyzedAt: new Date().toISOString(),
            aiProvider: 'enhanced-groq',
            analysisVersion: '2.0',
            totalQuestions: questions.length,
            questionsAnalyzed: individualAnalyses.length
          }
        }
      });

    } catch (aiError) {
      console.error('❌ AI Analysis Error:', aiError);
      
      // Generate fallback analysis
      const fallbackAnalysis = generateFallbackAnalysis(
        questions,
        answers,
        jobTitle,
        companyName,
        skills
      );

      return NextResponse.json({
        success: true,
        analysis: {
          overall: fallbackAnalysis,
          individual: [],
          statistics: {
            totalQuestions: questions.length,
            answeredQuestions: answers.filter(ans => ans && ans.trim().length > 0).length,
            averageAnswerLength: answers.reduce((sum, ans) => sum + (ans || '').length, 0) / answers.length,
            averageWordCount: answers.reduce((sum, ans) => sum + (ans || '').split(' ').length, 0) / answers.length
          },
          metadata: {
            jobTitle,
            companyName,
            skills,
            interviewType,
            experienceLevel,
            analyzedAt: new Date().toISOString(),
            aiProvider: 'fallback',
            note: 'Generated using fallback due to AI service unavailability'
          }
        }
      });
    }

  } catch (error) {
    console.error('❌ Enhanced Performance Analysis API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze performance', 
        details: error instanceof Error ? error.message : 'Unknown error',
        aiProvider: 'enhanced-groq'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate comprehensive overall analysis
async function generateOverallAnalysis(
  questions: any[],
  answers: string[],
  jobTitle: string,
  companyName: string,
  skills: string[],
  stats: any,
  aggregateScores: any,
  aiService: EnhancedGroqAIService
) {
  try {
    const systemMessage = `You are a senior technical interviewer and hiring manager at ${companyName} conducting a comprehensive performance evaluation for a ${jobTitle} position. Provide detailed, actionable feedback that reflects ${companyName}'s hiring standards and culture.`;
    
    const userMessage = `Analyze this complete interview performance for ${jobTitle} at ${companyName}:;

INTERVIEW OVERVIEW:
- Position: ${jobTitle} at ${companyName}
- Required Skills: ${skills.join(', ')}
- Total Questions: ${stats.totalQuestions}
- Questions Answered: ${stats.answeredQuestions}
- Average Answer Length: ${stats.averageWordCount.toFixed(1)} words

QUESTION BREAKDOWN:
${stats.categoryDistribution ? Object.entries(stats.categoryDistribution).map(([category, count]) => 
  `- ${category}: ${count} questions`).join('\n') : ''}

${aggregateScores ? `
INDIVIDUAL QUESTION PERFORMANCE:
- Average Score: ${aggregateScores.averageScore.toFixed(1)}/10
- Company Fit Score: ${aggregateScores.averageCompanyFit.toFixed(1)}/10
- Common Strengths: ${aggregateScores.totalStrengths.slice(0, 5).join(', ')}
- Key Improvement Areas: ${aggregateScores.totalImprovements.slice(0, 5).join(', ')}
` : ''}

DETAILED Q&A ANALYSIS:
${questions.slice(0, 8).map((q, index) => `
Q${index + 1} [${q.category || 'general'}]: ${q.question.substring(0, 150)}...
Answer (${answers[index]?.split(' ').length || 0} words): ${answers[index]?.substring(0, 200) || 'No answer provided'}...
`).join('\n')}

Provide comprehensive evaluation with ${companyName}'s specific standards and culture in mind.

Return ONLY valid JSON:
{
  "overallScore": (0-10 overall performance score),
  "parameterScores": {
    "Technical Knowledge": (0-10),
    "Problem Solving": (0-10),
    "Communication Skills": (0-10),
    "Company Culture Fit": (0-10),
    "Practical Application": (0-10)
  },
  "overallVerdict": "2-3 sentence professional summary of performance with ${companyName} context",
  "adviceForImprovement": [
    {
      "question": "Question topic or area",
      "advice": "Specific, actionable improvement advice for ${companyName} interviews"
    }
  ],
  "strengths": ["key strengths demonstrated", "company-relevant positives"],
  "improvements": ["priority improvement areas for ${companyName}", "specific skills to develop"],
  "recommendations": ["career development recommendations", "preparation suggestions for ${companyName}"],
  "hiringRecommendation": "Strong Hire|Hire|No Hire|Strong No Hire",
  "confidenceLevel": (0-10 confidence in this assessment)
}`;

    const response = await aiService.callGroqAPI({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 6000,
      temperature: 0.3
    });

    const analysis = JSON.parse(response);
    
    return {
      ...analysis,
      metadata: {
        analysisMethod: 'enhanced-groq',
        individualQuestionsAnalyzed: aggregateScores ? true : false,
        aggregateScoresUsed: !!aggregateScores
      }
    };
    
  } catch (error) {
    console.error('❌ Error generating overall analysis:', error);
    return generateFallbackOverallAnalysis(questions, answers, companyName, stats);
  }
}

// Fallback analysis generation
function generateFallbackAnalysis(
  questions: any[],
  answers: string[],
  jobTitle: string,
  companyName: string,
  skills: string[]
) {
  const avgWordCount = answers.reduce((sum, ans) => sum + (ans || '').split(' ').length, 0) / answers.length;
  const score = Math.min(10, Math.max(4, avgWordCount / 20));
  const answeredCount = answers.filter(ans => ans && ans.trim().length > 0).length;
  const completionRate = answeredCount / questions.length;
  
  return {
    overallScore: Math.round((score * completionRate) * 10) / 10,
    parameterScores: {
      "Technical Knowledge": Math.min(10, Math.round((score + 1) * 10) / 10),
      "Problem Solving": Math.round(score * 10) / 10,
      "Communication Skills": Math.min(10, Math.round((score + 0.5) * 10) / 10),
      "Company Culture Fit": Math.max(3, Math.round((score - 0.5) * 10) / 10),
      "Practical Application": Math.round(score * 10) / 10
    },
    overallVerdict: `The candidate demonstrated ${score >= 7 ? 'strong' : score >= 5 ? 'adequate' : 'developing'} performance for the ${jobTitle} position at ${companyName}. Completed ${answeredCount}/${questions.length} questions with ${score >= 6 ? 'good' : 'basic'} technical depth.`,
    adviceForImprovement: questions.slice(0, 3).map((q, i) => ({
      question: q.question?.substring(0, 50) + '...' || `Question ${i + 1}`,
      advice: `For ${companyName}, provide more detailed technical explanations with specific examples and company-relevant context.`
    })),
    strengths: [
      `Completed ${answeredCount} out of ${questions.length} questions`,
      avgWordCount > 30 ? 'Provided detailed responses' : 'Attempted all questions',
      'Maintained professional communication'
    ],
    improvements: [
      `Study ${companyName}'s specific technologies and recent developments`,
      'Practice detailed technical explanations',
      'Prepare company-specific examples and scenarios'
    ],
    recommendations: [
      `Research ${companyName}'s engineering blog and recent projects`,
      `Practice technical interviews focusing on ${skills.slice(0, 3).join(', ')}`,
      'Work on communication skills for technical concepts'
    ],
    hiringRecommendation: score >= 7 ? 'Hire' : score >= 5 ? 'Maybe' : 'No Hire',
    confidenceLevel: 6
  };
}

function generateFallbackOverallAnalysis(questions: any[], answers: string[], companyName: string, stats: any) {
  const avgWordCount = stats.averageWordCount;
  const score = Math.min(10, Math.max(4, avgWordCount / 20));
  
  return {
    overallScore: score,
    parameterScores: {
      "Technical Knowledge": Math.min(10, score + 1),
      "Problem Solving": score,
      "Communication Skills": Math.min(10, score + 0.5),
      "Company Culture Fit": Math.max(3, score - 0.5),
      "Practical Application": score
    },
    overallVerdict: `Performance analysis completed. ${score >= 7 ? 'Strong candidate' : score >= 5 ? 'Acceptable performance' : 'Needs improvement'} for ${companyName} standards.`,
    adviceForImprovement: [],
    strengths: ['Completed interview', 'Professional engagement'],
    improvements: ['Technical depth', 'Communication clarity'],
    recommendations: ['Continue practicing', 'Study company requirements'],
    hiringRecommendation: score >= 6 ? 'Consider' : 'Review',
    confidenceLevel: 5
  };
}

export async function GET() {
  return NextResponse.json({
    message: 'Enhanced Overall Performance Analysis API',
    aiProvider: 'enhanced-groq',
    features: [
      'Comprehensive interview evaluation',
      'Company-specific assessment criteria',
      'Individual question analysis',
      'Aggregate performance scoring',
      'Detailed improvement recommendations',
      'Hiring decision guidance',
      'Cultural fit evaluation',
      'Technical depth assessment'
    ],
    analysisParameters: [
      'Technical Knowledge',
      'Problem Solving',
      'Communication Skills',
      'Company Culture Fit',
      'Practical Application'
    ]
  });
}