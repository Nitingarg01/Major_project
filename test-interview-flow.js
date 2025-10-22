// Test script to verify interview completion flow
const { MongoClient, ObjectId } = require('mongodb');

async function testInterviewFlow() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('Cluster0');
    
    console.log('🧪 Starting interview flow test...');
    
    // Create a test user ID (you should replace this with actual user ID)
    const testUserId = new ObjectId('676c9d5f4b47b7cf15b81901'); // Replace with real user ID;
    
    console.log('👤 Test User ID:', testUserId);
    
    // 1. Create a test interview
    const testInterview = {
      userId: testUserId,
      jobTitle: 'Test Software Engineer',
      companyName: 'Test Company',
      interviewType: 'technical',
      experienceLevel: 'mid',
      status: 'ready', // This should become 'completed' after feedback
      createdAt: new Date(),
      skills: ['JavaScript', 'React', 'Node.js']
    };
    
    const interviewResult = await db.collection('interviews').insertOne(testInterview);
    const interviewId = interviewResult.insertedId;
    console.log('📝 Created test interview:', interviewId);
    
    // 2. Simulate saving performance data
    const performanceData = {
      userId: testUserId,
      interviewId: interviewId,
      jobTitle: testInterview.jobTitle,
      companyName: testInterview.companyName,
      interviewType: testInterview.interviewType,
      experienceLevel: testInterview.experienceLevel,
      completedAt: new Date(),
      totalQuestions: 10,
      correctAnswers: 7,
      score: 70,
      timeSpent: 30,
      feedback: {
        overall: 'Good performance with room for improvement',
        strengths: ['Problem solving', 'Communication'],
        improvements: ['Algorithm optimization'],
        recommendations: ['Practice more coding problems']
      },
      roundResults: [{
        roundType: 'technical',
        score: 70,
        questionsAnswered: 10,
        totalQuestions: 10,
        timeSpent: 30
      }]
    };
    
    const performanceResult = await db.collection('performances').insertOne(performanceData);
    console.log('📊 Created performance data:', performanceResult.insertedId);
    
    // 3. Update interview status to completed
    const updateResult = await db.collection('interviews').updateOne(
      { _id: interviewId },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          performanceId: performanceResult.insertedId
        }
      }
    );
    console.log('✅ Updated interview status:', updateResult.modifiedCount, 'documents modified');
    
    // 4. Test dashboard query (should exclude completed interview)
    const activeInterviews = await db.collection('interviews')
      .find({
        userId: testUserId,
        status: { $ne: 'completed' }
      })
      .toArray();
    
    console.log('🎯 Active interviews count:', activeInterviews.length);
    console.log('Active interviews:', activeInterviews.map(i => ({ id: i._id, status: i.status })));
    
    // 5. Test performance stats query (should include completed interview)
    const performances = await db.collection('performances')
      .find({ userId: testUserId })
      .toArray();
    
    console.log('📈 Performance records count:', performances.length);
    console.log('Performance records:', performances.map(p => ({ 
      id: p._id, 
      interviewId: p.interviewId, 
      score: p.score 
    })));
    
    // 6. Verify the interview is marked as completed
    const completedInterview = await db.collection('interviews')
      .findOne({ _id: interviewId });
    
    console.log('🔍 Interview status after completion:', completedInterview?.status);
    console.log('🔗 Interview has performanceId:', !!completedInterview?.performanceId);
    
    // 7. Test results
    const testResults = {
      interviewCreated: !!interviewResult.insertedId,
      performanceCreated: !!performanceResult.insertedId,
      interviewUpdated: updateResult.modifiedCount > 0,
      interviewCompleted: completedInterview?.status === 'completed',
      excludedFromActive: !activeInterviews.find(i => i._id.equals(interviewId)),
      includedInPerformance: performances.find(p => p.interviewId.equals(interviewId)),
      hasPerformanceLink: !!completedInterview?.performanceId
    };
    
    console.log('\n🎯 TEST RESULTS:');
    console.log('================');
    Object.entries(testResults).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allPassed = Object.values(testResults).every(result => result);
    console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}`);
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await db.collection('interviews').deleteOne({ _id: interviewId });
    await db.collection('performances').deleteOne({ _id: performanceResult.insertedId });
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
  }
}

// Run the test
testInterviewFlow();