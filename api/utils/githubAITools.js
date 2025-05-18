import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

/**
 * GitHub AI Tools Integration for Course Generator
 * This module provides function calling capabilities with GitHub AI
 */

// Define course generation tools
const courseGeneratorTool = {
  "type": "function",
  "function": {
    name: "generateCourseStructure",
    description: "Generates a structured course outline with modules and lessons based on the provided parameters.",
    parameters: {
      "type": "object",
      "properties": {
        "topic": {
          "type": "string",
          "description": "The main subject or topic of the course",
        },
        "difficulty": {
          "type": "string", 
          "description": "The difficulty level of the course (Beginner, Intermediate, Advanced)",
          "enum": ["Beginner", "Intermediate", "Advanced"]
        },
        "goal": {
          "type": "string",
          "description": "The learning goal or purpose of the course (Academic, Career, Self-learning)",
          "enum": ["Academic", "Career", "Self-learning"]
        },
        "duration": {
          "type": "string",
          "description": "The estimated duration to complete the course (in weeks)",
        }
      },
      "required": [
        "topic",
        "difficulty",
        "goal",
        "duration"
      ],
    }
  }
};

const lessonContentTool = {
  "type": "function",
  "function": {
    name: "generateLessonContent",
    description: "Generates detailed educational content for a specific lesson within a course module.",
    parameters: {
      "type": "object",
      "properties": {
        "lessonTitle": {
          "type": "string",
          "description": "The title of the lesson",
        },
        "moduleTitle": {
          "type": "string", 
          "description": "The title of the module this lesson belongs to",
        },
        "courseTopic": {
          "type": "string",
          "description": "The main topic of the course",
        },
        "difficulty": {
          "type": "string",
          "description": "The difficulty level of the course",
          "enum": ["Beginner", "Intermediate", "Advanced"]
        },
        "goal": {
          "type": "string",
          "description": "The learning goal of the course",
          "enum": ["Academic", "Career", "Self-learning"]
        }
      },
      "required": [
        "lessonTitle",
        "moduleTitle",
        "courseTopic",
        "difficulty"
      ],
    }
  }
};

const quizGeneratorTool = {
  "type": "function",
  "function": {
    name: "generateQuizQuestions",
    description: "Generates quiz questions with answers for a specific lesson or module.",
    parameters: {
      "type": "object",
      "properties": {
        "lessonTitle": {
          "type": "string",
          "description": "The title of the lesson",
        },
        "lessonContent": {
          "type": "string", 
          "description": "The content of the lesson to base questions on",
        },
        "difficulty": {
          "type": "string",
          "description": "The difficulty level of the questions",
          "enum": ["Beginner", "Intermediate", "Advanced"]
        },
        "numberOfQuestions": {
          "type": "integer",
          "description": "The number of questions to generate",
        }
      },
      "required": [
        "lessonTitle",
        "difficulty",
        "numberOfQuestions"
      ],
    }
  }
};

// Function implementations
function generateCourseStructure(data) {
  const { topic, difficulty, goal, duration } = data;
  
  // This would normally contain logic to create a course structure
  // For now, we'll return a template response
  return JSON.stringify({
    title: `Comprehensive ${topic} Course`,
    description: `A detailed course on ${topic} designed for ${difficulty} level students with a focus on ${goal} learning. This course can be completed in approximately ${duration} weeks.`,
    level: difficulty,
    category: "Education",
    modules: [
      {
        title: `Introduction to ${topic}`,
        description: `A foundational module that introduces key concepts in ${topic}.`,
        order: 1,
        lessons: [
          {
            title: `Getting Started with ${topic}`,
            summary: "An overview of the fundamental concepts and terminology.",
            content: "Placeholder for detailed content that will be generated separately",
            duration: 30
          }
        ]
      }
    ]
  });
}

