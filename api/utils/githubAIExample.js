import { generateCourseWithFunctions, generateLessonWithFunctions, generateQuizWithFunctions } from './githubAITools.js';

/**
 * Example usage of GitHub AI function calling capabilities for the Course Generator application
 * This file demonstrates how to use the GitHub AI integration with function calling
 */

// Example function to demonstrate course generation
export const generateExampleCourse = async () => {
  try {
    console.log('Generating example course with GitHub AI function calling...');
    
    // Example course parameters
    const courseParams = {
      topic: 'Machine Learning Fundamentals',
      difficulty: 'Intermediate',
      goal: 'Academic',
      duration: '6'
    };
    
    // Generate course structure
    const courseData = await generateCourseWithFunctions(courseParams);
    console.log('Course structure generated successfully!');
    console.log(`Course title: ${courseData.title}`);
    console.log(`Number of modules: ${courseData.modules.length}`);
    
    // Generate content for the first lesson of the first module
    if (courseData.modules.length > 0 && courseData.modules[0].lessons.length > 0) {
      const firstModule = courseData.modules[0];
      const firstLesson = firstModule.lessons[0];
      
      console.log(`Generating content for lesson: ${firstLesson.title}`);
      
      const lessonParams = {
        lessonTitle: firstLesson.title,
        moduleTitle: firstModule.title,
        courseTopic: courseParams.topic,
        difficulty: courseParams.difficulty,
        goal: courseParams.goal
      };
      
      const lessonData = await generateLessonWithFunctions(lessonParams);
      console.log('Lesson content generated successfully!');
      console.log(`Lesson content length: ${lessonData.content.length} characters`);
      
      // Generate quiz questions for the lesson
      console.log(`Generating quiz questions for lesson: ${firstLesson.title}`);
      
      const quizParams = {
        lessonTitle: firstLesson.title,
        lessonContent: lessonData.content,
        difficulty: courseParams.difficulty,
        numberOfQuestions: 3
      };
      
      const quizData = await generateQuizWithFunctions(quizParams);
      console.log('Quiz questions generated successfully!');
      console.log(`Number of quiz questions: ${quizData.questions.length}`);
      
      // Return the complete example
      return {
        course: courseData,
        lessonContent: lessonData,
        quizQuestions: quizData
      };
    }
    
    return { course: courseData };
  } catch (error) {
    console.error('Error in example course generation:', error.message);
    throw error;
  }
};

// Example of how to use the GitHub AI function calling in a real application
export const runExample = async () => {
  try {
    console.log('=== STARTING GITHUB AI FUNCTION CALLING EXAMPLE ===');
    const result = await generateExampleCourse();
    console.log('=== EXAMPLE COMPLETED SUCCESSFULLY ===');
    return result;
  } catch (error) {
    console.error('Example failed:', error.message);
    return { error: error.message };
  }
};

// If this file is run directly, execute the example
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Running GitHub AI function calling example...');
  runExample()
    .then(result => {
      console.log('Example result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Example error:', error.message);
      process.exit(1);
    });
}