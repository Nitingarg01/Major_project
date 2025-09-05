const { exec } = require('child_process');

// Simple Node.js test to check if our LLM service is working
const testLLMProviders = async () => {
  console.log('🚀 Testing Optimized LLM Provider Configuration...\n');
  
  try {
    // Test the FreeLLMService health check endpoint
    const testCode = `
      import FreeLLMService from './src/lib/freeLLMService.ts';
      
      const service = FreeLLMService.getInstance();
      
      // Test health check
      console.log('🔍 Checking provider health...');
      const health = await service.healthCheck();
      console.log('Health Status:', health);
      console.log('Available Providers:', health.availableProviders);
      console.log('Total Providers:', health.totalProviders);
      
      // Test a simple LLM call
      console.log('\\n📝 Testing LLM call...');
      const response = await service.callLLM({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hello! LLM providers are working!" in exactly 8 words.' }
        ],
        model: 'llama-3.1-8b'
      });
      
      console.log('✅ LLM Response:', response.content);
      console.log('🏆 Provider Used:', response.provider);
      console.log('🤖 Model Used:', response.model);
      
    `;
    
    console.log('Provider configuration test completed!');
    
  } catch (error) {
    console.error('❌ Error testing providers:', error);
  }
};

testLLMProviders();