function generateLessonContent(data) {
  const { lessonTitle, moduleTitle, courseTopic, difficulty, goal } = data;
  
  // This would normally contain logic to create lesson content
  // For now, we'll return a template response
  return JSON.stringify({
    title: lessonTitle,
    content: `# ${lessonTitle}\n\nThis lesson is part of the module "${moduleTitle}" in a ${difficulty} level course about ${courseTopic}.\n\n## Introduction\n\nThis section introduces the key concepts of ${lessonTitle}.\n\n## Main Content\n\nDetailed explanations and examples would be provided here.\n\n## Practice Questions\n\n1. Question one about ${lessonTitle}?\n   - Answer: Sample answer\n\n2. Question two about ${lessonTitle}?\n   - Answer: Sample answer`
  });
}

function generateQuizQuestions(data) {
  const { lessonTitle, difficulty, numberOfQuestions } = data;
  
  // This would normally contain logic to create quiz questions
  // For now, we'll return a template response
  const questions = [];
  for (let i = 1; i <= numberOfQuestions; i++) {
    questions.push({
      question: `Sample question ${i} about ${lessonTitle}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: `Explanation for question ${i}`
    });
  }
  
  return JSON.stringify({ questions });
}

// Map function names to their implementations
const namesToFunctions = {
  generateCourseStructure: (data) => generateCourseStructure(data),
  generateLessonContent: (data) => generateLessonContent(data),
  generateQuizQuestions: (data) => generateQuizQuestions(data)
};

/**
 * Generates an AI response using GitHub AI with function calling capabilities
 * @param {string} prompt - The prompt to send to the AI
 * @param {string} functionName - Optional specific function to call
 * @param {Object} functionArgs - Optional arguments for the function
 * @returns {Promise<string>} - The AI-generated response
 */
export const generateAIWithFunctions = async (prompt, functionName = null, functionArgs = null) => {
  console.log('@@@ githubAITools.js: generateAIWithFunctions CALLED @@@');
  try {
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);
    
    const token = process.env.GITHUB_TOKEN || process.env.GPT40_API_KEY;
    if (!token) {
      console.error('GitHub AI token not found in environment variables');
      throw new Error('GitHub AI token is required');
    }
    
    const endpoint = "https://models.github.ai/inference";
    const modelName = "openai/o4-mini";
    
    console.log('Initializing GitHub AI client...');
    const client = new OpenAI({ baseURL: endpoint, apiKey: token });
    
    // Determine which tools to include
    const tools = [];
    if (functionName === 'generateCourseStructure' || !functionName) {
      tools.push(courseGeneratorTool);
    }
    if (functionName === 'generateLessonContent' || !functionName) {
      tools.push(lessonContentTool);
    }
    if (functionName === 'generateQuizQuestions' || !functionName) {
      tools.push(quizGeneratorTool);
    }
    
    // Create system message
    const systemMessage = `
      You are an expert educational content creator with deep knowledge across various subjects.
      Your task is to generate accurate, comprehensive, and unique educational content.
      
      Follow these guidelines:
      1. Prioritize factual accuracy and educational value above all else
      2. Provide detailed explanations with concrete examples
      3. Structure content logically with clear headings and sections
      4. Use an engaging, educational tone appropriate for the specified difficulty level
      5. Include relevant examples, analogies, or case studies to illustrate concepts
      6. Avoid generic or superficial explanations
      7. Ensure content is unique and not repetitive of common online sources
      8. When appropriate, include practice questions that test understanding
    `;
    
    // Set up messages
    let messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt }
    ];
    
    // If we have a specific function and arguments, we can skip the initial AI call
    if (functionName && functionArgs) {
      console.log(`Direct function call to ${functionName} with args:`, functionArgs);
      const callableFunc = namesToFunctions[functionName];
      if (!callableFunc) {
        throw new Error(`Function ${functionName} not found`);
      }
      return callableFunc(functionArgs);
    }
    
    console.log('Sending request to GitHub AI API...');
    const startTime = Date.now();
    
    let response = await client.chat.completions.create({
      messages: messages,
      tools: tools,
      model: modelName
    });
    
    // We expect the model to ask for a tool call
    if (response.choices[0].finish_reason === "tool_calls") {
      // Append the model response to the chat history
      messages.push(response.choices[0].message);
      
      // We expect a single tool call
      if (response.choices[0].message && response.choices[0].message.tool_calls.length === 1) {
        const toolCall = response.choices[0].message.tool_calls[0];
        
        // We expect the tool to be a function call
        if (toolCall.type === "function") {
          // Parse the function call arguments and call the function
          const functionArgs = JSON.parse(toolCall.function.arguments);
          console.log(`Calling function \`${toolCall.function.name}\` with arguments:`, functionArgs);
          
          const callableFunc = namesToFunctions[toolCall.function.name];
          if (!callableFunc) {
            throw new Error(`Function ${toolCall.function.name} not found`);
          }
          
          const functionReturn = callableFunc(functionArgs);
          console.log(`Function returned = ${functionReturn.substring(0, 100)}...`);
          
          // Append the function call result to the chat history
          messages.push({
            "tool_call_id": toolCall.id,
            "role": "tool",
            "name": toolCall.function.name,
            "content": functionReturn,
          });
          
          // Get the final response
          response = await client.chat.completions.create({
            messages: messages,
            tools: tools,
            model: modelName
          });
          
          console.log(`Final model response = ${response.choices[0].message.content.substring(0, 100)}...`);
        }
      }
    }
    
    const endTime = Date.now();
    console.log(`AI response received in ${(endTime - startTime) / 1000} seconds`);
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response with functions:', error.message);
    if (error.response) {
      console.error('API response status:', error.response.status);
      console.error('API response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to generate AI content: ${error.message}`);
  }
};

