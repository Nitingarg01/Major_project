require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const { hash } = require('bcrypt-ts');

async function createTestUser() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('Cluster0');
    
    // Check if test user already exists
    const existingUser = await db.collection('users').findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser._id);
      return existingUser;
    }
    
    // Create test user with hashed password
    const hashedPassword = await hash('testpassword123', 12);
    
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(testUser);
    console.log('✅ Test user created:', result.insertedId);
    
    return { ...testUser, _id: result.insertedId };
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await client.close();
  }
}

// Run the function
createTestUser();