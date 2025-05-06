import Content from "../models/content.model.js";
import axios from 'axios';
import dotenv from 'dotenv';
import { generateWithGitHubAI } from '../utils/githubAI.js';

// Ensure environment variables are loaded
dotenv.config();
 
// Helper function to search for YouTube videos with improved relevance and error handling
async function searchYouTubeVideos(query, maxResults = 3, relevanceThreshold = 0.6) {
    try {
        if (!process.env.YOUTUBE_API_KEY) {
            console.warn('YouTube API key is not set in environment variables');
            return [];
        }
        
        const API_KEY = process.env.YOUTUBE_API_KEY;
        
        // Add educational content filter to improve relevance
        const enhancedQuery = `${query} tutorial educational`;
        
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                maxResults: maxResults * 2, // Fetch more results to filter for relevance
                q: enhancedQuery,
                key: API_KEY,
                type: 'video',
                videoEmbeddable: true,
                relevanceLanguage: 'en',
                safeSearch: 'moderate',
                videoDefinition: 'high'
            }
        });

        if (!response.data.items || response.data.items.length === 0) {
            console.log(`No YouTube videos found for query: ${query}`);
            return [];
        }

        // Process and filter videos for relevance
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.default.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            publishedAt: item.snippet.publishedAt,
            // Simple relevance score based on title and description matching
            relevanceScore: calculateRelevance(query, item.snippet.title, item.snippet.description)
        }));

        // Sort by relevance and return top results
        return videos
            .filter(video => video.relevanceScore >= relevanceThreshold)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, maxResults);
            
    } catch (error) {
        console.error('Error searching YouTube videos:', error.message);
        // More detailed error handling
        if (error.response) {
            console.error('YouTube API error response:', error.response.data);
            if (error.response.status === 403) {
                console.error('API key may be invalid or quota exceeded');
            }
        }
        return [];
    }
}

// Helper function to calculate relevance score between query and video metadata
function calculateRelevance(query, title, description) {
    const queryTerms = query.toLowerCase().split(' ');
    const titleLower = title.toLowerCase();
    const descriptionLower = description.toLowerCase();
    
    // Calculate how many query terms appear in title and description
    const titleMatches = queryTerms.filter(term => titleLower.includes(term)).length;
    const descriptionMatches = queryTerms.filter(term => descriptionLower.includes(term)).length;
    
    // Weight title matches more heavily than description matches
    const titleWeight = 0.7;
    const descriptionWeight = 0.3;
    
    // Calculate normalized scores
    const titleScore = queryTerms.length > 0 ? (titleMatches / queryTerms.length) * titleWeight : 0;
    const descriptionScore = queryTerms.length > 0 ? (descriptionMatches / queryTerms.length) * descriptionWeight : 0;
     
    return titleScore + descriptionScore;
}

