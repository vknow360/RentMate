const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');

/**
 * GET /api/owner/analytics
 * Returns comprehensive analytics for the logged-in owner's properties.
 */
exports.getOwnerAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Fetch all properties owned by this user
    const properties = await Property.find({ ownerId }).lean();

    if (properties.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalListings: 0,
          totalInquiries: 0,
          openInquiries: 0,
          avgRating: 0,
          vacancySummary: { available: 0, full: 0 },
          inquiryFunnel: { pending: 0, responded: 0, closed: 0 },
          listingPerformance: [],
          recentReviews: []
        }
      });
    }

    const propertyIds = properties.map(p => p._id);

    // Parallel aggregate: inquiries + reviews for all properties
    const [inquiries, reviews] = await Promise.all([
      Inquiry.find({ propertyId: { $in: propertyIds } }).sort({ createdAt: -1 }).lean(),
      Review.find({ propertyId: { $in: propertyIds } })
        .populate('studentId', 'name profileImage')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // --- KPI Metrics ---
    const totalInquiries = inquiries.length;
    const openInquiries = inquiries.filter(i => i.status === 'pending').length;

    // Average rating across all properties
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Vacancy breakdown
    const vacancySummary = properties.reduce((acc, p) => {
      acc[p.vacancyStatus] = (acc[p.vacancyStatus] || 0) + 1;
      return acc;
    }, { available: 0, full: 0 });

    // Inquiry funnel
    const inquiryFunnel = inquiries.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, { pending: 0, responded: 0, closed: 0 });

    // --- Per-listing performance ---
    const propertyMap = {};
    properties.forEach(p => { propertyMap[p._id.toString()] = p; });

    // Group inquiries by property
    const inquiriesByProperty = {};
    inquiries.forEach(inq => {
      const pid = inq.propertyId.toString();
      if (!inquiriesByProperty[pid]) inquiriesByProperty[pid] = [];
      inquiriesByProperty[pid].push(inq);
    });

    // Group reviews by property
    const reviewsByProperty = {};
    reviews.forEach(rev => {
      const pid = rev.propertyId.toString();
      if (!reviewsByProperty[pid]) reviewsByProperty[pid] = [];
      reviewsByProperty[pid].push(rev);
    });

    const listingPerformance = properties.map(p => {
      const pid = p._id.toString();
      const propInquiries = inquiriesByProperty[pid] || [];
      const propReviews = reviewsByProperty[pid] || [];

      const propAvgRating = propReviews.length > 0
        ? (propReviews.reduce((s, r) => s + r.rating, 0) / propReviews.length).toFixed(1)
        : null;

      const latestInquiry = propInquiries[0]
        ? propInquiries[0].createdAt
        : null;

      return {
        _id: p._id,
        title: p.title,
        city: p.city,
        rent: p.rent,
        vacancyStatus: p.vacancyStatus,
        isVerified: p.isVerified,
        inquiryCount: propInquiries.length,
        reviewCount: propReviews.length,
        avgRating: propAvgRating,
        latestInquiry
      };
    }).sort((a, b) => b.inquiryCount - a.inquiryCount);

    // Recent 5 reviews with property title
    const recentReviews = reviews.slice(0, 5).map(r => ({
      _id: r._id,
      comment: r.comment,
      rating: r.rating,
      createdAt: r.createdAt,
      propertyTitle: propertyMap[r.propertyId.toString()]?.title || 'Unknown Property',
      studentName: r.studentId?.name || 'Anonymous',
      studentImage: r.studentId?.profileImage || null
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalListings: properties.length,
        totalInquiries,
        openInquiries,
        avgRating: parseFloat(avgRating),
        vacancySummary,
        inquiryFunnel,
        listingPerformance,
        recentReviews
      }
    });
  } catch (error) {
    console.error('[OwnerAnalytics] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};
