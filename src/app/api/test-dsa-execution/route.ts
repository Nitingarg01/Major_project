import { NextRequest, NextResponse } from 'next/server';
import EnhancedJudge0Service from '@/lib/enhancedJudge0Service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, testCases } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing DSA code execution...`);

    const judge0Service = EnhancedJudge0Service.getInstance();
    
    // Use provided test cases or create default ones
    const testCasesToUse = testCases && testCases.length > 0 ? testCases : [,
      {
        id: 'test-1',
        input: 'nums = [2,7,11,15], target = 9',
        expectedOutput: '[0,1]'
      },
      {
        id: 'test-2',
        input: 'nums = [3,2,4], target = 6',
        expectedOutput: '[1,2]'
      },
      {
        id: 'test-3',
        input: 'nums = [3,3], target = 6',
        expectedOutput: '[0,1]'
      }
    ];

    // Execute code with enhanced service
    const executionResult = await judge0Service.executeCodeWithFallback(;
      code,
      language,
      testCasesToUse
    );

    console.log(`✅ Code execution completed: ${executionResult.totalPassed}/${executionResult.totalTests} passed`);

    return NextResponse.json({
      success: executionResult.success,
      execution: executionResult,
      summary: {
        passed: executionResult.totalPassed,
        total: executionResult.totalTests,
        status: executionResult.overallStatus,
        language: language,
        testCases: testCasesToUse.length
      },
      metadata: {
        service: 'enhanced-judge0',
        executedAt: new Date(),
        hasCompilationError: !!executionResult.compilationError,
        hasRuntimeError: !!executionResult.runtimeError
      }
    });

  } catch (error) {
    console.error('❌ Error testing DSA execution:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to execute code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}