// Generate a course with AI
export const generateCourse = async (req, res, next) => {
    try {
        // Validate required fields
        const { topic, level, learningGoal, estimatedDuration, category, userId } = req.body;
        
        if (!topic || !level || !learningGoal || !estimatedDuration || !category || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                requiredFields: ['topic', 'level', 'learningGoal', 'estimatedDuration', 'category', 'userId']
            });
        }
        
        // Validate level and learningGoal against allowed values
        const allowedLevels = ['Beginner', 'Intermediate', 'Advanced'];
        const allowedGoals = ['Career', 'Academic', 'Personal'];
        
        if (!allowedLevels.includes(level)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid level value',
                allowedValues: allowedLevels
            });
        }
        
        if (!allowedGoals.includes(learningGoal)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid learningGoal value',
                allowedValues: allowedGoals
            });
        }
        
        console.log(`Generating ${level} level course on "${topic}" for ${learningGoal} purposes...`);
        
        // Check for required API keys
        const missingKeys = [];
        if (!process.env.GPT40_API_KEY) {
            console.warn('GPT40_API_KEY is not set in environment variables. Will use fallback content generation.');
            missingKeys.push('GPT40_API_KEY');
        }
        
        if (!process.env.YOUTUBE_API_KEY) {
            console.warn('YOUTUBE_API_KEY is not set in environment variables. YouTube video enrichment will be skipped.');
            missingKeys.push('YOUTUBE_API_KEY');
        }
        
        // Generate a more comprehensive course structure based on difficulty level
        const courseStructure = generateCourseStructure(topic, level, learningGoal, estimatedDuration, category, userId);
        
        // Generate AI notes for each lesson
        console.log('Generating AI notes for lessons...');
        await enrichCourseWithNotes(courseStructure, topic);
        
        // Find relevant YouTube videos for each lesson with improved search
        console.log('Enriching course with relevant YouTube videos...');
        await enrichCourseWithVideos(courseStructure, topic);
        
        // Save the course to the database
        console.log('Saving course to database...');
        const newContent = new Content(courseStructure);
        await newContent.save();
        
        // Calculate course statistics for response
        const totalModules = courseStructure.modules.length;
        const totalLessons = courseStructure.modules.reduce((sum, module) => sum + module.lessons.length, 0);
        const totalVideos = courseStructure.modules.reduce((sum, module) => {
            return sum + module.lessons.filter(lesson => lesson.youtubeVideoUrl).length;
        }, 0);
        
        console.log(`Course generated successfully: ${totalModules} modules, ${totalLessons} lessons, ${totalVideos} videos`);
        
        // Prepare response with warning about missing API keys if applicable
        const response = {
            success: true,
            message: 'Course generated successfully',
            stats: {
                modules: totalModules,
                lessons: totalLessons,
                videos: totalVideos
            },
            course: newContent
        };
        
        if (missingKeys.length > 0) {
            response.warnings = {
                message: 'Course generated with limited features due to missing API keys',
                missingKeys: missingKeys,
                impact: missingKeys.includes('GPT40_API_KEY') ? 'Using fallback content instead of AI-generated notes' : ''
                    + (missingKeys.includes('YOUTUBE_API_KEY') ? 'YouTube video recommendations may be limited or missing' : '')
            };
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error generating course:', error);
        
        // Provide more specific error messages based on error type
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.message
            });
        }
        
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({
                success: false,
                message: 'A course with similar properties already exists'
            });
        }
        
        // Handle API-related errors more gracefully
        if (error.message && (error.message.includes('API') || error.message.includes('network'))) {
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable',
                details: 'There was an issue connecting to one of our external services. Please try again later.',
                error: error.message
            });
        }
        
        // For other errors, pass to the error handler middleware
        next(error);
    }
};

// Helper function to generate a comprehensive course structure
function generateCourseStructure(topic, level, learningGoal, estimatedDuration, category, userId) {
    // Determine number of modules and lessons based on course duration and level
    const moduleCount = determineModuleCount(level, estimatedDuration);
    
    // Create course title and description based on topic and learning goal
    let courseTitle, courseDescription;
    
    switch(learningGoal) {
        case 'Career':
            courseTitle = `${topic} - Professional Career Track`;
            courseDescription = `Master ${topic} with this comprehensive career-focused course designed for ${level.toLowerCase()} learners. Gain the skills needed to advance your professional career.`;
            break;
        case 'Academic':
            courseTitle = `${topic} - Academic Study Program`;
            courseDescription = `A structured academic approach to ${topic} for ${level.toLowerCase()} students. Develop a thorough understanding of theoretical concepts and practical applications.`;
            break;
        case 'Personal':
            courseTitle = `${topic} - Personal Learning Journey`;
            courseDescription = `Explore ${topic} at your own pace with this ${level.toLowerCase()}-level course designed for personal growth and skill development.`;
            break;
        default:
            courseTitle = `${topic} - Complete Course`;
            courseDescription = `A comprehensive course on ${topic} for ${level.toLowerCase()} learners.`;
    }
    
    // Create the base course structure
    const courseStructure = {
        title: courseTitle,
        description: courseDescription,
        level,
        learningGoal,
        estimatedDuration,
        category,
        createdBy: userId,
        modules: []
    };
    
    // Generate modules based on difficulty level
    generateModules(courseStructure, topic, level, moduleCount);
    
    return courseStructure;
}

