const { MongoClient, ObjectId } = require('mongodb');

async function debugDSAInterview() {
    const client = new MongoClient('mongodb+srv://gargn4034:N1i2t3i4n5@cluster0.67w57ax.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0');
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        const interviewId = "68c65023012f23c5b2b19ea4";
        
        // Get the interview details
        const interview = await db.collection('interviews').findOne({
            _id: new ObjectId(interviewId)
        });
        
        console.log('📋 Interview Details:');
        console.log(JSON.stringify(interview, null, 2));
        
        // Get the questions document  
        const questionsDoc = await db.collection("questions").findOne({
            interviewId: interviewId
        });
        
        console.log('\n📄 Questions Document:');
        console.log('- Questions count:', questionsDoc?.questions?.length || 0);
        if (questionsDoc?.questions) {
            questionsDoc.questions.forEach((q, index) => {
                console.log(`  Question ${index + 1}:`, {
                    id: q.id,
                    category: q.category,
                    hasDSAProblem: !!q.dsaProblem,
                    dsaProblemId: q.dsaProblem?.id
                });
            });
        }
        
        // Check for DSA executions using all possible question IDs
        const questionIds = questionsDoc?.questions?.map(q => q.id || q.dsaProblem?.id).filter(Boolean) || [];
        console.log('\n🔍 Looking for DSA executions with question IDs:', questionIds);
        
        const dsaExecutions = await db.collection('dsa_executions').find({
            problemId: { $in: questionIds }
        }).toArray();
        
        console.log('📊 DSA Executions found:', dsaExecutions.length);
        dsaExecutions.forEach((exec, index) => {
            console.log(`  Execution ${index + 1}:`, {
                problemId: exec.problemId,
                success: exec.success,
                testsPassed: exec.testsPassed,
                totalTests: exec.totalTests,
                language: exec.language,
                createdAt: exec.createdAt
            });
        });
        
        // Check for all DSA executions (regardless of problemId)
        const allDSAExecutions = await db.collection('dsa_executions').find().limit(5).toArray();
        console.log('\n📊 Recent DSA Executions in database:');
        allDSAExecutions.forEach((exec, index) => {
            console.log(`  Execution ${index + 1}:`, {
                problemId: exec.problemId,
                problemTitle: exec.problemTitle,
                userId: exec.userId,
                success: exec.success,
                createdAt: exec.createdAt
            });
        });
        
        // Check interview responses (used by complete-interview API)
        console.log('\n🔍 Interview Responses:');
        console.log('- Has responses:', !!interview.responses);
        console.log('- Responses count:', interview.responses?.length || 0);
        if (interview.responses && interview.responses.length > 0) {
            interview.responses.forEach((resp, index) => {
                console.log(`  Response ${index + 1}:`, {
                    questionId: resp.questionId,
                    hasAnswer: !!resp.userAnswer,
                    answerLength: resp.userAnswer?.length || 0
                });
            });
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        await client.close();
    }
}

debugDSAInterview();