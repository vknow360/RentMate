import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Shimmer/Skeleton card for loading state
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-72 rounded-2xl overflow-hidden border border-glass-border bg-bg-surface animate-pulse">
    <div className="h-40 bg-bg-base/60" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-bg-base/60 rounded w-3/4" />
      <div className="h-3 bg-bg-base/60 rounded w-1/2" />
      <div className="h-8 bg-bg-base/60 rounded-full w-full mt-2" />
      <div className="h-9 bg-bg-base/60 rounded-lg w-full" />
    </div>
  </div>
);

const AIPropertyCard = ({ property, index }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-72 rounded-2xl overflow-hidden border border-glass-border bg-bg-surface/80 backdrop-blur-sm hover:border-accent-violet/60 transition-all duration-300 group"
      style={{ animation: `slideIn 0.5s ease ${index * 100}ms forwards`, opacity: 0 }}
    >
      {/* Property Image */}
      <div className="h-40 relative overflow-hidden bg-bg-base">
        {property.images && property.images.length > 0 && !imgError ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-4xl">🏠</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent" />
        {/* Rent badge */}
        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold text-bg-base bg-accent-violet shadow-[0_0_10px_rgba(139,92,246,0.5)]">
          ₹{property.rent?.toLocaleString('en-IN')}/mo
        </div>
        {property.isVerified && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold text-bg-base bg-success flex items-center gap-1">
            ✓ Verified
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-text-primary truncate mb-0.5 group-hover:text-accent-warm transition-colors">
          {property.title}
        </h3>
        <p className="text-xs text-text-tertiary truncate mb-3">
          {property.locality}, {property.city}
        </p>

        {/* AI Reason Chip */}
        <div className="flex items-start gap-1.5 mb-3 p-2.5 rounded-xl bg-accent-violet/10 border border-accent-violet/20">
          <span className="text-sm flex-shrink-0 mt-0.5">✨</span>
          <p className="text-xs text-accent-violet leading-relaxed font-medium">
            {property.aiReason}
          </p>
        </div>

        <Link
          to={`/properties/${property._id}`}
          className="block w-full text-center text-xs font-semibold text-accent-warm border border-accent-warm/30 hover:border-accent-warm hover:bg-accent-warm/10 py-2 rounded-lg transition-all duration-300"
        >
          View Property →
        </Link>
      </div>
    </div>
  );
};

/**
 * AI Recommendations component — shows top 4 AI-recommended properties for logged-in students.
 * Usage: <AIRecommendations /> — will self-hide for non-student users.
 */
const AIRecommendations = ({ className = '' }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/recommendations', { signal });
      setRecommendations(res.data.data || []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return; // ignore abort
      console.error('Failed to fetch recommendations:', err);
      setError('Could not load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    // AbortController for cleanup + 12-second client-side timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setLoading(false);
      setError('AI recommendations timed out. Please refresh to try again.');
    }, 12000);

    fetchRecommendations(controller.signal).finally(() => clearTimeout(timeoutId));

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [user, fetchRecommendations]);

  // Don't render for non-students or guests
  if (!user || user.role !== 'student') return null;

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">✨</span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-accent-violet to-accent-sky bg-clip-text text-transparent">
              AI Recommended For You
            </h2>
          </div>
          <p className="text-text-secondary text-sm">
            Personalized picks based on your profile, budget & college
          </p>
        </div>
        {!loading && recommendations.length > 0 && (
          <button
            onClick={fetchRecommendations}
            className="hidden sm:flex items-center gap-2 text-xs text-text-tertiary hover:text-accent-violet transition-colors border border-glass-border hover:border-accent-violet/40 px-3 py-2 rounded-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        )}
      </div>

      {/* AI Gemini powered badge */}
      <div className="inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent-violet/10 to-accent-sky/10 border border-accent-violet/20 text-xs text-accent-violet font-medium">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Powered by Gemini AI
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={fetchRecommendations} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Scrollable card strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : recommendations.length > 0
          ? recommendations.map((property, i) => (
              <div key={property._id} className="snap-start">
                <AIPropertyCard property={property} index={i} />
              </div>
            ))
          : !error && (
              <div className="flex flex-col items-center justify-center w-full py-10 text-text-tertiary gap-3">
                <span className="text-4xl">🏠</span>
                <p className="text-sm">Complete your profile to get personalized recommendations!</p>
                <Link to="/profile" className="text-xs text-accent-warm underline">Update Profile →</Link>
              </div>
            )
        }
      </div>

      {/* Animation keyframes injected via style tag */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default AIRecommendations;