// Helper function to determine the appropriate number of modules based on course parameters
function determineModuleCount(level, estimatedDuration) {
    // Base module count on course duration and adjust by difficulty level
    let baseCount = Math.max(3, Math.ceil(estimatedDuration / 2));
    
    // Adjust based on difficulty level
    switch(level) {
        case 'Beginner':
            return Math.min(baseCount, 5); // Beginners need fewer, more comprehensive modules
        case 'Intermediate':
            return Math.min(baseCount + 1, 7); // More detailed breakdown
        case 'Advanced':
            return Math.min(baseCount + 2, 10); // Most detailed for advanced learners
        default:
            return baseCount;
    }
}

// Helper function to generate modules and lessons
function generateModules(courseStructure, topic, level, moduleCount) {
    // Define module templates based on common course progression
    const moduleTemplates = [ 
        {
            title: `Introduction to ${topic}`,
            description: `Learn the fundamentals of ${topic} and understand why it's important.`,
            lessonCount: level === 'Beginner' ? 3 : 2,
            lessonTemplates: [
                {
                    title: `Getting Started with ${topic}`,
                    summary: `An overview of ${topic} and its significance.`,
                    content: `This lesson introduces you to ${topic}, explaining its core concepts and importance in the field. You'll learn about the history, current applications, and future trends of ${topic}.`,
                    duration: 20
                },
                {
                    title: `Key Concepts in ${topic}`,
                    summary: `Understanding the fundamental principles of ${topic}.`,
                    content: `This lesson covers the essential concepts and terminology you need to know to build a strong foundation in ${topic}. We'll break down complex ideas into easy-to-understand components.`,
                    duration: 25
                },
                {
                    title: `${topic} in Practice`,
                    summary: `See how ${topic} is applied in real-world scenarios.`,
                    content: `This lesson demonstrates practical applications of ${topic} through real-world examples and case studies. You'll gain insight into how professionals use ${topic} to solve problems and create value.`,
                    duration: 30
                }
            ]
        },
        {
            title: `Core ${topic} Skills`,
            description: `Develop essential skills and techniques in ${topic}.`,
            lessonCount: level === 'Beginner' ? 3 : 4,
            lessonTemplates: [
                {
                    title: `Essential ${topic} Techniques`,
                    summary: `Learn the fundamental techniques used in ${topic}.`,
                    content: `This lesson teaches you the core techniques that form the backbone of ${topic}. You'll learn step-by-step approaches to common tasks and challenges.`,
                    duration: 35
                },
                {
                    title: `Problem Solving with ${topic}`,
                    summary: `Apply ${topic} principles to solve common problems.`,
                    content: `This lesson focuses on developing your problem-solving skills using ${topic}. You'll work through examples that demonstrate how to approach and resolve typical challenges.`,
                    duration: 40
                },
                {
                    title: `Building Your First ${topic} Project`,
                    summary: `Create a simple project using your new ${topic} skills.`,
                    content: `This lesson guides you through creating your first project with ${topic}. You'll apply what you've learned so far to build something tangible and gain hands-on experience.`,
                    duration: 45
                }
            ]
        },
        {
            title: `Advanced ${topic} Concepts`,
            description: `Deepen your understanding with advanced ${topic} principles and methods.`,
            lessonCount: level === 'Advanced' ? 4 : 3,
            lessonTemplates: [
                {
                    title: `Advanced ${topic} Theory`,
                    summary: `Explore complex theoretical aspects of ${topic}.`,
                    content: `This lesson delves into the advanced theoretical foundations of ${topic}. You'll examine sophisticated concepts that underpin modern applications and research in the field.`,
                    duration: 40
                },
                {
                    title: `Specialized ${topic} Techniques`,
                    summary: `Master specialized techniques used by ${topic} professionals.`,
                    content: `This lesson introduces you to specialized techniques that are used by experts in ${topic}. You'll learn approaches that go beyond the basics and enable more sophisticated applications.`,
                    duration: 45
                },
                {
                    title: `Optimizing ${topic} Performance`,
                    summary: `Learn how to optimize and improve ${topic} implementations.`,
                    content: `This lesson focuses on optimization strategies for ${topic}. You'll discover methods to enhance efficiency, effectiveness, and overall performance in your ${topic} work.`,
                    duration: 50
                }
            ]
        },
        {
            title: `${topic} in the Real World`,
            description: `Apply ${topic} in practical, real-world contexts and scenarios.`,
            lessonCount: 3,
            lessonTemplates: [
                {
                    title: `${topic} Case Studies`,
                    summary: `Analyze real-world examples of ${topic} in action.`,
                    content: `This lesson presents detailed case studies that demonstrate ${topic} in real-world contexts. You'll analyze how ${topic} principles are applied to solve complex problems across different industries.`,
                    duration: 35
                },
                {
                    title: `Current Trends in ${topic}`,
                    summary: `Explore the latest developments and trends in ${topic}.`,
                    content: `This lesson examines current trends and emerging developments in the field of ${topic}. You'll learn about cutting-edge applications, research directions, and how the field is evolving.`,
                    duration: 30
                },
                {
                    title: `${topic} Best Practices`,
                    summary: `Learn industry-standard best practices for ${topic}.`,
                    content: `This lesson covers established best practices in ${topic} that professionals follow. You'll learn guidelines, standards, and approaches that ensure quality and effectiveness in your ${topic} work.`,
                    duration: 40
                }
            ]
        },
        {
            title: `Mastering ${topic}`,
            description: `Take your ${topic} skills to the expert level with advanced projects and techniques.`,
            lessonCount: level === 'Advanced' ? 4 : 3,
            lessonTemplates: [
                {
                    title: `Advanced ${topic} Project`,
                    summary: `Build a comprehensive project showcasing advanced ${topic} skills.`,
                    content: `This lesson guides you through creating a sophisticated project that demonstrates mastery of ${topic}. You'll apply advanced concepts and techniques to create something impressive for your portfolio.`,
                    duration: 60
                },
                {
                    title: `Troubleshooting ${topic} Issues`,
                    summary: `Learn to identify and resolve common problems in ${topic}.`,
                    content: `This lesson focuses on troubleshooting and debugging in ${topic}. You'll learn systematic approaches to identifying, diagnosing, and resolving issues that commonly arise in ${topic} work.`,
                    duration: 45
                },
                {
                    title: `${topic} Integration Strategies`,
                    summary: `Discover how to integrate ${topic} with other systems and technologies.`,
                    content: `This lesson explores how ${topic} can be integrated with other technologies and systems. You'll learn strategies for creating cohesive solutions that leverage multiple tools and approaches.`,
                    duration: 50
                }
            ]
        }
    ];
    
    // Add modules to the course structure based on the determined count
    const modulesToUse = moduleCount <= moduleTemplates.length ? 
        moduleTemplates.slice(0, moduleCount) : 
        [...moduleTemplates, ...generateAdditionalModules(topic, moduleCount - moduleTemplates.length)];
    
    // Add modules to course structure with proper ordering
    modulesToUse.forEach((moduleTemplate, index) => {
        const module = {
            title: moduleTemplate.title,
            description: moduleTemplate.description,
            order: index + 1,
            lessons: []
        };
        
        // Determine how many lessons to include based on the template and level
        const lessonCount = Math.min(
            moduleTemplate.lessonCount || 3,
            moduleTemplate.lessonTemplates?.length || 3
        );
        
        // Add lessons to the module
        for (let i = 0; i < lessonCount; i++) {
            if (moduleTemplate.lessonTemplates && i < moduleTemplate.lessonTemplates.length) {
                const lessonTemplate = moduleTemplate.lessonTemplates[i];
                
                // Create quiz questions for the lesson
                const quizQuestions = generateQuizQuestions(topic, lessonTemplate.title, lessonTemplate.quizCount || 2);
                
                // Add the lesson to the module
                module.lessons.push({
                    title: lessonTemplate.title,
                    summary: lessonTemplate.summary,
                    content: lessonTemplate.content,
                    duration: lessonTemplate.duration || 30,
                    quizQuestions
                });
            }
        }
        
        courseStructure.modules.push(module);
    });
}

