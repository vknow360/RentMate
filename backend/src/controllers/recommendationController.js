const Property = require('../models/Property');
const { getPropertyRecommendations } = require('../services/gemini');

/**
 * GET /api/recommendations
 * Returns top 4 AI-recommended properties for the logged-in student.
 * Protected: student only
 */
exports.getRecommendations = async (req, res) => {
  try {
    const student = req.user;

    // Fetch all available properties
    const properties = await Property.find({ vacancyStatus: 'available' }).lean();

    if (properties.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get AI-ranked recommendations
    const recommendations = await getPropertyRecommendations(student, properties);

    // Hydrate each recommendation with the full property data
    const propertyMap = {};
    properties.forEach(p => { propertyMap[p._id.toString()] = p; });

    const result = recommendations
      .filter(r => propertyMap[r.propertyId]) // guard against hallucinated IDs
      .map(r => ({
        ...propertyMap[r.propertyId],
        aiReason: r.aiReason
      }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('[Recommendations] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};
