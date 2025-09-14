const { MongoClient, ObjectId } = require('mongodb');

async function debugInterviewData() {
    const client = new MongoClient('mongodb+srv://gargn4034:N1i2t3i4n5@cluster0.67w57ax.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0');
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        const interviewId = "68c65023012f23c5b2b19ea4";
        
        // Get the full questions document
        const questionsDoc = await db.collection("questions").findOne({
            interviewId: interviewId
        });
        
        console.log('📄 Full questions document:');
        console.log(JSON.stringify(questionsDoc, null, 2));
        
        // Check if there are any other interview records with answers
        const interviewsWithAnswers = await db.collection("questions").find({
            answers: { $exists: true, $ne: [] }
        }).limit(3).toArray();
        
        console.log('\n📊 Sample interviews with answers:');
        interviewsWithAnswers.forEach((doc, index) => {
            console.log(`\nInterview ${index + 1}:`);
            console.log('- Interview ID:', doc.interviewId);
            console.log('- Answers count:', doc.answers?.length || 0);
            console.log('- Answers type:', typeof doc.answers);
            console.log('- Sample answer:', doc.answers?.[0]);
        });
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        await client.close();
    }
}

debugInterviewData();