// Helper function to generate additional modules if needed
function generateAdditionalModules(topic, count) {
    const additionalModules = [];
    
    const specializations = [
        'Advanced Applications',
        'Specialized Techniques',
        'Future Trends',
        'Research Methods',
        'Professional Practice'
    ];
    
    for (let i = 0; i < count; i++) {
        const specializationIndex = i % specializations.length;
        
        additionalModules.push({
            title: `${topic} ${specializations[specializationIndex]}`,
            description: `Explore specialized aspects of ${topic} related to ${specializations[specializationIndex].toLowerCase()}.`,
            lessonCount: 3,
            lessonTemplates: [
                {
                    title: `Introduction to ${topic} ${specializations[specializationIndex]}`,
                    summary: `Learn the fundamentals of ${specializations[specializationIndex].toLowerCase()} in ${topic}.`,
                    content: `This lesson introduces you to ${specializations[specializationIndex].toLowerCase()} in the context of ${topic}. You'll explore how these specialized approaches enhance and extend the core principles of ${topic}.`,
                    duration: 40,
                    quizCount: 2
                },
                {
                    title: `Practical ${topic} ${specializations[specializationIndex]}`,
                    summary: `Apply specialized ${topic} techniques in practical scenarios.`,
                    content: `This lesson focuses on practical applications of ${specializations[specializationIndex].toLowerCase()} in ${topic}. You'll work through examples and exercises that demonstrate these specialized approaches in action.`,
                    duration: 45,
                    quizCount: 3
                },
                {
                    title: `Advanced ${topic} ${specializations[specializationIndex]}`,
                    summary: `Master advanced aspects of ${specializations[specializationIndex].toLowerCase()} in ${topic}.`,
                    content: `This lesson covers advanced concepts and techniques related to ${specializations[specializationIndex].toLowerCase()} in ${topic}. You'll develop sophisticated skills that set you apart as a ${topic} specialist.`,
                    duration: 50,
                    quizCount: 3
                }
            ]
        });
    }
    
    return additionalModules;
}

