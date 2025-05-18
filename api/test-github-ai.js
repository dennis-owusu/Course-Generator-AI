import dotenv from 'dotenv';
import { generateAIWithFunctions } from './utils/githubAITools.js';

dotenv.config();

/**
 * Test script for GitHub AI function calling implementation
 * This script tests the GitHub AI integration with the provided code sample
 */

const testGitHubAIFunctions = async () => {
  try {
    console.log('=== TESTING GITHUB AI FUNCTION CALLING IMPLEMENTATION ===');
    console.log('Using the code sample provided for GitHub AI integration');
    
    // Test prompt that should trigger the course generation function
    const testPrompt = 'Create a course on Web Development for beginners with a focus on career advancement.';
    
    console.log(`Test prompt: ${testPrompt}`);
    console.log('Sending request to GitHub AI...');
    
    const startTime = Date.now();
    const result = await generateAIWithFunctions(testPrompt);
    const endTime = Date.now();
    
    console.log(`Response received in ${(endTime - startTime) / 1000} seconds`);
    console.log('Response preview:');
    console.log(result.substring(0, 500) + '...');
    
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    return { success: true, result };
  } catch (error) {
    console.error('Test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the test
console.log('Starting GitHub AI function calling test...');
testGitHubAIFunctions()
  .then(result => {
    if (result.success) {
      console.log('GitHub AI function calling test passed!');
    } else {
      console.error('GitHub AI function calling test failed:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error during test:', error.message);
    process.exit(1);
  });