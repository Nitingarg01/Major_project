const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing MongoDB connection...');
  console.log('URI exists:', !!uri);
  
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log('Connecting to MongoDB...');
    await client.connect();
    
    console.log('Connected successfully!');
    
    // Test database access
    const db = client.db("Cluster0");
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test a simple query
    const users = await db.collection("users").countDocuments();
    console.log('Users count:', users);
    
    const interviews = await db.collection("interviews").countDocuments();
    console.log('Interviews count:', interviews);
    
    await client.close();
    console.log('Connection test completed successfully!');
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
}

testConnection();