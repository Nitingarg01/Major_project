const { MongoClient, ObjectId } = require('mongodb');

async function testOriginalInterview() {
    const client = new MongoClient('mongodb+srv://gargn4034:N1i2t3i4n5@cluster0.67w57ax.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0')
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        
        // Test with the original problematic interview ID
        const interviewId = "68c65023012f23c5b2b19ea4";
        
        // Check interview exists
        const interview = await db.collection('interviews').findOne({
            _id: new ObjectId(interviewId)
        });
        
        console.log('📋 Original interview found:', !!interview);
        if (interview) {
            console.log('🏢 Interview details:', {
                jobTitle: interview.jobTitle,
                companyName: interview.companyName,
                status: interview.status
            });
        }
        
        // Check questions document
        const questionsDoc = await db.collection("questions").findOne({
            interviewId: interviewId
        });
        
        console.log('\n📄 Questions document analysis:');
        if (questionsDoc) {
            console.log('- Document exists: ✅');
            console.log('- Has answers:', !!questionsDoc.answers);
            console.log('- Answers type:', typeof questionsDoc.answers);
            console.log('- Answers is array:', Array.isArray(questionsDoc.answers));
            console.log('- Answers length:', questionsDoc.answers?.length || 0);
            
            if (questionsDoc.answers && questionsDoc.answers.length > 0) {
                console.log('- Sample answer structure:', questionsDoc.answers[0]);
                console.log('- Sample answer keys:', questionsDoc.answers[0] ? Object.keys(questionsDoc.answers[0]) : []);
                
                // Check if answers have content
                const meaningfulAnswers = questionsDoc.answers.filter(ans => {
                    const answer = ans?.answer || ans;
                    return answer && answer.trim() !== '' && answer !== 'No answer provided';
                });
                console.log('- Meaningful answers count:', meaningfulAnswers.length)
            }
        } else {
            console.log('❌ No questions document found');
            return;
        }
        
        // Test the fixed API
        console.log('\n🧪 Testing fast-feedback API with original interview...');
        const response = await fetch('http://localhost:3000/api/fast-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interviewId: interviewId })
        });
        
        const result = await response.json();
        console.log('📄 API Response Status:', response.status);
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Original interview feedback generated!');
            console.log('🎯 Overall Score:', result.insights?.overallScore);
            console.log('📊 Parameter Scores:', result.insights?.parameterScores);
            console.log('🧠 AI Provider:', result.insights?.metadata?.aiProvider);
            console.log('⏱️ Processing Time:', result.performance?.processingTime + 'ms');
            console.log('📝 Questions Analyzed:', result.insights?.metadata?.questionsAnalyzed);
            console.log('✍️ Answers Processed:', result.insights?.metadata?.answersProcessed)
        } else {
            console.log('❌ FAILED: Still having issues');
            console.log('Error:', result.error);
            console.log('Debug info:', result.debug)
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
    } finally {
        await client.close();
    }
}

testOriginalInterview();