// Note: Quiz generation functionality has been removed to simplify the course structure
function generateQuizQuestions(topic, lessonTitle, count) {
    // Return empty array as quiz functionality has been removed
    return [];
}

// Helper function to validate YouTube API key
// Function to generate lesson notes using GitHub's GPT-40 API
// Falls back to local content generation if API is unavailable
async function generateLessonNotes(topic, lessonTitle, level) {
    try {
        // First check if GitHub AI token is available
        if (!validateGitHubAIToken()) {
            console.log(`Using local content generation for lesson: ${lessonTitle} (API key not available)`);
            return generateLocalContent(topic, lessonTitle, level);
        }
        
        console.log(`Generating AI content for lesson: ${lessonTitle}`);
        
        // Create a detailed prompt for the GitHub AI model
        const prompt = `
            Create comprehensive educational content for a lesson titled "${lessonTitle}" 
            within a course about "${topic}" at a ${level} level.
            
            The content should include:
            - A clear introduction explaining the importance of this topic
            - Detailed explanations of key concepts
            - Practical applications and examples
            - Historical context where relevant
            - Common misconceptions and clarifications
            - Best practices and tips
            - A summary of the main points
            
            Format the content with Markdown headings and bullet points for readability.
            Ensure the content is accurate, educational, and engaging for ${level.toLowerCase()} level students.
        `;
        
        // Set a timeout for the API call to prevent long-running requests
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AI content generation timed out')), 15000);
        });
        
        // Generate content using GitHub's AI model with timeout
        const aiContent = await Promise.race([
            generateWithGitHubAI(prompt),
            timeoutPromise
        ]);
        
        // If AI generation fails, fall back to local content generation
        if (!aiContent) {
            console.log(`Falling back to local content generation for lesson: ${lessonTitle} (No content returned)`);
            return generateLocalContent(topic, lessonTitle, level);
        }
        
        return aiContent;
    } catch (error) {
        console.warn('Error generating lesson notes with AI:', error.message);
        // Fall back to local content generation
        console.log(`Falling back to local content generation for lesson: ${lessonTitle} (Error: ${error.message})`);
        return generateLocalContent(topic, lessonTitle, level);
    }
}

