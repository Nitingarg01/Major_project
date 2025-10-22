/**
 * Enhanced Groq Health Check API
 * Comprehensive health monitoring for Enhanced Groq + Gemini services
 * Replaces Emergent AI health checks
 */

import { NextRequest, NextResponse } from 'next/server';
import EnhancedGroqAIService from '@/lib/enhancedGroqAIService';
import EnhancedDSACompiler from '@/lib/enhancedDSACompiler';
import SmartAIService from '@/lib/smartAIService';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Enhanced Groq Health Check initiated');
    
    const startTime = Date.now();
    
    // Initialize services
    const groqService = EnhancedGroqAIService.getInstance();
    const dsaCompiler = EnhancedDSACompiler.getInstance();
    const smartAI = SmartAIService.getInstance();

    // Perform parallel health checks
    const [groqHealth, compilerHealth, smartAIHealth] = await Promise.allSettled([
      groqService.healthCheck().catch(error => ({ 
        groqAvailable: false, 
        model: 'llama-3.3-70b-versatile', 
        status: 'error',
        error: error.message 
      })),
      dsaCompiler.healthCheck().catch(error => ({ 
        judge0Available: false, 
        languagesSupported: 0, 
        status: 'error',
        error: error.message 
      })),
      smartAI.getHealthStatus().catch(error => ({ 
        groqAvailable: false, 
        geminiAvailable: false, 
        status: 'error',
        error: error.message 
      }))
    ]);

    // Extract results
    const groqResult = groqHealth.status === 'fulfilled' ? groqHealth.value : { 
      groqAvailable: false, 
      model: 'llama-3.3-70b-versatile', 
      status: 'error' 
    };
    
    const compilerResult = compilerHealth.status === 'fulfilled' ? compilerHealth.value : { 
      judge0Available: false, 
      languagesSupported: 0, 
      status: 'error' 
    };
    
    const smartResult = smartAIHealth.status === 'fulfilled' ? smartAIHealth.value : { 
      groqAvailable: false, 
      geminiAvailable: false, 
      status: 'error' 
    };

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Determine overall system status
    const overallStatus = determineOverallStatus(groqResult, compilerResult, smartResult);

    // Get company suggestions (test intelligent routing)
    let companySuggestions: string[] = [];
    try {
      companySuggestions = groqService.getCompanySuggestions('tech');
    } catch (error) {
      companySuggestions = ['Google', 'Meta', 'Amazon', 'Microsoft'];
    }

    // Compile comprehensive health report
    const healthReport = {
      timestamp: new Date().toISOString(),
      responseTime,
      overallStatus,
      services: {
        enhancedGroq: {
          available: groqResult.groqAvailable || false,
          model: groqResult.model || 'llama-3.3-70b-versatile',
          status: groqResult.status || 'unknown',
          companyProfilesLoaded: groqResult.companyProfilesLoaded || 0,
          features: [
            'Company-specific question generation',
            'Advanced prompt engineering',
            'Cultural fit analysis',
            'DSA problem creation',
            'Intelligent response analysis'
          ]
        },
        gemini: {
          available: smartResult.geminiAvailable || false,
          model: 'gemini-1.5-flash',
          status: smartResult.geminiAvailable ? 'active' : 'offline',
          primaryUse: 'Resume parsing and company search',
          features: [
            'Fast resume analysis',
            'Company information lookup',
            'Cost-effective processing',
            'Reliable fallback service'
          ]
        },
        dsaCompiler: {
          available: compilerResult.judge0Available || false,
          languagesSupported: compilerResult.languagesSupported || 0,
          status: compilerResult.status || 'unknown',
          features: [
            'Multi-language code execution',
            'Real-time testing',
            'Performance analysis',
            'Company-specific feedback'
          ]
        },
        smartRouting: {
          available: true,
          status: 'active',
          activeProvider: smartResult.activeProvider || 'none',
          fallbackAvailable: smartResult.fallbackAvailable || false,
          features: smartResult.features || []
        }
      },
      capabilities: {
        questionGeneration: groqResult.groqAvailable || false,
        responseAnalysis: groqResult.groqAvailable || false,
        performanceEvaluation: groqResult.groqAvailable || false,
        dsaProblemGeneration: groqResult.groqAvailable || false,
        codeExecution: compilerResult.judge0Available || false,
        resumeParsing: smartResult.geminiAvailable || false,
        companyIntelligence: groqResult.groqAvailable || false,
        culturalFitAnalysis: groqResult.groqAvailable || false
      },
      metrics: {
        totalServices: 4,
        activeServices: [
          groqResult.groqAvailable,
          smartResult.geminiAvailable,
          compilerResult.judge0Available,
          true // Smart routing always available
        ].filter(Boolean).length,
        healthScore: calculateHealthScore(groqResult, compilerResult, smartResult),
        companySuggestionsAvailable: companySuggestions.length,
        lastChecked: new Date().toISOString()
      },
      testing: {
        companySuggestions: companySuggestions.slice(0, 5),
        sampleCapabilities: [
          'Generate Google-specific technical questions',
          'Analyze responses with company culture fit',
          'Create Meta-specific DSA problems',
          'Execute and test coding solutions',
          'Parse resume and extract skills'
        ]
      }
    };

    console.log(`✅ Health check completed in ${responseTime}ms - Status: ${overallStatus}`);
    console.log(`📊 Services: Groq(${groqResult.groqAvailable}), Gemini(${smartResult.geminiAvailable}), Compiler(${compilerResult.judge0Available})`);

    return NextResponse.json({
      success: true,
      health: healthReport,
      message: 'Enhanced Groq AI services health check completed',
      aiProvider: 'enhanced-groq'
    });

  } catch (error) {
    console.error('❌ Enhanced Groq Health Check failed:', error);
    
    return NextResponse.json({
      success: false,
      health: {
        timestamp: new Date().toISOString(),
        overallStatus: 'critical_error',
        services: {
          enhancedGroq: { available: false, status: 'error' },
          gemini: { available: false, status: 'error' },
          dsaCompiler: { available: false, status: 'error' },
          smartRouting: { available: false, status: 'error' }
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      message: 'Health check failed',
      aiProvider: 'enhanced-groq'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Enhanced Service Test initiated');
    
    const body = await req.json();
    const { testType = 'basic', companyName = 'Google', jobTitle = 'Software Engineer' } = body;

    const groqService = EnhancedGroqAIService.getInstance();
    const smartAI = SmartAIService.getInstance();
    const dsaCompiler = EnhancedDSACompiler.getInstance();

    let testResults: any = {};

    switch (testType) {
      case 'question_generation':
        console.log(`🎯 Testing question generation for ${jobTitle} at ${companyName}`);
        try {
          const questions = await groqService.generateInterviewQuestions({
            jobTitle,
            companyName,
            skills: ['JavaScript', 'React', 'Node.js'],
            interviewType: 'technical',
            experienceLevel: 'mid',
            numberOfQuestions: 2
          });
          
          testResults.questionGeneration = {
            success: true,
            questionsGenerated: questions.length,
            sampleQuestion: questions[0]?.question?.substring(0, 100) + '...',
            companyRelevance: questions.reduce((sum, q) => sum + (q.companyRelevance || 0), 0) / questions.length
          };
        } catch (error) {
          testResults.questionGeneration = {
            success: false,
            error: error instanceof Error ? error.message : 'Question generation failed'
          };
        }
        break;

      case 'dsa_generation':
        console.log(`🧮 Testing DSA problem generation for ${companyName}`);
        try {
          const problems = await groqService.generateCompanySpecificDSAProblems(
            companyName,
            'medium',
            1,
            jobTitle
          );
          
          testResults.dsaGeneration = {
            success: true,
            problemsGenerated: problems.length,
            sampleProblem: problems[0]?.title,
            companySpecific: problems[0]?.companyContext ? true : false
          };
        } catch (error) {
          testResults.dsaGeneration = {
            success: false,
            error: error instanceof Error ? error.message : 'DSA generation failed'
          };
        }
        break;

      case 'response_analysis':
        console.log(`📊 Testing response analysis for ${companyName}`);
        try {
          const analysis = await groqService.analyzeInterviewResponse(
            'What is your experience with React?',
            'I have 3 years of experience building web applications with React, including hooks, context API, and component optimization.',
            'Should demonstrate practical React experience with specific examples',
            'technical',
            companyName
          );
          
          testResults.responseAnalysis = {
            success: true,
            score: analysis.score,
            companyFit: analysis.companyFit,
            feedbackLength: analysis.feedback.length
          };
        } catch (error) {
          testResults.responseAnalysis = {
            success: false,
            error: error instanceof Error ? error.message : 'Response analysis failed'
          };
        }
        break;

      case 'smart_routing':
        console.log('🧠 Testing smart AI routing');
        try {
          const routingTest = await smartAI.generateQuestions({
            jobTitle,
            companyName,
            skills: ['Python', 'Machine Learning'],
            interviewType: 'technical',
            experienceLevel: 'senior',
            numberOfQuestions: 1
          });
          
          testResults.smartRouting = {
            success: routingTest.success,
            provider: routingTest.provider,
            model: routingTest.model,
            processingTime: routingTest.processingTime
          };
        } catch (error) {
          testResults.smartRouting = {
            success: false,
            error: error instanceof Error ? error.message : 'Smart routing test failed'
          };
        }
        break;

      default:
        // Basic connectivity test
        const basicTest = await groqService.healthCheck();
        testResults.basic = {
          success: basicTest.groqAvailable,
          model: basicTest.model,
          status: basicTest.status
        };
    }

    return NextResponse.json({
      success: true,
      testResults,
      testType,
      timestamp: new Date().toISOString(),
      message: `${testType} test completed`,
      aiProvider: 'enhanced-groq'
    });

  } catch (error) {
    console.error('❌ Service test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      testType: 'unknown',
      timestamp: new Date().toISOString(),
      aiProvider: 'enhanced-groq'
    }, { status: 500 });
  }
}

// Helper functions
function determineOverallStatus(groq: any, compiler: any, smart: any): string {
  if (groq.groqAvailable && smart.geminiAvailable && compiler.judge0Available) {
    return 'healthy';
  } else if (groq.groqAvailable && smart.geminiAvailable) {
    return 'groq_ready';
  } else if (smart.geminiAvailable) {
    return 'gemini_only';
  } else if (groq.groqAvailable) {
    return 'groq_only';
  } else {
    return 'degraded';
  }
}

function calculateHealthScore(groq: any, compiler: any, smart: any): number {
  let score = 0;
  
  if (groq.groqAvailable) score += 40; // Most important service;
  if (smart.geminiAvailable) score += 25; // Secondary service;
  if (compiler.judge0Available) score += 20; // Code execution;
  if (smart.fallbackAvailable) score += 15; // Redundancy;
  
  return Math.min(100, score);
}