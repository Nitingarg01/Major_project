const { MongoClient, ObjectId } = require('mongodb');

async function testFeedbackFix() {
    const client = new MongoClient('mongodb+srv://gargn4034:N1i2t3i4n5@cluster0.67w57ax.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0')
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        
        // Create a test interview
        const testInterviewId = new ObjectId();
        const testInterview = {
            _id: testInterviewId,
            companyName: 'TestCorp',
            jobTitle: 'Software Engineer',
            userId: 'test-user-id',
            status: 'completed',
            skills: ['JavaScript', 'React'],
            createdAt: new Date()
        };
        
        await db.collection('interviews').insertOne(testInterview);
        console.log('✅ Created test interview:', testInterviewId.toString());
        
        // Create test questions and answers
        const testQuestions = [
            { id: 'q1', question: 'What is React?', category: 'technical' },
            { id: 'q2', question: 'Explain closures in JavaScript?', category: 'technical' },
            { id: 'q3', question: 'Tell me about a challenge you faced?', category: 'behavioral' }
        ];
        
        const testAnswers = [
            { questionIndex: 0, answer: 'React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and efficiently update the DOM.', timestamp: new Date() },
            { questionIndex: 1, answer: 'Closures in JavaScript allow inner functions to access variables from outer scopes even after the outer function has finished executing.', timestamp: new Date() },
            { questionIndex: 2, answer: 'I once faced a challenge where I had to optimize a slow database query. I analyzed the execution plan and added proper indexes to improve performance.', timestamp: new Date() }
        ];
        
        const questionsDoc = {
            interviewId: testInterviewId.toString(),
            questions: testQuestions,
            answers: testAnswers,
            completedAt: new Date(),
            answersCount: testAnswers.length
        };
        
        await db.collection('questions').insertOne(questionsDoc);
        console.log('✅ Created test questions and answers');
        
        // Test the fast-feedback API
        console.log('\n🧪 Testing fast-feedback API...');
        const response = await fetch('http://localhost:3000/api/fast-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interviewId: testInterviewId.toString() })
        });
        
        const result = await response.json();
        console.log('📄 API Response Status:', response.status);
        console.log('📄 API Response:', JSON.stringify(result, null, 2));
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Feedback generation fixed!');
            console.log('🎯 Overall Score:', result.insights?.overallScore);
            console.log('🧠 AI Provider:', result.insights?.metadata?.aiProvider);
            console.log('⏱️ Processing Time:', result.performance?.processingTime + 'ms')
        } else {
            console.log('❌ FAILED: Feedback generation still has issues');
            console.log('Error details:', result.error)
        }
        
        // Cleanup test data
        await db.collection('interviews').deleteOne({ _id: testInterviewId });
        await db.collection('questions').deleteOne({ interviewId: testInterviewId.toString() });
        console.log('\n🧹 Cleaned up test data');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
    } finally {
        await client.close();
    }
}

testFeedbackFix();