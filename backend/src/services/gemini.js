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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

/**
 * Fallback scorer for property recommendations when Gemini API fails.
 * Scores properties based on city match, budget proximity, and amenities.
 */
const fallbackPropertyRecommendations = (studentProfile, properties) => {
  const prefs = studentProfile.preferences || {};
  const studentBudget = prefs.budget || 15000;
  const studentCity = studentProfile.preferredCity || '';
  const studentCollege = studentProfile.college || '';

  const scored = properties.map(p => {
    let score = 0;
    const reasons = [];

    if (p.city === studentCity) { score += 40; reasons.push(`Located in your city, ${studentCity}`); }
    if (p.nearestCollege && studentCollege && p.nearestCollege.toLowerCase().includes(studentCollege.toLowerCase().split(' ')[0])) {
      score += 30; reasons.push(`Near ${p.nearestCollege}`);
    }
    const budgetDiff = Math.abs(p.rent - studentBudget);
    if (budgetDiff <= 2000) { score += 20; reasons.push('Fits your budget'); }
    else if (budgetDiff <= 5000) { score += 10; reasons.push('Reasonably priced'); }
    if (p.amenities && p.amenities.includes('WiFi')) { score += 5; reasons.push('Has WiFi'); }
    if (p.isVerified) { score += 5; reasons.push('Verified property'); }

    return {
      propertyId: p._id.toString(),
      score,
      aiReason: reasons.length > 0 ? reasons.slice(0, 2).join(' · ') : 'Good match for your profile'
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ propertyId, aiReason }) => ({ propertyId, aiReason }));
};

/**
 * Uses Gemini AI to rank properties for a student based on their profile.
 * Includes a 6-second timeout — always falls back to deterministic scorer if Gemini is slow.
 * @param {Object} studentProfile - The student user object (with preferences, college, preferredCity)
 * @param {Array} properties - Array of available property documents
 * @returns {Array} Top 4 properties with { propertyId, aiReason }
 */
exports.getPropertyRecommendations = async (studentProfile, properties) => {
  if (!properties || properties.length === 0) return [];

  const studentCity = studentProfile.preferredCity || '';
  const studentBudget = studentProfile.preferences?.budget || 15000;

  // Pre-sort: city-matched properties first, then by budget proximity
  // Slice to top 15 to keep the Gemini prompt short and fast
  const sortedProps = [...properties].sort((a, b) => {
    const aCity = (a.city === studentCity) ? 0 : 1;
    const bCity = (b.city === studentCity) ? 0 : 1;
    if (aCity !== bCity) return aCity - bCity;
    return Math.abs(a.rent - studentBudget) - Math.abs(b.rent - studentBudget);
  });
  const topProps = sortedProps.slice(0, 15);

  // Build a compact prompt
  const condensedProps = topProps.map(p => ({
    id: p._id.toString(),
    title: p.title,
    city: p.city,
    rent: p.rent,
    type: p.propertyType,
    college: p.nearestCollege,
    amenities: (p.amenities || []).slice(0, 4).join(', ')
  }));

  const studentSummary = {
    city: studentCity,
    college: studentProfile.college,
    budget: studentBudget,
    food: studentProfile.preferences?.foodPreference,
    sleep: studentProfile.preferences?.sleepSchedule
  };

  const prompt = `You are a property recommendation engine for RentMate, an Indian student housing app.
Student: ${JSON.stringify(studentSummary)}
Properties: ${JSON.stringify(condensedProps)}
Pick TOP 4 best properties for this student (city match + budget fit + college proximity). Return ONLY JSON array, no markdown:
[{"propertyId":"<id>","aiReason":"<under 10 words why it fits>"},{"propertyId":"<id>","aiReason":"<reason>"},{"propertyId":"<id>","aiReason":"<reason>"},{"propertyId":"<id>","aiReason":"<reason>"}]`;

  // Wrap Gemini call in a 6-second timeout — always fall back if slow
  const geminiCall = async () => {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (text.startsWith('```')) text = text.replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    return parsed.slice(0, 4);
  };

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini timeout')), 6000)
  );

  try {
    const result = await Promise.race([geminiCall(), timeoutPromise]);
    // Validate that returned IDs actually exist
    const idSet = new Set(topProps.map(p => p._id.toString()));
    const valid = result.filter(r => r.propertyId && idSet.has(r.propertyId));
    if (valid.length === 0) throw new Error('No valid IDs returned');
    return valid;
  } catch (error) {
    console.error('Gemini recommendations failed/timed out. Using fallback:', error.message);
    return fallbackPropertyRecommendations(studentProfile, properties);
  }
};
