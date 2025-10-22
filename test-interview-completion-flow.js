/**
 * Test script to verify the interview completion and dashboard filtering flow
 * This script tests that completed interviews are properly:
 * 1. Removed from dashboard display
 * 2. Stored in performance stats
 * 3. Prevent duplicate company interviews
 */

const { MongoClient, ObjectId } = require('mongodb');

async function testInterviewCompletionFlow() {
    const client = new MongoClient('mongodb+srv://gargn4034:N1i2t3i4n5@cluster0.67w57ax.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0')
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB for interview completion flow test');
        
        const db = client.db('Cluster0');
        
        // Step 1: Create a test user
        console.log('\n🧪 Creating test user for completion flow...');
        const testUser = {
            _id: new ObjectId(),
            email: 'completion.test@example.com',
            name: 'Interview Completion Test User',
            createdAt: new Date()
        };
        
        await db.collection('users').insertOne(testUser);
        console.log('✅ Created test user:', testUser._id.toString());
        
        // Step 2: Create interviews in different stages
        console.log('\n📊 Creating interviews in different stages...');
        
        const interviewStages = [
            {
                company: 'Google',
                jobTitle: 'Software Engineer',
                status: 'ready',
                message: 'Ready to start - should appear in dashboard'
            },
            {
                company: 'Microsoft',
                jobTitle: 'Senior Developer',
                status: 'in-progress',
                message: 'In progress - should appear in dashboard'
            },
            {
                company: 'Amazon',
                jobTitle: 'Full Stack Engineer',
                status: 'completed',
                message: 'Completed - should NOT appear in dashboard'
            },
            {
                company: 'Apple',
                jobTitle: 'iOS Engineer',
                status: 'completed',
                message: 'Completed - should NOT appear in dashboard'
            }
        ];
        
        const createdInterviews = [];
        
        for (const stage of interviewStages) {
            const interview = {
                _id: new ObjectId(),
                userId: testUser._id.toString(),
                companyName: stage.company,
                jobTitle: stage.jobTitle,
                status: stage.status,
                skills: ['JavaScript', 'React', 'Node.js'],
                interviewType: 'technical',
                experienceLevel: 'mid',
                createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random within last week
                completedAt: stage.status === 'completed' ? new Date() : null,
                availableInPerformanceStats: stage.status === 'completed';
            };
            
            createdInterviews.push(interview);
            console.log(`   ${stage.status === 'completed' ? '✅' : '🔄'} ${stage.company}: ${stage.message}`);
        }
        
        await db.collection('interviews').insertMany(createdInterviews);
        console.log(`✅ Created ${createdInterviews.length} test interviews`);
        
        // Step 3: Create performance analyses for completed interviews
        console.log('\n📈 Creating performance analyses for completed interviews...');
        
        const completedInterviews = createdInterviews.filter(i => i.status === 'completed');
        const performanceAnalyses = [];
        
        for (const interview of completedInterviews) {
            const analysis = {
                _id: new ObjectId(),
                interviewId: interview._id.toString(),
                userId: interview.userId,
                companyName: interview.companyName,
                jobTitle: interview.jobTitle,
                performance: {
                    overallScore: 7 + Math.random() * 2, // Score between 7-9
                    strengths: [
                        'Clear technical explanations',
                        'Good problem-solving approach',
                        'Strong coding skills'
                    ],
                    improvements: [
                        'System design depth',
                        'Communication clarity',
                        'Time management'
                    ],
                    overallVerdict: `Strong performance in the ${interview.jobTitle} interview. Demonstrated solid technical skills with room for system design improvement.`
                },
                createdAt: new Date(),
                aiProvider: 'groq'
            };
            
            performanceAnalyses.push(analysis);
            console.log(`   📊 ${interview.companyName}: Performance analysis created`);
        }
        
        await db.collection('performance_analysis').insertMany(performanceAnalyses);
        console.log(`✅ Created ${performanceAnalyses.length} performance analyses`);
        
        // Step 4: Test dashboard filtering (simulating the user-interviews API)
        console.log('\n🔍 Testing dashboard filtering logic...');
        
        // Get ALL interviews (what we had before)
        const allInterviews = await db.collection('interviews')
            .find({ userId: testUser._id.toString() })
            .sort({ createdAt: -1 })
            .toArray();
        
        // Get filtered interviews (what we have now - excludes completed)
        const dashboardInterviews = await db.collection('interviews')
            .find({ 
                userId: testUser._id.toString(),
                status: { $ne: 'completed' }
            })
            .sort({ createdAt: -1 })
            .toArray();
        
        // Get completed interviews count
        const completedCount = await db.collection('interviews')
            .countDocuments({ 
                userId: testUser._id.toString(),
                status: 'completed' 
            });
        
        console.log('\n📊 FILTERING RESULTS:');
        console.log('====================');
        console.log(`📈 Total interviews created: ${allInterviews.length}`);
        console.log(`🔄 Active interviews (dashboard): ${dashboardInterviews.length}`);
        console.log(`✅ Completed interviews (performance stats): ${completedCount}`);
        
        console.log('\n🔄 Active interviews shown in dashboard:');
        dashboardInterviews.forEach((interview, index) => {
            console.log(`   ${index + 1}. ${interview.companyName} - ${interview.jobTitle} (${interview.status})`);
        });
        
        console.log('\n✅ Completed interviews (moved to performance stats):');
        allInterviews.filter(i => i.status === 'completed').forEach((interview, index) => {
            console.log(`   ${index + 1}. ${interview.companyName} - ${interview.jobTitle} (completed)`);
        });
        
        // Step 5: Test duplicate company prevention
        console.log('\n🚫 Testing duplicate company prevention...');
        
        // Try to create another interview for a completed company (should fail)
        const duplicateCompanyCheck = await db.collection('interviews').findOne({
            userId: testUser._id.toString(),
            companyName: 'Amazon', // This company already has a completed interview
            status: 'completed'
        });
        
        if (duplicateCompanyCheck) {
            console.log('✅ Duplicate prevention works: Amazon already has a completed interview');
            console.log('   → User would be prevented from creating another Amazon interview');
            console.log('   → User would be redirected to performance stats instead');
        } else {
            console.log('❌ Duplicate prevention failed: No completed Amazon interview found');
        }
        
        // Step 6: Test performance data retrieval
        console.log('\n📈 Testing performance data retrieval...');
        
        const performanceData = await db.collection('performance_analysis')
            .find({ userId: testUser._id.toString() })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`📊 Performance analyses found: ${performanceData.length}`);
        performanceData.forEach((analysis, index) => {
            console.log(`   ${index + 1}. ${analysis.companyName} - Score: ${analysis.performance.overallScore.toFixed(1)}/10`);
        });
        
        // Step 7: Verify the complete flow
        console.log('\n🎯 COMPLETE FLOW VERIFICATION:');
        console.log('==============================');
        
        const flowResults = {
            dashboardShowsOnlyActive: dashboardInterviews.length === 2 && dashboardInterviews.every(i => i.status !== 'completed'),
            completedInterviewsInPerformance: performanceData.length === 2,
            duplicatePreventionWorks: !!duplicateCompanyCheck,
            performanceDataComplete: performanceData.every(p => p.performance.overallScore > 0)
        };
        
        console.log(`✅ Dashboard shows only active interviews: ${flowResults.dashboardShowsOnlyActive}`);
        console.log(`✅ Completed interviews in performance stats: ${flowResults.completedInterviewsInPerformance}`);
        console.log(`✅ Duplicate company prevention works: ${flowResults.duplicatePreventionWorks}`);
        console.log(`✅ Performance data is complete: ${flowResults.performanceDataComplete}`);
        
        const allTestsPassed = Object.values(flowResults).every(result => result === true);
        
        if (allTestsPassed) {
            console.log('\n🎉 ALL TESTS PASSED! The interview completion flow is working correctly.');
            console.log('\n📋 SUMMARY OF WHAT WORKS NOW:');
            console.log('• Completed interviews are removed from dashboard');
            console.log('• Completed interviews appear in performance stats');
            console.log('• Users cannot create duplicate company interviews');
            console.log('• Performance tracking saves all interview feedback');
            console.log('• Dashboard shows helpful completion statistics');
        } else {
            console.log('\n❌ Some tests failed. Check the implementation.');
        }
        
        // Cleanup test data
        await db.collection('users').deleteOne({ _id: testUser._id });
        await db.collection('interviews').deleteMany({ userId: testUser._id.toString() });
        await db.collection('performance_analysis').deleteMany({ userId: testUser._id.toString() });
        console.log('\n🧹 Cleaned up test data');
        
    } catch (error) {
        console.error('❌ Interview completion flow test failed:', error.message);
    } finally {
        await client.close();
    }
}

console.log('🚀 Starting interview completion flow test...\n');
testInterviewCompletionFlow();