import { generateCourseWithFunctions, generateLessonWithFunctions, generateQuizWithFunctions } from '../utils/githubAITools.js';
import Content from '../models/content.model.js';
import { errorHandler } from '../utils/error.js';

/**
 * Controller for generating course content using GitHub AI function calling capabilities
 */

// Generate a course with AI function calling
export const generateCourseWithAI = async (req, res, next) => {
  console.log('@@@ aiContent.controller.js: generateCourseWithAI CALLED @@@');
  try {
    console.log('=== STARTING COURSE GENERATION WITH GITHUB AI FUNCTIONS ===');
    console.log('Course parameters:', JSON.stringify(req.body, null, 2));
    console.log('Timestamp:', new Date().toISOString());
    
    const { topic, difficulty, goal, duration, userId } = req.body;
    
    if (!topic) {
      console.error('Missing required parameter: topic');
      return next(errorHandler(400, 'Topic is required'));
    }
    
    console.log(`Generating course structure for topic: ${topic}, difficulty: ${difficulty}, goal: ${goal}`);
    
    // Step 1: Generate course structure with modules and lessons using function calling
    console.log('=== STEP 1: GENERATING COURSE STRUCTURE WITH GITHUB AI FUNCTIONS ===');
    console.time('courseStructureGeneration');
    
    const courseData = await generateCourseWithFunctions({
      topic,
      difficulty: difficulty || 'Intermediate',
      goal: goal || 'Academic',
      duration: duration || '4'
    });
    
    console.timeEnd('courseStructureGeneration');
    console.log('Successfully generated course structure');
    console.log(`Course title: "${courseData.title}", with ${courseData.modules.length} modules`);
    
    // Step 2: Generate detailed content for each lesson using function calling
    console.log('=== STEP 2: GENERATING DETAILED CONTENT FOR EACH LESSON ===');
    let lessonCounter = 0;
    const totalLessons = courseData.modules.reduce((count, module) => count + module.lessons.length, 0);
    console.log(`Total lessons to generate: ${totalLessons}`);
    
    for (const module of courseData.modules) {
      console.log(`Processing module ${module.order}: ${module.title}`);
      
      for (const lesson of module.lessons) {
        lessonCounter++;
        console.log(`Generating content for lesson ${lessonCounter}/${totalLessons}: ${lesson.title}`);
        
        // Generate detailed content for the lesson using function calling
        console.time(`lesson_${lessonCounter}_generation`);
        
        const lessonData = await generateLessonWithFunctions({
          lessonTitle: lesson.title,
          moduleTitle: module.title,
          courseTopic: topic,
          difficulty: courseData.level,
          goal: goal || 'Academic'
        });
        
        console.timeEnd(`lesson_${lessonCounter}_generation`);
        console.log(`Received content for lesson: ${lesson.title}`);
        
        // Store the AI-generated content
        lesson.content = lessonData.content;
      }
    }
    
    // Step 3: Skipping quiz generation as per requirements
    console.log('=== STEP 3: SKIPPING QUIZ GENERATION ===');
    console.log('Quiz generation has been removed as per requirements to focus on detailed content');
    
    // Initialize empty quiz arrays for database compatibility
    for (const module of courseData.modules) {
      module.quiz = [];
    }
    
    // Step 4: Save the complete course to the database
    console.log('=== STEP 4: SAVING COURSE TO DATABASE ===');
    
    const newContent = new Content({
      title: courseData.title,
      description: courseData.description,
      topic,
      level: courseData.level,
      learningGoal: goal || 'Academic',
      estimatedDuration: parseInt(duration || '4'),
      modules: courseData.modules,
      category: topic, // Using topic as category if not specified
      createdBy: userId, // Map userId to createdBy as required by the schema
      createdWith: 'github-ai-functions'
    });
    
    const savedContent = await newContent.save();
    console.log('Course saved successfully with ID:', savedContent._id);
    
    return res.status(201).json(savedContent);
  } catch (error) {
    console.error('Error generating course with GitHub AI functions:', error.message);
    return next(errorHandler(500, `Failed to generate course: ${error.message}`));
  }
};

// Generate quiz questions for a specific lesson or module - DISABLED
export const generateQuizForContent = async (req, res, next) => {
  try {
    // Return a message indicating that quiz generation has been disabled
    return res.status(200).json({
      message: "Quiz generation has been disabled in this version. The application now focuses on providing detailed educational content without quizzes.",
      questions: []
    });
  } catch (error) {
    console.error('Error in quiz generation endpoint:', error.message);
    return next(errorHandler(500, `An error occurred: ${error.message}`));
  }
};

// Generate additional content for an existing lesson
export const generateAdditionalContent = async (req, res, next) => {
  try {
    const { contentId, lessonId, contentType } = req.body;
    
    if (!contentId || !lessonId) {
      return next(errorHandler(400, 'Content ID and Lesson ID are required'));
    }
    
    // Find the content in the database
    const content = await Content.findById(contentId);
    if (!content) {
      return next(errorHandler(404, 'Content not found'));
    }
    
    // Find the lesson in the content
    let foundLesson = null;
    let foundModule = null;
    
    for (const module of content.modules) {
      const lesson = module.lessons.find(l => l._id.toString() === lessonId);
      if (lesson) {
        foundLesson = lesson;
        foundModule = module;
        break;
      }
    }
    
    if (!foundLesson) {
      return next(errorHandler(404, 'Lesson not found'));
    }
    
    // Generate additional content based on the content type
    let additionalContent;
    
    switch (contentType) {
      case 'examples':
        // Generate practical examples for the lesson
        additionalContent = await generateLessonWithFunctions({
          lessonTitle: `Examples for ${foundLesson.title}`,
          moduleTitle: foundModule.title,
          courseTopic: content.topic,
          difficulty: content.difficulty,
          goal: content.goal
        });
        break;
        
      case 'exercises':
        // Generate practice exercises for the lesson
        additionalContent = await generateLessonWithFunctions({
          lessonTitle: `Exercises for ${foundLesson.title}`,
          moduleTitle: foundModule.title,
          courseTopic: content.topic,
          difficulty: content.difficulty,
          goal: content.goal
        });
        break;
        
      case 'summary':
        // Generate a summary of the lesson
        additionalContent = await generateLessonWithFunctions({
          lessonTitle: `Summary of ${foundLesson.title}`,
          moduleTitle: foundModule.title,
          courseTopic: content.topic,
          difficulty: content.difficulty,
          goal: content.goal
        });
        break;
        
      default:
        return next(errorHandler(400, 'Invalid content type'));
    }
    
    return res.status(200).json(additionalContent);
  } catch (error) {
    console.error('Error generating additional content:', error.message);
    return next(errorHandler(500, `Failed to generate additional content: ${error.message}`));
  }
};