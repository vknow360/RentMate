const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.computeCompatibility = (prefA, prefB) => {
  let score = 100;

  if (prefA.sleepSchedule !== prefB.sleepSchedule) score -= 25;
  if (prefA.foodPreference !== prefB.foodPreference) score -= 20;
  if (prefA.smoking !== prefB.smoking) score -= 20;

  score -= Math.abs((prefA.cleanliness || 3) - (prefB.cleanliness || 3)) * 5;
  score -= Math.abs((prefA.noiseTolerance || 3) - (prefB.noiseTolerance || 3)) * 5;

  if (prefA.studyHabits !== prefB.studyHabits) score -= 10;
  
  // Budget proximity
  if (prefA.budget && prefB.budget) {
    const diff = Math.abs(prefA.budget - prefB.budget);
    if (diff > 5000) score -= 20;
    else if (diff > 2000) score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  const reasons = [];
  if (prefA.sleepSchedule === prefB.sleepSchedule) reasons.push('Matching sleep schedules');
  if (prefA.foodPreference === prefB.foodPreference) reasons.push('Similar food preferences');
  if (Math.abs((prefA.cleanliness || 3) - (prefB.cleanliness || 3)) <= 1) reasons.push('Compatible cleanliness standards');
  if (prefA.budget && prefB.budget && Math.abs(prefA.budget - prefB.budget) <= 2000) reasons.push('Similar budgets');
  
  if (reasons.length === 0) reasons.push('Some lifestyle differences');

  return { compatibilityScore: score, reasons };
};

exports.evaluateCompatibility = async (studentA, studentB) => {
  const prompt = `You are a roommate-compatibility evaluator for a student housing app.
Compare these two student profiles and return ONLY valid JSON, no markdown, no preamble.

Student A: ${JSON.stringify(studentA.preferences || {})}
Student B: ${JSON.stringify(studentB.preferences || {})}

Return exactly this JSON shape:
{
  "compatibilityScore": <integer 0-100>,
  "reasons": ["short reason 1", "short reason 2", "short reason 3"]
}

Scoring guidance: heavily reward matching sleep schedules and food preferences (deal-relevant for shared kitchens), moderately reward similar cleanliness and noise tolerance, lightly reward similar study habits/social type. Penalize smoking mismatch. Reasons must be short (under 8 words each), specific, and human-readable — they will be shown directly to students.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip markdown code blocks if Gemini returns them despite instructions
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API failed or returned invalid JSON. Using fallback.', error.message);
    return fallbackScorer(studentA.preferences || {}, studentB.preferences || {});
  }
};