// Helper function to generate content locally without external API calls
function generateLocalContent(topic, lessonTitle, level) {
    // Determine depth and complexity based on level
    const complexityLevel = level === 'Beginner' ? 'fundamental' : 
                           level === 'Intermediate' ? 'intermediate' : 'advanced';
    
    // Create a structured content template
    const content = `# ${lessonTitle}

## Introduction

This lesson explores ${lessonTitle.toLowerCase()} in the context of ${topic}. We'll cover the ${complexityLevel} concepts, practical applications, and best practices to help you master this subject.

## Key Concepts

### What is ${lessonTitle.split(' ').pop()}?

${lessonTitle.split(' ').pop()} is a crucial component of ${topic} that involves understanding how different elements interact and function together. At the ${level.toLowerCase()} level, we focus on ${level === 'Beginner' ? 'building a solid foundation' : level === 'Intermediate' ? 'expanding your knowledge with more complex scenarios' : 'mastering advanced techniques and theoretical frameworks'}.

### Core Principles

1. **Fundamental Understanding**: Grasp the basic concepts and terminology related to ${topic} and ${lessonTitle.toLowerCase()}
2. **Practical Application**: Learn how to apply these concepts in real-world scenarios
3. **Problem-Solving Approach**: Develop strategies to address common challenges in this area
4. **Integration Knowledge**: Understand how ${lessonTitle.toLowerCase()} connects with other aspects of ${topic}

## Detailed Explanation

${lessonTitle} encompasses several important aspects that are essential for anyone studying ${topic}. Let's explore these in detail:

### Historical Context

The development of ${lessonTitle.toLowerCase()} within ${topic} has evolved significantly over time. Initially, practitioners focused on ${level === 'Beginner' ? 'basic implementation and understanding' : level === 'Intermediate' ? 'improving efficiency and expanding applications' : 'theoretical advancements and pushing boundaries'}. This evolution has shaped how we approach ${topic} today.

### Practical Applications

${lessonTitle} is applied in numerous real-world scenarios, including:

- Professional environments where ${topic} expertise is required
- Research and development of new ${topic} methodologies
- Educational contexts for teaching ${topic} concepts
- Personal projects that leverage ${topic} for creative or practical solutions

### Common Misconceptions

When studying ${lessonTitle.toLowerCase()}, students often encounter these misconceptions:

1. **Oversimplification**: Assuming that ${topic} concepts are simpler than they actually are
2. **Scope Limitations**: Not recognizing how broadly ${lessonTitle.toLowerCase()} applies across different domains
3. **Static Knowledge**: Treating ${topic} as a fixed body of knowledge rather than an evolving field

## Best Practices

To master ${lessonTitle.toLowerCase()}, consider these best practices:

1. **Regular Practice**: Consistently apply what you learn about ${topic}
2. **Diverse Examples**: Study ${lessonTitle.toLowerCase()} across multiple contexts and applications
3. **Peer Learning**: Discuss ${topic} concepts with others to deepen understanding
4. **Applied Projects**: Create projects that implement ${lessonTitle.toLowerCase()} principles

## Advanced Considerations

${level === 'Advanced' ? `As an advanced student of ${topic}, you should consider these sophisticated aspects of ${lessonTitle.toLowerCase()}:

1. **Theoretical Frameworks**: Understand the underlying theories that inform current practices
2. **Edge Cases**: Explore unusual or challenging scenarios where standard approaches may fail
3. **Innovation Opportunities**: Identify areas where new approaches to ${lessonTitle.toLowerCase()} could advance the field
` : level === 'Intermediate' ? `As you progress in your study of ${topic}, consider these more nuanced aspects of ${lessonTitle.toLowerCase()}:

1. **Efficiency Optimization**: Learn techniques to improve the effectiveness of your approaches
2. **Integration Challenges**: Understand how to combine ${lessonTitle.toLowerCase()} with other aspects of ${topic}
3. **Adaptability**: Develop the ability to modify approaches based on specific contexts
` : `As you continue learning about ${topic}, you'll eventually explore these more advanced aspects of ${lessonTitle.toLowerCase()}:

1. **Building Complexity**: How to move from basic to more sophisticated implementations
2. **Connecting Concepts**: Understanding how ${lessonTitle.toLowerCase()} relates to other fundamental aspects of ${topic}
3. **Preparation for Advancement**: Key areas to focus on as you progress to intermediate studies
`}

## Summary

In this lesson on ${lessonTitle.toLowerCase()}, we've covered:

- The fundamental concepts and principles of ${lessonTitle.toLowerCase()} in ${topic}
- Practical applications and real-world relevance
- Common misconceptions and how to avoid them
- Best practices for mastering this subject area
- ${level === 'Beginner' ? 'Foundations for future learning' : level === 'Intermediate' ? 'More advanced considerations as you progress' : 'Sophisticated aspects for expert-level understanding'}

Continue practicing these concepts and applying them in different contexts to deepen your understanding of ${topic}.`;
    
    return content;
}

