const { MongoClient } = require('mongodb');
const fs = require('fs');

async function testConnection() {
  // Read environment variables from .env.local
  let uri;
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const mongoLine = envContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
    uri = mongoLine ? mongoLine.split('=')[1] : null;
  } catch (error) {
    console.error('Could not read .env.local file:', error);
    return;
  }
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