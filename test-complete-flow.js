const { MongoClient, ObjectId } = require('mongodb');

async function testCompleteInterviewFlow() {
    const client = new MongoClient('mongodb+srv://gargn4034:N1i2t3i4n5@cluster0.67w57ax.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0')
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB for complete flow test');
        
        const db = client.db();
        
        // Step 1: Create a test interview
        const testInterviewId = new ObjectId();
        const testInterview = {
            _id: testInterviewId,
            companyName: 'TestCorp',
            jobTitle: 'Full Stack Developer',
            userId: 'test-user-id',
            status: 'in-progress',
            skills: ['JavaScript', 'React', 'Node.js'],
            createdAt: new Date()
        };
        
        await db.collection('interviews').insertOne(testInterview);
        console.log('✅ Step 1: Created test interview:', testInterviewId.toString());
        
        // Step 2: Create test questions (simulating question generation)
        const testQuestions = [
            { id: 'q1', question: 'What is the difference between let, const, and var in JavaScript?', category: 'technical' },
            { id: 'q2', question: 'How do you handle state management in React?', category: 'technical' },
            { id: 'q3', question: 'Describe a time when you had to work under a tight deadline?', category: 'behavioral' },
            { id: 'q4', question: 'How do you ensure code quality in your projects?', category: 'technical' }
        ];
        
        const questionsDoc = {
            interviewId: testInterviewId.toString(),
            questions: testQuestions,
            createdAt: new Date()
        };
        
        await db.collection('questions').insertOne(questionsDoc);
        console.log('✅ Step 2: Created test questions');
        
        // Step 3: Simulate user answering questions (using setanswers API)
        const userAnswers = [
            { answer: 'let and const are block-scoped while var is function-scoped. const cannot be reassigned after declaration, while let can be. var has issues with hoisting and can cause unexpected behavior.' },
            { answer: 'For state management in React, I use useState for local state, useReducer for complex state logic, and Context API or Redux for global state management depending on the application size.' },
            { answer: 'I once had to deliver a critical feature in 3 days. I broke down the task into smaller chunks, prioritized the most important functionality, worked extra hours, and communicated progress regularly with stakeholders.' },
            { answer: 'I ensure code quality through unit testing with Jest, code reviews, linting with ESLint, using TypeScript for type safety, and following established coding conventions and design patterns.' }
        ];
        
        console.log('🔄 Step 3: Submitting user answers via setanswers API...');
        const setAnswersResponse = await fetch('http://localhost:3000/api/setanswers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                data: userAnswers,
                id: testInterviewId.toString()
            })
        });
        
        const setAnswersResult = await setAnswersResponse.json();
        console.log('📄 SetAnswers API Response:', setAnswersResponse.status, setAnswersResult.message);
        
        if (setAnswersResponse.status !== 200) {
            throw new Error('Failed to submit answers: ' + JSON.stringify(setAnswersResult))
        }
        
        // Step 4: Check if feedback is ready (simulate FeedbackLoader GET check)
        console.log('🔍 Step 4: Checking if feedback is ready...');
        const checkFeedbackResponse = await fetch(`http://localhost:3000/api/fast-feedback?interviewId=${testInterviewId.toString()}`)
        const checkResult = await checkFeedbackResponse.json();
        console.log('📄 Feedback Check Result:', checkResult.message, '| Ready:', checkResult.feedbackReady);
        
        // Step 5: Generate feedback (simulate FeedbackLoader POST request)
        if (!checkResult.feedbackReady) {
            console.log('⚡ Step 5: Generating feedback via fast-feedback API...');
            const generateFeedbackResponse = await fetch('http://localhost:3000/api/fast-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interviewId: testInterviewId.toString() })
            });
            
            const feedbackResult = await generateFeedbackResponse.json();
            console.log('📄 Feedback Generation Status:', generateFeedbackResponse.status);
            
            if (generateFeedbackResponse.status === 200) {
                console.log('✅ SUCCESS: Complete interview flow working!');
                console.log('🎯 Overall Score:', feedbackResult.insights?.overallScore);
                console.log('📊 Parameter Scores:', feedbackResult.insights?.parameterScores);
                console.log('🧠 AI Provider:', feedbackResult.insights?.metadata?.aiProvider);
                console.log('⏱️ Processing Time:', feedbackResult.performance?.processingTime + 'ms');
                console.log('🔥 Strengths:', feedbackResult.insights?.strengths?.slice(0, 2));
                console.log('📈 Improvements:', feedbackResult.insights?.improvements?.slice(0, 2))
            } else {
                console.log('❌ FAILED: Feedback generation failed');
                console.log('Error details:', feedbackResult)
            }
        }
        
        // Step 6: Final check - verify feedback is now ready
        console.log('🔍 Step 6: Final check - verifying feedback is now available...');
        const finalCheckResponse = await fetch(`http://localhost:3000/api/fast-feedback?interviewId=${testInterviewId.toString()}`)
        const finalCheckResult = await finalCheckResponse.json();
        console.log('📄 Final Check Result:', finalCheckResult.message, '| Ready:', finalCheckResult.feedbackReady);
        
        if (finalCheckResult.feedbackReady) {
            console.log('✅ COMPLETE SUCCESS: End-to-end interview flow is working perfectly!');
            console.log('🎉 User would now see their feedback on the feedback page');
        }
        
        // Cleanup test data
        await db.collection('interviews').deleteOne({ _id: testInterviewId });
        await db.collection('questions').deleteOne({ interviewId: testInterviewId.toString() });
        console.log('\n🧹 Cleaned up test data');
        
    } catch (error) {
        console.error('❌ Complete flow test failed:', error.message);
        console.error('Stack trace:', error.stack)
    } finally {
        await client.close();
    }
}

console.log('🚀 Starting complete interview flow test...\n');
testCompleteInterviewFlow();