// Function to enrich course with AI-generated notes
async function enrichCourseWithNotes(courseStructure, topic) {
    try {
        console.log('Starting to generate AI notes for lessons...');
        
        // Check if GitHub AI token is available
        const hasGitHubAIToken = !!process.env.GPT40_API_KEY;
        if (!hasGitHubAIToken) {
            console.warn('GPT40_API_KEY is not set. Using fallback content generation for all lessons.');
            // Add a note to each lesson about using fallback content
            for (const module of courseStructure.modules) {
                for (const lesson of module.lessons) {
                    // Generate fallback content directly
                    lesson.aiNotes = generateLocalContent(topic, lesson.title, courseStructure.level);
                    lesson.contentNote = "This content was generated using our built-in system. For enhanced AI-generated content, please check your environment settings.";
                }
            }
            console.log('Fallback content generation completed for all lessons.');
            return;
        }
        
        // Track success rate for note generation
        let totalLessons = 0;
        let successfulGenerations = 0;
        
        for (const module of courseStructure.modules) {
            for (const lesson of module.lessons) {
                totalLessons++;
                
                try {
                    // Generate AI notes for this lesson
                    const notes = await generateLessonNotes(topic, lesson.title, courseStructure.level);
                    
                    if (notes) {
                        // Add the AI-generated notes to the lesson
                        lesson.aiNotes = notes;
                        successfulGenerations++;
                    } else {
                        // If AI generation failed, use fallback content
                        lesson.aiNotes = generateLocalContent(topic, lesson.title, courseStructure.level);
                        lesson.contentNote = "This content was generated using our built-in system due to an issue with the AI service.";
                    }
                } catch (lessonError) {
                    console.warn(`Error generating notes for lesson "${lesson.title}" with GPT-4o:`, lessonError.message);
                    // Use fallback content for this lesson
                    lesson.aiNotes = generateLocalContent(topic, lesson.title, courseStructure.level);
                    lesson.contentNote = "This content was generated using our built-in system due to an issue with the AI service.";
                }
            }
        }
        
        // Log success rate
        const successRate = totalLessons > 0 ? (successfulGenerations / totalLessons) * 100 : 0;
        console.log(`AI notes generation completed: ${successfulGenerations}/${totalLessons} notes generated (${successRate.toFixed(1)}%)`);
        
    } catch (error) {
        console.warn('Error enriching course with AI notes:', error.message);
        console.log('Falling back to local content generation for all lessons');
        
        // Fallback: Generate local content for all lessons
        for (const module of courseStructure.modules) {
            for (const lesson of module.lessons) {
                lesson.aiNotes = generateLocalContent(topic, lesson.title, courseStructure.level);
                lesson.contentNote = "This content was generated using our built-in system due to a technical issue.";
            }
        }
    }
}

// Helper function to validate YouTube API key
async function validateYouTubeApiKey() {
    if (!process.env.YOUTUBE_API_KEY) {
        console.warn('YouTube API key is not set in environment variables');
        return false;
    }
    
    try {
        // Make a minimal API call to validate the key
        const API_KEY = process.env.YOUTUBE_API_KEY;
        await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet',
                id: 'dQw4w9WgXcQ', // Use a known video ID for validation
                key: API_KEY
            }
        });
        return true;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.warn('YouTube API key validation failed: Invalid key or quota exceeded');
        } else {
            console.warn('YouTube API key validation failed:', error.message);
        }
        return false;
    }
}

