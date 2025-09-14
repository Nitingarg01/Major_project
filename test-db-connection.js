// Simple MongoDB connection test
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
        console.error('❌ MONGODB_URI environment variable is not set');
        return;
    }
    
    console.log('🔍 Testing MongoDB connection...');
    console.log('URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    const client = new MongoClient(uri, {
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true,
        },
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
    });
    
    try {
        await client.connect();
        console.log('✅ Successfully connected to MongoDB!');
        
        // Test database access
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log('📊 Available collections:', collections.map(c => c.name));
        
        // Test a simple query
        const interviews = await db.collection('interviews').countDocuments();
        console.log(`📝 Found ${interviews} interviews in database`);
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        if (error.message.includes('ENOTFOUND')) {
            console.log('\n🔧 Troubleshooting tips:');
            console.log('1. Check your internet connection');
            console.log('2. Verify MongoDB Atlas cluster is running');
            console.log('3. Check if your IP address is whitelisted in MongoDB Atlas');
            console.log('4. Verify the connection string is correct');
        }
    } finally {
        await client.close();
        console.log('🔌 Connection closed');
    }
}

testConnection();

