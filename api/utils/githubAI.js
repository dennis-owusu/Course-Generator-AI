import OpenAI from "openai";
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// GitHub AI model integration for generating educational content
export async function generateWithGitHubAI(prompt) {
    try {
        // Get GitHub token from environment variables
        const token = process.env.GPT40_API_KEY;
         
        if (!token) {
            console.warn('GitHub AI token (GPT40_API_KEY) is not set in environment variables. Using fallback content generation.');
            return null;
        }
        
        // Initialize OpenAI client with GitHub's inference endpoint
        const client = new OpenAI({
            baseURL: "https://models.github.ai/inference",
            apiKey: token
        });
        
        // Make API call to GitHub's model
        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are an educational content creator specializing in creating comprehensive, accurate, and engaging lesson content. Your goal is to provide detailed explanations that help students understand complex topics. Include relevant examples, historical context, and practical applications in your responses." },
                { role: "user", content: prompt }
            ],
            model: "openai/gpt-4o",
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1
        });
        
        // Return the generated content
        return response.choices[0].message.content;
    } catch (error) {
        console.warn('Error generating content with GitHub AI:', error.message);
        if (error.response) {
            console.warn('API error response:', error.response.data);
        }
        console.warn('Falling back to local content generation.');
        return null;
    }
}