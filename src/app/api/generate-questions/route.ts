/**
 * Enhanced Question Generation API
 * Uses Enhanced Groq AI Service with company-specific intelligence
 * Replaced legacy Emergent AI with optimized Groq integration
 */

import { NextRequest, NextResponse } from 'next/server';
import EnhancedGroqAIService from '@/lib/enhancedGroqAIService';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Enhanced Question Generation API called');
    
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      jobTitle,
      companyName,
      skills = [],
      interviewType = 'technical',
      experienceLevel = 'mid',
      numberOfQuestions = 10,
      companyIntelligence
    } = body;

    // Validate required fields
    if (!jobTitle || !companyName) {
      return NextResponse.json(
        { error: 'Job title and company name are required' },
        { status: 400 }
      );
    }

    // Initialize Enhanced Groq AI Service
    const aiService = EnhancedGroqAIService.getInstance();

    console.log(`📊 Generating ${numberOfQuestions} ${interviewType} questions for ${jobTitle} at ${companyName}`);
    console.log(`🎯 Experience Level: ${experienceLevel}, Skills: ${skills.join(', ')}`);

    let allQuestions = [];

    try {
      if (interviewType === 'mixed') {
        // Generate mixed questions with intelligent distribution
        const technicalCount = Math.ceil(numberOfQuestions * 0.4);
        const behavioralCount = Math.ceil(numberOfQuestions * 0.3);
        const dsaCount = Math.ceil(numberOfQuestions * 0.2);
        const aptitudeCount = numberOfQuestions - technicalCount - behavioralCount - dsaCount;

        console.log(`📈 Mixed interview distribution: Technical(${technicalCount}), Behavioral(${behavioralCount}), DSA(${dsaCount}), Aptitude(${aptitudeCount})`);

        // Generate technical questions
        if (technicalCount > 0) {
          const technicalQuestions = await aiService.generateInterviewQuestions({
            jobTitle,
            companyName,
            skills,
            interviewType: 'technical',
            experienceLevel,
            numberOfQuestions: technicalCount,
            companyIntelligence
          });
          allQuestions.push(...technicalQuestions.map(q => ({ ...q, category: 'technical' })));
        }

        // Generate behavioral questions
        if (behavioralCount > 0) {
          const behavioralQuestions = await aiService.generateInterviewQuestions({
            jobTitle,
            companyName,
            skills,
            interviewType: 'behavioral',
            experienceLevel,
            numberOfQuestions: behavioralCount,
            companyIntelligence
          });
          allQuestions.push(...behavioralQuestions.map(q => ({ ...q, category: 'behavioral' })));
        }

        // Generate DSA problems
        if (dsaCount > 0) {
          const dsaProblems = await aiService.generateCompanySpecificDSAProblems(
            companyName,
            experienceLevel === 'entry' ? 'easy' : experienceLevel === 'senior' ? 'hard' : 'medium',
            dsaCount,
            jobTitle
          );
          
          // Convert DSA problems to question format
          const dsaQuestions = dsaProblems.map(problem => ({
            id: problem.id,
            question: `DSA Problem: ${problem.title}\n\n${problem.description}\n\nExamples:\n${problem.examples.map(ex => `Input: ${ex.input}\nOutput: ${ex.output}\nExplanation: ${ex.explanation || 'See problem description'}`).join('\n\n')}`,
            expectedAnswer: `Algorithm approach, time/space complexity analysis, and implementation strategy. ${problem.hints ? 'Hints: ' + problem.hints.join(', ') : ''}`,
            category: 'dsa',
            difficulty: problem.difficulty,
            points: problem.difficulty === 'easy' ? 8 : problem.difficulty === 'hard' ? 15 : 12,
            timeLimit: problem.difficulty === 'easy' ? 20 : problem.difficulty === 'hard' ? 45 : 30,
            evaluationCriteria: ['Algorithm correctness', 'Complexity analysis', 'Code quality', 'Edge case handling'],
            tags: [...(problem.topics || []), companyName, 'DSA'],
            hints: problem.hints || [],
            companyRelevance: 9
          }));
          
          allQuestions.push(...dsaQuestions);
        }

        // Generate aptitude questions if needed
        if (aptitudeCount > 0) {
          const aptitudeQuestions = await aiService.generateInterviewQuestions({
            jobTitle,
            companyName,
            skills,
            interviewType: 'aptitude',
            experienceLevel,
            numberOfQuestions: aptitudeCount,
            companyIntelligence
          });
          allQuestions.push(...aptitudeQuestions.map(q => ({ ...q, category: 'aptitude' })));
        }

      } else if (interviewType === 'dsa') {
        // Generate pure DSA problems
        console.log(`🧮 Generating ${numberOfQuestions} company-specific DSA problems`);
        
        const difficulty = experienceLevel === 'entry' ? 'easy' :;
                          experienceLevel === 'senior' ? 'hard' : 'medium',
        
        const dsaProblems = await aiService.generateCompanySpecificDSAProblems(
          companyName,
          difficulty,
          numberOfQuestions,
          jobTitle
        );
        
        // Convert to question format
        allQuestions = dsaProblems.map(problem => ({
          id: problem.id,
          question: `${problem.title}\n\n${problem.description}\n\n` +
                   `Examples:\n${problem.examples.map(ex => 
                     `Input: ${ex.input}\nOutput: ${ex.output}${ex.explanation ? '\nExplanation: ' + ex.explanation : ''}`
                   ).join('\n\n')}\n\n` +
                   `Constraints:\n${problem.constraints.join('\n')}\n\n` +
                   `Topics: ${problem.topics.join(', ')}` +
                   (problem.companyContext ? `\n\nCompany Context: ${problem.companyContext}` : ''),
          expectedAnswer: `Provide algorithm approach, complexity analysis, and implementation. ` +
                        `Expected time complexity: ${problem.timeComplexity || 'Optimal'}, ` +
                        `space complexity: ${problem.spaceComplexity || 'Efficient'}.` +
                        (problem.hints ? ` Hints: ${problem.hints.join(', ')}` : ''),
          category: 'dsa',
          difficulty: problem.difficulty,
          points: problem.difficulty === 'easy' ? 8 : problem.difficulty === 'hard' ? 15 : 12,
          timeLimit: problem.difficulty === 'easy' ? 20 : problem.difficulty === 'hard' ? 45 : 30,
          evaluationCriteria: ['Algorithm correctness', 'Complexity analysis', 'Implementation quality', 'Edge case handling'],
          tags: [...(problem.topics || []), companyName, 'DSA', jobTitle],
          hints: problem.hints || [],
          companyRelevance: 9,
          dsaProblem: problem // Include full DSA problem data
        }));
        
      } else {
        // Generate single type questions  
        console.log(`📝 Generating ${numberOfQuestions} ${interviewType} questions`);
        
        allQuestions = await aiService.generateInterviewQuestions({
          jobTitle,
          companyName,
          skills,
          interviewType: interviewType as any,
          experienceLevel,
          numberOfQuestions,
          companyIntelligence
        });
      }

      // Shuffle questions for variety
      allQuestions = allQuestions.sort(() => Math.random() - 0.5);

      console.log(`✅ Successfully generated ${allQuestions.length} questions`);
      console.log(`📊 Question distribution:`, {
        technical: allQuestions.filter(q => q.category === 'technical').length,
        behavioral: allQuestions.filter(q => q.category === 'behavioral').length,
        dsa: allQuestions.filter(q => q.category === 'dsa').length,
        aptitude: allQuestions.filter(q => q.category === 'aptitude').length,
        system_design: allQuestions.filter(q => q.category === 'system_design').length
      });

      // Store interview session in database
      try {
        const { db } = await connectToDatabase();
        const interviewData = {
          userId: session.user?.email || session.user?.name,
          jobTitle,
          companyName,
          skills,
          interviewType,
          experienceLevel,
          questions: allQuestions,
          createdAt: new Date(),
          status: 'generated',
          aiProvider: 'enhanced-groq',
          totalQuestions: allQuestions.length
        };

        await db.collection('interview_sessions').insertOne(interviewData);
        console.log('💾 Interview session stored in database');
      } catch (dbError) {
        console.error('⚠️ Database storage failed:', dbError);
        // Continue anyway - question generation succeeded
      }

      return NextResponse.json({
        success: true,
        questions: allQuestions,
        metadata: {
          totalQuestions: allQuestions.length,
          aiProvider: 'enhanced-groq',
          companyName,
          jobTitle,
          interviewType,
          experienceLevel,
          generatedAt: new Date().toISOString(),
          distribution: {
            technical: allQuestions.filter(q => q.category === 'technical').length,
            behavioral: allQuestions.filter(q => q.category === 'behavioral').length,
            dsa: allQuestions.filter(q => q.category === 'dsa').length,
            aptitude: allQuestions.filter(q => q.category === 'aptitude').length,
            system_design: allQuestions.filter(q => q.category === 'system_design').length
          }
        }
      });

    } catch (aiError) {
      console.error('❌ AI Service Error:', aiError);
      
      // Fallback to basic questions
      const fallbackQuestions = Array.from({ length: numberOfQuestions }, (_, i) => ({
        id: `fallback-${i}`,
        question: `Tell me about your experience with ${skills[i % skills.length] || 'relevant technologies'} in a ${jobTitle} role at ${companyName}.`,
        expectedAnswer: 'A comprehensive answer covering technical experience, specific projects, and problem-solving approach.',
        category: interviewType,
        difficulty: 'medium' as const,
        points: 10,
        timeLimit: 5,
        evaluationCriteria: ['Technical knowledge', 'Communication clarity', 'Practical experience'],
        tags: [companyName, jobTitle, interviewType],
        hints: ['Think about specific projects you\'ve worked on'],
        companyRelevance: 6
      }));

      return NextResponse.json({
        success: true,
        questions: fallbackQuestions,
        metadata: {
          totalQuestions: fallbackQuestions.length,
          aiProvider: 'fallback',
          companyName,
          jobTitle,
          interviewType,
          experienceLevel,
          generatedAt: new Date().toISOString(),
          note: 'Generated using fallback due to AI service unavailability'
        }
      });
    }

  } catch (error) {
    console.error('❌ Enhanced Question Generation API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate questions', 
        details: error instanceof Error ? error.message : 'Unknown error',
        aiProvider: 'enhanced-groq'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enhanced Question Generation API',
    aiProvider: 'enhanced-groq',
    supportedTypes: ['technical', 'behavioral', 'mixed', 'dsa', 'aptitude', 'system_design'],
    features: [
      'Company-specific question generation',
      'Enhanced prompt engineering',
      'Intelligent question distribution',
      'DSA problems with company context',
      'Experience level optimization',
      'Real-world scenario integration'
    ]
  });
}