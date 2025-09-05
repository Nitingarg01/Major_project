import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import FreeLLMService from '@/lib/freeLLMService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const db = client.db();
    
    // Get interview details
    const interview = await db.collection('interviews').findOne({
      _id: new ObjectId(interviewId)
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Get questions and answers
    const questionData = await db.collection('questions').findOne({
      interviewId: interviewId
    });

    if (!questionData || !questionData.answers) {
      return NextResponse.json(
        { error: 'Interview not completed or answers not found' },
        { status: 404 }
      );
    }

    console.log(`🔍 Analyzing interview performance for ${interview.companyName} ${interview.jobTitle} using FREE LLMs...`);

    const freeLLMService = FreeLLMService.getInstance();
    
    // Analyze each question-answer pair
    const questionAnalyses = [];
    const questions = questionData.questions || [];
    const answers = questionData.answers || [];

    for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
      const question = questions[i];
      const answerObj = answers[i];
      const userAnswer = answerObj?.answer || '';

      try {
        const analysis = await freeLLMService.analyzeInterviewResponse(
          question.question,
          userAnswer,
          question.expectedAnswer,
          question.category,
          `${interview.companyName} ${interview.jobTitle}`
        );

        questionAnalyses.push({
          questionId: question.id,
          question: question.question,
          category: question.category,
          difficulty: question.difficulty,
          userAnswer: userAnswer,
          analysis: analysis,
          points: question.points || 10,
          maxPoints: question.points || 10
        });
      } catch (error) {
        console.error(`Error analyzing question ${i}:`, error);
        // Add fallback analysis
        questionAnalyses.push({
          questionId: question.id,
          question: question.question,
          category: question.category,
          difficulty: question.difficulty,
          userAnswer: userAnswer,
          analysis: {
            score: Math.min(10, Math.max(3, userAnswer.split(' ').length / 10)),
            feedback: 'Basic analysis completed.',
            suggestions: ['Provide more detailed answers'],
            strengths: ['Attempted the question'],
            improvements: ['Add more specific examples']
          },
          points: question.points || 10,
          maxPoints: question.points || 10
        });
      }
    }

    // Calculate overall performance metrics
    const totalScore = questionAnalyses.reduce((sum, qa) => sum + qa.analysis.score, 0);
    const averageScore = questionAnalyses.length > 0 ? totalScore / questionAnalyses.length : 0;
    const maxPossibleScore = questionAnalyses.reduce((sum, qa) => sum + 10, 0);
    const percentageScore = (totalScore / maxPossibleScore) * 100;

    // Calculate category-wise performance
    const categoryPerformance: { [key: string]: { total: number; count: number; average: number } } = {};
    questionAnalyses.forEach(qa => {
      if (!categoryPerformance[qa.category]) {
        categoryPerformance[qa.category] = { total: 0, count: 0, average: 0 };
      }
      categoryPerformance[qa.category].total += qa.analysis.score;
      categoryPerformance[qa.category].count += 1;
    });

    Object.keys(categoryPerformance).forEach(category => {
      const cat = categoryPerformance[category];
      cat.average = cat.total / cat.count;
    });

    // Aggregate strengths and improvements
    const allStrengths = questionAnalyses.flatMap(qa => qa.analysis.strengths);
    const allImprovements = questionAnalyses.flatMap(qa => qa.analysis.improvements);
    const allSuggestions = questionAnalyses.flatMap(qa => qa.analysis.suggestions);

    // Generate overall performance report using Free LLM
    let overallFeedback = '';
    let recommendations: string[] = [];
    try {
      const overallAnalysisResponse = await freeLLMService.callLLM({
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview performance analyst providing comprehensive feedback.'
          },
          {
            role: 'user',
            content: `
              Analyze this overall interview performance:
              
              Company: ${interview.companyName}
              Position: ${interview.jobTitle}
              Average Score: ${averageScore.toFixed(1)}/10
              Percentage: ${percentageScore.toFixed(1)}%
              Total Questions: ${questionAnalyses.length}
              
              Category Performance:
              ${Object.entries(categoryPerformance).map(([cat, perf]) => 
                `${cat}: ${perf.average.toFixed(1)}/10 (${perf.count} questions)`
              ).join('\n')}
              
              Common Strengths: ${[...new Set(allStrengths)].slice(0, 5).join(', ')}
              Common Improvements: ${[...new Set(allImprovements)].slice(0, 5).join(', ')}
              
              Provide:
              1. Overall feedback paragraph
              2. Top 5 recommendations for improvement
              
              Return as JSON:
              {
                "overallFeedback": "comprehensive feedback paragraph",
                "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"]
              }
            `
          }
        ],
        model: 'llama-3.1-8b'
      });

      const overallAnalysis = JSON.parse(overallAnalysisResponse.content);
      overallFeedback = overallAnalysis.overallFeedback || 'Performance analysis completed.';
      recommendations = overallAnalysis.recommendations || [];
    } catch (error) {
      console.error('Error generating overall feedback:', error);
      overallFeedback = `Your interview performance shows an average score of ${averageScore.toFixed(1)}/10. Focus on improving weaker areas while maintaining your strengths.`;
      recommendations = [
        'Practice more technical questions',
        'Improve communication clarity',
        'Add more specific examples',
        'Study the company culture',
        'Work on time management'
      ];
    }

    // Create comprehensive performance report
    const performanceReport = {
      interviewId: interviewId,
      companyName: interview.companyName,
      jobTitle: interview.jobTitle,
      analysisMetrics: {
        totalQuestions: questionAnalyses.length,
        averageScore: parseFloat(averageScore.toFixed(2)),
        percentageScore: parseFloat(percentageScore.toFixed(2)),
        totalScore: totalScore,
        maxPossibleScore: maxPossibleScore
      },
      categoryPerformance: Object.entries(categoryPerformance).reduce((acc, [cat, perf]) => {
        acc[cat] = {
          average: parseFloat(perf.average.toFixed(2)),
          questionsCount: perf.count,
          totalScore: perf.total
        };
        return acc;
      }, {} as any),
      overallFeedback: overallFeedback,
      recommendations: recommendations,
      questionAnalyses: questionAnalyses,
      aggregatedInsights: {
        topStrengths: [...new Set(allStrengths)].slice(0, 5),
        keyImprovements: [...new Set(allImprovements)].slice(0, 5),
        commonSuggestions: [...new Set(allSuggestions)].slice(0, 5)
      },
      metadata: {
        analyzedAt: new Date(),
        aiService: 'free-llm-service',
        analysisProvider: 'multiple-free-providers',
        detailedAnalysis: true
      }
    };

    // Store performance analysis
    await db.collection('performance_reports').insertOne(performanceReport);

    // Update interview status
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { 
        $set: { 
          status: 'analyzed',
          performanceScore: averageScore,
          analyzedAt: new Date()
        } 
      }
    );

    console.log(`✅ Performance analysis completed using FREE LLMs - Score: ${averageScore.toFixed(1)}/10`);

    return NextResponse.json({
      message: 'Performance analysis completed successfully with FREE LLM Services',
      analysis: performanceReport,
      summary: {
        score: `${averageScore.toFixed(1)}/10`,
        percentage: `${percentageScore.toFixed(1)}%`,
        questionsAnalyzed: questionAnalyses.length,
        provider: 'free-llm-service'
      }
    });

  } catch (error) {
    console.error('Error analyzing performance with free LLMs:', error);
    return NextResponse.json(
      { error: 'Failed to analyze performance: ' + error },
      { status: 500 }
    );
  }
}