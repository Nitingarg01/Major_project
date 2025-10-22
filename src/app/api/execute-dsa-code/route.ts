/**
 * Enhanced DSA Code Execution API
 * Uses Enhanced DSA Compiler with company-specific feedback
 * Integrates with Enhanced Groq AI for intelligent code analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import EnhancedDSACompiler from '@/lib/enhancedDSACompiler';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    console.log('⚡ Enhanced DSA Code Execution API called');
    
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      sourceCode,
      language,
      problem,
      companyName = 'Technology Company'
    } = body;

    // Validate required fields
    if (!sourceCode || !language || !problem) {
      return NextResponse.json(
        { error: 'Source code, language, and problem details are required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Executing ${language} code for problem: ${problem.title}`);
    console.log(`🏢 Company context: ${companyName}`);
    console.log(`📝 Code length: ${sourceCode.length} characters`);

    // Initialize Enhanced DSA Compiler
    const compiler = EnhancedDSACompiler.getInstance();

    try {
      // Execute code with comprehensive testing
      const executionResult = await compiler.executeCode({
        sourceCode,
        language,
        problem,
        companyName
      });

      console.log(`✅ Code execution completed: ${executionResult.success ? 'PASSED' : 'FAILED'}`);
      console.log(`⏱️ Execution time: ${executionResult.executionTime.toFixed(2)}ms`);
      
      if (executionResult.testResults) {
        const passedTests = executionResult.testResults.filter(t => t.passed).length;
        console.log(`📊 Test results: ${passedTests}/${executionResult.testResults.length} passed`);
      }

      // Store execution result in database
      try {
        const { db } = await connectToDatabase();
        const executionData = {
          userId: session.user?.email || session.user?.name,
          problemId: problem.id,
          problemTitle: problem.title,
          companyName,
          language,
          sourceCode,
          executionResult,
          createdAt: new Date(),
          success: executionResult.success,
          executionTime: executionResult.executionTime,
          testsPassed: executionResult.testResults?.filter(t => t.passed).length || 0,
          totalTests: executionResult.testResults?.length || 0
        };

        await db.collection('dsa_executions').insertOne(executionData);
        console.log('💾 Execution result stored in database');
      } catch (dbError) {
        console.error('⚠️ Database storage failed:', dbError);
        // Continue anyway - execution succeeded
      }

      // Enhance response with additional insights
      const enhancedResult = {
        ...executionResult,
        metadata: {
          problemId: problem.id,
          problemTitle: problem.title,
          problemDifficulty: problem.difficulty,
          companyName,
          language,
          executedAt: new Date().toISOString(),
          codeLength: sourceCode.length,
          lineCount: sourceCode.split('\n').length,
          compilerService: 'enhanced-dsa-compiler'
        },
        insights: {
          performanceLevel: executionResult.success ? 
            (executionResult.executionTime < 100 ? 'Excellent' : 
             executionResult.executionTime < 500 ? 'Good' : 'Acceptable') : 'Needs Improvement',
          codeQuality: sourceCode.length < 200 ? 'Concise' : 
                      sourceCode.length < 500 ? 'Detailed' : 'Comprehensive',
          testCoverage: executionResult.testResults ? 
            `${((executionResult.testResults.filter(t => t.passed).length / executionResult.testResults.length) * 100).toFixed(1)}%` : 'N/A',
          companyRelevance: problem.companyContext ? 'High' : 'Standard'
        },
        nextSteps: executionResult.success ? [
          'Consider optimizing time/space complexity',
          'Add error handling for edge cases',
          'Review code for production readiness',
          `Study ${companyName}'s coding standards`
        ] : [
          'Debug failing test cases',
          'Check algorithm logic',
          'Verify input/output handling',
          'Review problem requirements carefully'
        ]
      };

      return NextResponse.json({
        success: true,
        execution: enhancedResult
      });

    } catch (executionError) {
      console.error('❌ Code Execution Error:', executionError);
      
      // Return execution failure details
      return NextResponse.json({
        success: false,
        execution: {
          success: false,
          output: 'Code execution failed',
          error: executionError instanceof Error ? executionError.message : 'Execution error',
          executionTime: 0,
          memory: 0,
          metadata: {
            problemId: problem.id,
            problemTitle: problem.title,
            companyName,
            language,
            executedAt: new Date().toISOString(),
            compilerService: 'enhanced-dsa-compiler',
            errorType: 'execution_failure'
          }
        }
      });
    }

  } catch (error) {
    console.error('❌ Enhanced DSA Code Execution API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to execute code', 
        details: error instanceof Error ? error.message : 'Unknown error',
        compilerService: 'enhanced-dsa-compiler'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const compiler = EnhancedDSACompiler.getInstance();
    const languages = compiler.getAvailableLanguages();
    const healthStatus = await compiler.healthCheck();

    return NextResponse.json({
      message: 'Enhanced DSA Code Execution API',
      compilerService: 'enhanced-dsa-compiler',
      supportedLanguages: languages.map(lang => ({
        id: lang.id,
        name: lang.name,
        label: lang.label,
        fileExtension: lang.fileExtension
      })),
      features: [
        'Real-time code execution',
        'Multiple programming languages',
        'Comprehensive test case validation',
        'Performance analysis',
        'Company-specific feedback',
        'Intelligent error diagnostics',
        'Code quality insights'
      ],
      healthStatus,
      capabilities: {
        executionTimeout: '10 seconds',
        memoryLimit: '128 MB',
        supportedInputMethods: ['stdin', 'function parameters'],
        outputFormats: ['stdout', 'return values'],
        errorHandling: 'Comprehensive with debugging hints'
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Enhanced DSA Code Execution API',
      compilerService: 'enhanced-dsa-compiler',
      status: 'error',
      error: error instanceof Error ? error.message : 'Service unavailable'
    });
  }
}