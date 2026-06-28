import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import GlassCard from '../components/GlassCard';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalListings: 0,
    totalInquiries: 0,
    openInquiries: 0,
    avgRating: 0,
    vacancySummary: { available: 0, full: 0 },
    inquiryFunnel: { pending: 0, responded: 0, closed: 0 },
    listingPerformance: [],
    recentReviews: []
  });

  useEffect(() => {
    if (user && user.role !== 'owner') {
      navigate('/');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/owner/analytics');
        setAnalytics(res.data.data);
      } catch (error) {
        console.error('Failed to fetch owner analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-glass-border"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-accent-warm animate-spin"></div>
        </div>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const vacancyPercent = analytics.totalListings > 0
    ? Math.round((analytics.vacancySummary.available / analytics.totalListings) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {/* Title Header */}
      <AnimatedSection>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-white mb-2">
              Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-warm via-accent-violet to-accent-sky">Dashboard</span>
            </h1>
            <p className="text-text-secondary">
              Track listing performance, inquiries conversion, and student feedback.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/manage-listings" className="bg-bg-surface hover:bg-bg-elevated border border-glass-border px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover-lift">
              Manage Listings
            </Link>
            <Link to="/properties/new" className="bg-accent-warm text-bg-base hover:bg-accent-warm-muted px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover-lift shadow-[0_0_15px_rgba(212,165,116,0.3)]">
              + New Property
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: 'Total Properties', val: analytics.totalListings, icon: '🏢', color: 'from-accent-sky/20 to-accent-sky/5' },
          { title: 'Total Inquiries', val: analytics.totalInquiries, icon: '💬', color: 'from-accent-violet/20 to-accent-violet/5' },
          { title: 'Pending Inquiries', val: analytics.openInquiries, icon: '⏳', color: 'from-accent-rose/20 to-accent-rose/5' },
          { title: 'Average Rating', val: analytics.avgRating > 0 ? `${analytics.avgRating} ★` : 'N/A', icon: '⭐', color: 'from-accent-warm/20 to-accent-warm/5' }
        ].map((kpi, idx) => (
          <AnimatedSection key={idx} delay={idx * 100}>
            <GlassCard className="relative overflow-hidden p-6 hover:border-accent-warm/40 transition-colors">
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-40 z-0`} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">{kpi.title}</p>
                  <p className="text-3xl font-heading font-black text-white">{kpi.val}</p>
                </div>
                <div className="w-12 h-12 bg-bg-surface/60 rounded-xl flex items-center justify-center text-2xl border border-glass-border">
                  {kpi.icon}
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left/Middle Column: Vacancy & Inquiry funnel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Vacancy Card */}
          <AnimatedSection>
            <GlassCard className="p-6">
              <h3 className="text-lg font-heading font-bold text-white mb-6">Vacancy Summary</h3>
              <div className="flex justify-between text-sm mb-2 text-text-secondary">
                <span>Available Listings ({analytics.vacancySummary.available})</span>
                <span className="font-bold text-accent-warm">{vacancyPercent}% Occupancy Opportunity</span>
              </div>
              {/* Progress bar container */}
              <div className="w-full bg-bg-surface/50 border border-glass-border h-4 rounded-full overflow-hidden mb-6 flex">
                <div 
                  className="bg-gradient-to-r from-accent-teal to-accent-sky h-full rounded-full transition-all duration-1000"
                  style={{ width: `${vacancyPercent}%` }}
                />
                <div 
                  className="bg-accent-rose/60 h-full transition-all duration-1000"
                  style={{ width: `${100 - vacancyPercent}%` }}
                />
              </div>
              <div className="flex gap-6 justify-center sm:justify-start">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-accent-teal"></span>
                  <span className="text-xs text-text-secondary">Available ({analytics.vacancySummary.available})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-accent-rose/60"></span>
                  <span className="text-xs text-text-secondary">Occupied/Full ({analytics.vacancySummary.full})</span>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Inquiry Funnel */}
          <AnimatedSection delay={100}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-heading font-bold text-white mb-6">Inquiry Lifecycle Funnel</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Pending', count: analytics.inquiryFunnel.pending, desc: 'Awaiting Response', color: 'border-accent-rose bg-accent-rose/10 text-accent-rose' },
                  { label: 'Responded', count: analytics.inquiryFunnel.responded, desc: 'Active Chat', color: 'border-accent-sky bg-accent-sky/10 text-accent-sky' },
                  { label: 'Closed', count: analytics.inquiryFunnel.closed, desc: 'Resolved inquiries', color: 'border-accent-teal bg-accent-teal/10 text-accent-teal' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 border rounded-xl ${item.color} flex flex-col items-center justify-center text-center shadow-inner`}>
                    <p className="text-4xl font-heading font-black mb-1">{item.count}</p>
                    <p className="text-sm font-bold uppercase tracking-wide">{item.label}</p>
                    <p className="text-[10px] opacity-75 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>

        {/* Right Column: Recent Reviews */}
        <div className="space-y-8">
          <AnimatedSection delay={200}>
            <GlassCard className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-heading font-bold text-white mb-6">Recent Student Reviews</h3>
              <div className="flex-grow space-y-4">
                {analytics.recentReviews.length > 0 ? (
                  analytics.recentReviews.map((rev) => (
                    <div key={rev._id} className="border-b border-glass-border/40 pb-4 last:border-none last:pb-0">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-accent-violet/20 flex items-center justify-center text-accent-violet text-sm font-bold overflow-hidden">
                            {rev.studentImage ? (
                              <img src={rev.studentImage} alt={rev.studentName} className="w-full h-full object-cover" />
                            ) : (
                              rev.studentName.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-primary">{rev.studentName}</p>
                            <p className="text-[10px] text-text-tertiary">{formatDate(rev.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex text-accent-warm text-xs font-bold">
                          {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
                          {Array.from({ length: 5 - rev.rating }).map((_, i) => <span key={i} className="opacity-30">★</span>)}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary italic line-clamp-2">
                        "{rev.comment}"
                      </p>
                      <p className="text-[10px] text-accent-violet mt-1 font-medium uppercase tracking-wider">
                        At: {rev.propertyTitle}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-text-tertiary gap-3 flex-grow">
                    <span className="text-4xl">⭐</span>
                    <p className="text-sm">No reviews received yet.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>

      {/* Property Performance Table */}
      <AnimatedSection delay={300}>
        <GlassCard className="p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-bold text-white">Listing Performance Analysis</h3>
            <span className="text-xs text-text-tertiary">Sorted by inquiry counts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-glass-border text-text-tertiary text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Property Details</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Inquiries</th>
                  <th className="py-3 px-4 font-bold text-center">Reviews</th>
                  <th className="py-3 px-4 font-bold text-center">Average Rating</th>
                  <th className="py-3 px-4 font-bold text-right">Latest Inquiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40">
                {analytics.listingPerformance.length > 0 ? (
                  analytics.listingPerformance.map((prop) => (
                    <tr key={prop._id} className="hover:bg-bg-surface/20 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-text-primary">{prop.title}</p>
                        <p className="text-xs text-text-tertiary">{prop.city} • ₹{prop.rent}/mo</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          prop.vacancyStatus === 'available' 
                            ? 'bg-accent-teal/20 text-accent-teal' 
                            : 'bg-accent-rose/20 text-accent-rose'
                        }`}>
                          {prop.vacancyStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-text-primary">
                        {prop.inquiryCount}
                      </td>
                      <td className="py-4 px-4 text-center text-text-secondary">
                        {prop.reviewCount}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {prop.avgRating ? (
                          <span className="text-accent-warm font-bold">{prop.avgRating} ★</span>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-text-secondary">
                        {formatDate(prop.latestInquiry)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-text-tertiary">
                      No listings found to analyze.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  );
};

export default OwnerDashboard;
