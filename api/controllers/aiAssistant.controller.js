import { generateWithGitHubAI } from '../utils/githubAI.js';
import { errorHandler } from '../utils/error.js';

const SYSTEM_PROMPT = `You are NurseHub AI, a supportive study assistant for nursing students in Ghana.
Provide accurate, educational explanations suitable for nursing learners.
Always include a disclaimer that your guidance is for study purposes and does not replace professional clinical judgment, instructor feedback, or institutional protocols.
Be concise but thorough. When appropriate, give examples relevant to Ghanaian healthcare contexts.`;

const FALLBACK_RESPONSES = {
  'arteries and veins':
    'Arteries carry oxygen-rich blood away from the heart to the body under higher pressure; they have thicker, muscular walls. Veins return oxygen-poor blood back to the heart, contain valves to prevent backflow, and have thinner walls.\n\n*This is for study support—always verify with your instructor and clinical protocols.*',
};

export const askAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return next(errorHandler(400, 'Message is required'));
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // Try real AI if credentials are available
    const aiResponse = await generateWithGitHubAI(`${SYSTEM_PROMPT}\n\nStudent question: ${trimmed}\n\nAnswer:`);

    if (aiResponse) {
      return res.status(200).json({
        success: true,
        reply: `${aiResponse}\n\n*This AI response is for study support only and does not replace professional clinical judgment.*`,
      });
    }

    // Fallback: safe local response if AI is unavailable
    for (const key of Object.keys(FALLBACK_RESPONSES)) {
      if (lower.includes(key)) {
        return res.status(200).json({ success: true, reply: FALLBACK_RESPONSES[key], fallback: true });
      }
    }

    res.status(200).json({
      success: true,
      fallback: true,
      reply: 'I am currently unable to reach the AI service. Please try again later, or ask your instructor for guidance. Remember: AI study support does not replace professional clinical judgment.',
    });
  } catch (error) {
    next(error);
  }
};

export const getCaseStudyHint = async (req, res, next) => {
  try {
    const { scenario, question } = req.body;
    if (!scenario || !question) return next(errorHandler(400, 'Scenario and question are required'));

    const prompt = `${SYSTEM_PROMPT}\n\nCase scenario: ${scenario}\nQuestion: ${question}\n\nProvide a structured hint that guides clinical reasoning without giving the full answer. Include: (1) key assessments to consider, (2) possible priorities, (3) relevant nursing interventions to think about.`;

    const aiResponse = await generateWithGitHubAI(prompt);

    if (aiResponse) {
      return res.status(200).json({
        success: true,
        hint: `${aiResponse}\n\n*This hint supports your reasoning but does not replace instructor feedback or clinical protocols.*`,
      });
    }

    res.status(200).json({
      success: true,
      fallback: true,
      hint: 'Think about the ABCs (Airway, Breathing, Circulation) and patient safety first. Consider vital signs, relevant history, and what complications could arise. Document your reasoning and compare with your instructor\'s feedback.',
    });
  } catch (error) {
    next(error);
  }
};