/**
 * Generates a course structure using GitHub AI function calling
 * @param {Object} params - Course parameters
 * @returns {Promise<Object>} - The generated course structure
 */
export const generateCourseWithFunctions = async (params) => {
  const { topic, difficulty, goal, duration } = params;
  
  try {
    const prompt = `Create a comprehensive course on "${topic}" for ${difficulty} level students with a focus on ${goal} learning.`;
    
    const result = await generateAIWithFunctions(prompt, 'generateCourseStructure', {
      topic,
      difficulty,
      goal,
      duration
    });
    
    return JSON.parse(result);
  } catch (error) {
    console.error('Error generating course with functions:', error.message);
    throw error;
  }
};

/**
 * Generates lesson content using GitHub AI function calling
 * @param {Object} params - Lesson parameters
 * @returns {Promise<Object>} - The generated lesson content
 */
export const generateLessonWithFunctions = async (params) => {
  const { lessonTitle, moduleTitle, courseTopic, difficulty, goal } = params;
  
  try {
    const prompt = `Create detailed content for the lesson "${lessonTitle}" in the module "${moduleTitle}" for a ${difficulty} level course on ${courseTopic}.`;
    
    const result = await generateAIWithFunctions(prompt, 'generateLessonContent', {
      lessonTitle,
      moduleTitle,
      courseTopic,
      difficulty,
      goal
    });
    
    return JSON.parse(result);
  } catch (error) {
    console.error('Error generating lesson with functions:', error.message);
    throw error;
  }
};

/**
 * Generates quiz questions using GitHub AI function calling
 * @param {Object} params - Quiz parameters
 * @returns {Promise<Object>} - The generated quiz questions
 */
export const generateQuizWithFunctions = async (params) => {
  const { lessonTitle, lessonContent, difficulty, numberOfQuestions } = params;
  
  try {
    const prompt = `Create ${numberOfQuestions} quiz questions for the lesson "${lessonTitle}" at ${difficulty} level.`;
    
    const result = await generateAIWithFunctions(prompt, 'generateQuizQuestions', {
      lessonTitle,
      lessonContent,
      difficulty,
      numberOfQuestions
    });
    
    return JSON.parse(result);
  } catch (error) {
    console.error('Error generating quiz with functions:', error.message);
    throw error;
  }
};