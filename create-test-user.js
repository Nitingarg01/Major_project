const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const fs = require('fs');

async function createTestUser() {
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

  if (!uri) {
    console.error('MONGODB_URI not found');
    return;
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db("Cluster0");
    
    // Check if test user already exists
    const existingUser = await db.collection("users").findOne({ email: "test@example.com" });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser._id);
      await client.close();
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newUser = await db.collection("users").insertOne({
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Test user created with ID:', newUser.insertedId);

    // Create a test interview for this user
    const testInterview = await db.collection("interviews").insertOne({
      userId: newUser.insertedId.toString(),
      jobTitle: "Software Engineer",
      companyName: "Test Company",
      status: "completed",
      interviewType: "technical",
      experienceLevel: "mid-level",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Test interview created with ID:', testInterview.insertedId);

    await client.close();
    console.log('Test data setup completed!');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();