// Helper function to validate GitHub AI token
function validateGitHubAIToken() {
    if (!process.env.GPT40_API_KEY) {
        console.warn('GitHub AI token (GPT40_API_KEY) is not set in environment variables');
        return false;
    }
    return true;
}

// Helper function to enrich course with relevant YouTube videos
async function enrichCourseWithVideos(courseStructure, topic) {
    // Validate YouTube API key before making any requests
    const isApiKeyValid = await validateYouTubeApiKey();
    if (!isApiKeyValid) {
        console.warn('Skipping YouTube video enrichment due to invalid or missing API key');
        // Add a note to each lesson about missing videos
        for (const module of courseStructure.modules) {
            for (const lesson of module.lessons) {
                lesson.videoNote = "YouTube video recommendations are not available. Please check the course settings or try again later.";
            }
        }
        return;
    }
    
    // Track success rate for video fetching
    let totalLessons = 0;
    let successfulFetches = 0;
    
    try {
        for (const module of courseStructure.modules) {
            for (const lesson of module.lessons) {
                totalLessons++;
                
                try {
                    // Create a specific search query combining topic and lesson title
                    const searchQuery = `${topic} ${lesson.title}`;
                    
                    // Search for relevant videos
                    const videos = await searchYouTubeVideos(searchQuery);
                    
                    // Add the most relevant video URL to the lesson if available
                    if (videos.length > 0) {
                        lesson.youtubeVideoUrl = videos[0].url;
                        successfulFetches++;
                    }
                } catch (lessonError) {
                    console.error(`Error fetching video for lesson "${lesson.title}":`, lessonError.message);
                    // Continue with next lesson
                }
            }
        }
        
        // Log success rate
        const successRate = totalLessons > 0 ? (successfulFetches / totalLessons) * 100 : 0;
        console.log(`YouTube video enrichment completed: ${successfulFetches}/${totalLessons} videos found (${successRate.toFixed(1)}%)`);
        
    } catch (error) {
        console.error('Error enriching course with videos:', error.message);
        // Continue without videos if there's an error
    }
}

// Create content manually
export const createContent = async(req, res, next) => {
    const {title, description, level, learningGoal, estimatedDuration, modules, category, userId} = req.body;

    try {
        const newContent = new Content({
            title,
            description,
            level,
            learningGoal,
            estimatedDuration,
            modules,
            category,
            createdBy: userId
        });  
        await newContent.save();
        res.status(200).json({message: 'Content created successfully', content: newContent});
    } catch (error) {
        next(error);
    }
};

// Get all courses for a user
export const getUserCourses = async (req, res, next) => {
    const { userId } = req.params;
    
    try {
        const courses = await Content.find({ createdBy: userId });
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

// Get a specific course by ID
export const getCourseById = async (req, res, next) => {
    const { courseId } = req.params;
    
    try {
        const course = await Content.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

// Get community courses with filtering and pagination
export const getCommunityCoursesWithFilters = async (req, res, next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            level, 
            category, 
            learningGoal,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search,
            excludeUserId
        } = req.query;
        
        // Build filter object - removed isPublic filter to show all courses
        const filter = {};
        
        // Add optional filters if provided
        if (level) filter.level = level;
        if (category) filter.category = category;
        if (learningGoal) filter.learningGoal = learningGoal;
        
        // Exclude user's own courses if requested
        if (excludeUserId) filter.createdBy = { $ne: excludeUserId };
        
        // Add search functionality
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Determine sort direction
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        
        // Create sort object
        const sort = {};
        sort[sortBy] = sortDirection;
        
        // Execute query with pagination and populate creator information
        const courses = await Content.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'username profilePicture')
            .lean();
            
        // Get total count for pagination
        const totalCourses = await Content.countDocuments(filter);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalCourses / parseInt(limit));
        
        res.status(200).json({
            courses,
            pagination: {
                total: totalCourses,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching community courses:', error);
        next(error);
    }
};