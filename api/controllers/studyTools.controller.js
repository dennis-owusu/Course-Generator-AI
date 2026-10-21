import Content from '../models/content.model.js';
import { generateWithGitHubAI } from '../utils/githubAI.js';
import { errorHandler } from '../utils/error.js';

// Locates a lesson (and its module) inside a course document.
const findLesson = (course, lessonId) => {
  for (const module of course.modules) {
    const lesson = module.lessons.find((l) => l._id.toString() === lessonId);
    if (lesson) return { lesson, module };
  }
  return { lesson: null, module: null };
};

// Extracts the first JSON object/array from an AI response, tolerating code fences.
const extractJson = (text) => {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) return null;
  const opener = candidate[start];
  const closer = opener === '[' ? ']' : '}';
  const end = candidate.lastIndexOf(closer);
  if (end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
};

const LEVEL_DESCRIPTIONS = {
  JHS: 'a Junior High School student in Ghana (ages 12–15). Use very simple everyday language, relatable Ghanaian examples (market trading, football, mobile money), short sentences, and avoid jargon. Explain any technical term you must use.',
  SHS: 'a Senior High School student in Ghana (ages 15–18) preparing for WASSCE. Use clear academic language appropriate for the WASSCE syllabus, with structured explanations and exam-focused examples.',
};

// POST /api/study-tools/waec-questions  { courseId, lessonId }
// Returns 2–3 WAEC-style practice questions for a lesson, generating and caching on first use.
export const getWaecQuestions = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) {
      return next(errorHandler(400, 'courseId and lessonId are required'));
    }

    const course = await Content.findById(courseId);
    if (!course) return next(errorHandler(404, 'Course not found'));

    const { lesson, module } = findLesson(course, lessonId);
    if (!lesson) return next(errorHandler(404, 'Lesson not found'));

    if (lesson.waecQuestions && lesson.waecQuestions.length > 0) {
      return res.status(200).json({ success: true, cached: true, questions: lesson.waecQuestions });
    }

    const prompt = `
You are a WAEC (West African Examinations Council) examiner writing WASSCE practice questions.

Course topic: "${course.title}"
Module: "${module.title}"
Lesson: "${lesson.title}"
Lesson summary: "${lesson.summary}"

Write exactly 3 multiple-choice practice questions in the style of real WAEC WASSCE past questions on this lesson's topic. Each question must:
- Read like an authentic WAEC objective question
- Have exactly 4 options (A–D) with only one correct answer
- Include a brief explanation of why the correct answer is right
- Include a plausible past-paper year between 2015 and 2024 that the question is styled on

Respond with ONLY valid JSON in this exact shape:
{
  "questions": [
    { "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "...", "year": "2021" }
  ]
}
where correctAnswer is the 0-based index of the correct option.`;

    const aiResponse = await generateWithGitHubAI(prompt);
    const parsed = extractJson(aiResponse);

    const questions = (parsed?.questions || [])
      .filter((q) => q.question && Array.isArray(q.options) && q.options.length === 4)
      .slice(0, 3)
      .map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
        explanation: q.explanation || '',
        year: String(q.year || ''),
      }));

    if (questions.length === 0) {
      return next(errorHandler(502, 'Could not generate WAEC questions right now. Please try again.'));
    }

    lesson.waecQuestions = questions;
    await course.save();

    res.status(200).json({ success: true, cached: false, questions });
  } catch (error) {
    next(error);
  }
};

// POST /api/study-tools/explain  { courseId, lessonId, level: 'JHS' | 'SHS' }
// Rewrites the lesson content at the requested schooling level, caching the result.
export const explainAtLevel = async (req, res, next) => {
  try {
    const { courseId, lessonId, level } = req.body;
    if (!courseId || !lessonId || !['JHS', 'SHS'].includes(level)) {
      return next(errorHandler(400, 'courseId, lessonId and level (JHS or SHS) are required'));
    }

    const course = await Content.findById(courseId);
    if (!course) return next(errorHandler(404, 'Course not found'));

    const { lesson } = findLesson(course, lessonId);
    if (!lesson) return next(errorHandler(404, 'Lesson not found'));

    lesson.explanations = lesson.explanations || {};
    if (lesson.explanations[level]) {
      return res.status(200).json({ success: true, cached: true, level, explanation: lesson.explanations[level] });
    }

    const source = (lesson.aiNotes || lesson.content || '').slice(0, 6000);
    const prompt = `
Rewrite the following lesson content so it is perfectly suited for ${LEVEL_DESCRIPTIONS[level]}

Keep the Markdown formatting (headings, bullet points). Do not remove important facts — only change HOW they are explained. Keep it about the same length or shorter.

Lesson title: "${lesson.title}"

Lesson content:
${source}`;

    const explanation = await generateWithGitHubAI(prompt);
    if (!explanation) {
      return next(errorHandler(502, 'Could not generate the explanation right now. Please try again.'));
    }

    lesson.explanations[level] = explanation;
    await course.save();

    res.status(200).json({ success: true, cached: false, level, explanation });
  } catch (error) {
    next(error);
  }
};
