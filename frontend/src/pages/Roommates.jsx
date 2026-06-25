import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

const Roommates = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMatches = async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/roommates/matches?page=${page}&limit=12`);
      
      if (append) {
        setMatches(prev => [...prev, ...res.data.data]);
      } else {
        setMatches(res.data.data);
      }
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch roommate matches', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMatches(1);
  }, []);

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchMatches(pagination.page + 1, true);
    }
  };

  // Helper to determine the color of the circular score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success border-success bg-success/10 shadow-[0_0_10px_rgba(107,158,107,0.5)]';
    if (score >= 60) return 'text-warning border-warning bg-warning/10 shadow-[0_0_10px_rgba(196,145,92,0.5)]';
    return 'text-text-secondary border-text-secondary bg-bg-surface';
  };

  const SkeletonCard = () => (
    <div className="glass-card flex flex-col h-[400px] overflow-hidden skeleton-shimmer">
      <div className="h-24 bg-bg-elevated/50"></div>
      <div className="flex justify-center -mt-12">
        <div className="w-24 h-24 rounded-full border-4 border-bg-elevated bg-bg-surface/50"></div>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center">
        <div className="h-6 w-3/4 bg-bg-elevated/50 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-bg-elevated/50 rounded mb-6"></div>
        <div className="w-full flex gap-2 justify-center flex-wrap">
          <div className="h-6 w-1/3 bg-bg-elevated/50 rounded-full"></div>
          <div className="h-6 w-1/4 bg-bg-elevated/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] py-10 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-heading font-bold text-text-primary mb-4">Roommate Matches</h1>
            <p className="max-w-2xl mx-auto text-lg text-text-secondary">
              AI-powered compatibility scoring based on your unique lifestyle preferences.
            </p>
            {user?.preferredCity && (
              <p className="mt-4 text-accent-warm font-medium">
                Showing matches in <span className="font-bold border-b border-accent-warm">{user.preferredCity}</span>
                {pagination.total > 0 && ` (${pagination.total} found)`}
              </p>
            )}
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : matches.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {matches.map((match, idx) => (
                <AnimatedSection key={idx} delay={(idx % 12) * 50} className="h-full">
                  <div className="glass-card flex flex-col h-full overflow-hidden hover:border-accent-warm hover:shadow-[0_0_20px_rgba(212,165,116,0.15)] transition-all duration-300">
                    
                    {/* Top Banner & Profile Pic */}
                    <div className="h-24 bg-gradient-to-r from-accent-violet/20 via-accent-teal/20 to-accent-rose/20"></div>
                    <div className="flex justify-center -mt-12">
                      <div className="relative">
                        {match.candidate?.profileImage ? (
                          <img src={match.candidate.profileImage} alt={match.candidate.name} className="w-24 h-24 object-cover rounded-full border-4 border-bg-elevated shadow-lg" />
                        ) : (
                          <div className="w-24 h-24 rounded-full border-4 border-bg-elevated shadow-lg bg-bg-surface flex items-center justify-center text-accent-warm font-bold text-3xl">
                            {match.candidate?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        {/* Compatibility Score Bubble */}
                        <div className={`absolute bottom-0 right-0 w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm backdrop-blur-sm ${getScoreColor(match.compatibilityScore)}`}>
                          {match.compatibilityScore}%
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col items-center text-center">
                      <h3 className="font-bold font-heading text-text-primary text-xl">{match.candidate?.name || 'Anonymous User'}</h3>
                      <p className="text-sm text-text-secondary font-medium">{match.candidate?.college || 'No college listed'}</p>
                      
                      <div className="mt-6 w-full text-left">
                        <h4 className="text-xs font-bold text-accent-warm uppercase tracking-wider mb-3 text-center">Matching Traits</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {match.reasons?.map((reason, i) => {
                            return (
                              <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-bg-surface border border-glass-border text-text-primary cursor-default hover:border-accent-warm transition-colors">
                                {reason}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-4 mt-auto border-t border-glass-border flex gap-3">
                      <button 
                        onClick={() => alert(`Public profile viewing for ${match.candidate?.name} is coming soon!`)}
                        className="flex-1 bg-bg-surface border border-glass-border text-text-primary py-2 rounded-lg text-sm font-bold hover:border-text-secondary hover:bg-bg-elevated transition-colors hover-lift"
                      >
                        View Profile
                      </button>
                      <button 
                        onClick={() => window.location.href = `mailto:${match.candidate?.email}?subject=RentMate: Interested in being roommates!`}
                        className="flex-1 bg-accent-sky text-bg-base py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-colors shadow-[0_0_10px_rgba(56,189,248,0.3)] hover-lift"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {pagination.page < pagination.pages && (
              <div className="text-center">
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-bg-surface border border-glass-border text-text-primary px-8 py-3 rounded-lg font-bold hover:bg-bg-elevated hover:border-accent-warm transition-all hover-lift disabled:opacity-50 disabled:hover-lift-none"
                >
                  {loadingMore ? 'Loading...' : 'Load More Matches'}
                </button>
              </div>
            )}
          </>
        ) : (
          <AnimatedSection direction="up">
            <div className="max-w-2xl mx-auto text-center py-16 glass-card">
              <div className="w-20 h-20 bg-bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-glass-border animate-float">
                <svg className="h-10 w-10 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold font-heading text-text-primary mb-2">No potential roommates found</h3>
              <p className="text-text-secondary mb-8 px-6 text-lg">
                {user?.preferredCity 
                  ? `We couldn't find anyone looking for a roommate in ${user.preferredCity} yet.` 
                  : `Make sure your profile is updated and set to "Looking for a roommate".`}
              </p>
              <button 
                onClick={() => window.location.href = '/profile'}
                className="bg-accent-warm text-bg-base px-8 py-3 rounded-lg font-bold hover:bg-accent-warm-muted transition-colors hover-lift shadow-[0_0_15px_rgba(212,165,116,0.3)]"
              >
                Update Preferences
              </button>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default Roommates;
