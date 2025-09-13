/**
 * Enhanced Company-Specific DSA Generation API
 * Uses Enhanced Groq AI Service for company-tailored coding problems
 * Integrates with Enhanced DSA Compiler for execution
 */

import { NextRequest, NextResponse } from 'next/server';
import EnhancedGroqAIService from '@/lib/enhancedGroqAIService';
import EnhancedDSACompiler from '@/lib/enhancedDSACompiler';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    console.log('🧮 Enhanced Company DSA Generation API called');
    
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      difficulty = 'medium',
      count = 3,
      jobTitle = 'Software Engineer',
      techStack = [],
      includeCompiler = true
    } = body;

    // Validate required fields
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Generating ${count} ${difficulty} DSA problems for ${jobTitle} at ${companyName}`);
    if (techStack.length > 0) {
      console.log(`🛠️ Tech stack context: ${techStack.join(', ')}`);
    }

    // Initialize services
    const aiService = EnhancedGroqAIService.getInstance();
    const compilerService = includeCompiler ? EnhancedDSACompiler.getInstance() : null;

    try {
      // Generate company-specific DSA problems
      const dsaProblems = await aiService.generateCompanySpecificDSAProblems(
        companyName,
        difficulty as 'easy' | 'medium' | 'hard',
        count,
        jobTitle
      );

      console.log(`✅ Generated ${dsaProblems.length} company-specific DSA problems`);

      // Get compiler info if requested
      let compilerInfo = null;
      if (compilerService) {
        const languages = compilerService.getAvailableLanguages();
        const compilerHealth = await compilerService.healthCheck();
        
        compilerInfo = {
          available: true,
          supportedLanguages: languages.map(lang => ({
            id: lang.id,
            name: lang.name,
            label: lang.label,
            fileExtension: lang.fileExtension
          })),
          status: compilerHealth,
          features: [
            'Real-time code execution',
            'Multiple test case validation',
            'Performance analysis',
            'Company-specific feedback'
          ]
        };
        
        console.log(`🔧 Compiler service available with ${languages.length} languages`);
      }

      // Store DSA session in database
      try {
        const { db } = await connectToDatabase();
        const dsaSessionData = {
          userId: session.user?.email || session.user?.name,
          companyName,
          jobTitle,
          difficulty,
          techStack,
          problems: dsaProblems,
          createdAt: new Date(),
          status: 'generated',
          aiProvider: 'enhanced-groq',
          totalProblems: dsaProblems.length,
          compilerEnabled: includeCompiler
        };

        await db.collection('dsa_sessions').insertOne(dsaSessionData);
        console.log('💾 DSA session stored in database');
      } catch (dbError) {
        console.error('⚠️ Database storage failed:', dbError);
        // Continue anyway - problem generation succeeded
      }

      // Enhance problems with additional metadata
      const enhancedProblems = dsaProblems.map(problem => ({
        ...problem,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiProvider: 'enhanced-groq',
          companySpecific: true,
          jobTitle,
          estimatedTime: problem.difficulty === 'easy' ? '15-20 min' : 
                       problem.difficulty === 'hard' ? '35-45 min' : '25-30 min',
          difficultyScore: problem.difficulty === 'easy' ? 3 : 
                          problem.difficulty === 'hard' ? 8 : 5,
          tags: [...(problem.topics || []), companyName, jobTitle, 'company-specific']
        },
        compilerSupport: compilerInfo ? {
          enabled: true,
          languages: compilerInfo.supportedLanguages.map(lang => lang.name),
          templates: compilerInfo.supportedLanguages.map(lang => ({
            language: lang.name,
            template: compilerService?.getLanguageTemplate(lang.name)
          }))
        } : {
          enabled: false,
          reason: 'Compiler service not requested'
        }
      }));

      return NextResponse.json({
        success: true,
        problems: enhancedProblems,
        compiler: compilerInfo,
        metadata: {
          companyName,
          jobTitle,
          difficulty,
          totalProblems: enhancedProblems.length,
          aiProvider: 'enhanced-groq',
          generatedAt: new Date().toISOString(),
          features: [
            'Company-specific problem context',
            'Real-world application scenarios',
            'Industry-relevant constraints',
            'Technical challenge alignment'
          ],
          companyContext: {
            name: companyName,
            jobTitle,
            techStack: techStack.length > 0 ? techStack : ['General'],
            difficulty,
            problemTypes: [...new Set(enhancedProblems.flatMap(p => p.topics || []))]
          }
        }
      });

    } catch (aiError) {
      console.error('❌ AI Service Error:', aiError);
      
      // Fallback DSA problems
      const fallbackProblems = Array.from({ length: count }, (_, i) => {
        const difficulties = ['easy', 'medium', 'hard'];
        const topics = ['Array', 'Hash Table', 'Dynamic Programming', 'Graph', 'Tree'];
        
        return {
          id: `fallback-dsa-${companyName.toLowerCase()}-${i}`,
          title: `${companyName} Engineering Challenge ${i + 1}`,
          difficulty: difficulty,
          description: `This is a ${difficulty} level algorithmic problem designed for ${jobTitle} interviews at ${companyName}. Solve this efficiently considering their scale and requirements.`,
          examples: [
            {
              input: 'Sample input data',
              output: 'Expected output result',
              explanation: `This solution addresses ${companyName}'s specific technical requirements.`
            }
          ],
          testCases: [
            {
              id: `test-${i}-1`,
              input: '5\n1 2 3 4 5',
              expectedOutput: '15',
              hidden: false
            }
          ],
          constraints: [`Optimized for ${companyName}'s scale`, 'Efficient memory usage'],
          topics: [topics[i % topics.length]],
          hints: [`Consider ${companyName}'s specific requirements`, 'Think about edge cases'],
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          companyContext: `Relevant to ${companyName}'s engineering challenges`,
          realWorldApplication: `Used in ${companyName}'s production systems`,
          metadata: {
            generatedAt: new Date().toISOString(),
            aiProvider: 'fallback',
            companySpecific: false,
            jobTitle,
            estimatedTime: '20-25 min',
            difficultyScore: 5
          }
        };
      });

      return NextResponse.json({
        success: true,
        problems: fallbackProblems,
        compiler: compilerInfo,
        metadata: {
          companyName,
          jobTitle,
          difficulty,
          totalProblems: fallbackProblems.length,
          aiProvider: 'fallback',
          generatedAt: new Date().toISOString(),
          note: 'Generated using fallback due to AI service unavailability'
        }
      });
    }

  } catch (error) {
    console.error('❌ Enhanced Company DSA Generation API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate company DSA problems', 
        details: error instanceof Error ? error.message : 'Unknown error',
        aiProvider: 'enhanced-groq'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enhanced Company-Specific DSA Generation API',
    aiProvider: 'enhanced-groq',
    supportedDifficulties: ['easy', 'medium', 'hard'],
    features: [
      'Company-specific algorithmic challenges',
      'Real-world problem scenarios',
      'Industry-relevant constraints',
      'Integrated code compiler',
      'Multiple programming languages',
      'Comprehensive test cases',
      'Performance analysis',
      'Company culture alignment'
    ],
    compilerFeatures: [
      'Real-time code execution',
      'Multi-language support',
      'Test case validation',
      'Performance metrics',
      'Intelligent feedback'
    ]
  });
}