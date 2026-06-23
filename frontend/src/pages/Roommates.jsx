import { useState, useEffect } from 'react';
import api from '../api/axios';

const Roommates = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/roommates/matches');
        setMatches(res.data.data);
      } catch (error) {
        console.error('Failed to fetch roommate matches', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Helper to determine the color of the circular score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 border-green-500';
    if (score >= 60) return 'text-yellow-500 border-yellow-500';
    return 'text-gray-400 border-gray-400';
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Roommate Matches</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            AI-powered compatibility scoring based on your unique lifestyle preferences.
          </p>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matches.map((match, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full relative">
                
                {/* Top Banner & Profile Pic */}
                <div className="h-24 bg-gradient-to-r from-primary-500 to-indigo-600"></div>
                <div className="flex justify-center -mt-12">
                  <div className="relative">
                    {match.candidate?.profileImage ? (
                      <img src={match.candidate.profileImage} alt={match.candidate.name} className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md bg-white" />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl">
                        {match.candidate?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Compatibility Score Bubble */}
                    <div className={`absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-sm ${getScoreColor(match.compatibilityScore)}`}>
                      {match.compatibilityScore}%
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col items-center text-center">
                  <h3 className="font-bold text-gray-900 text-xl">{match.candidate?.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{match.candidate?.college || 'No college listed'}</p>
                  
                  <div className="mt-6 w-full text-left">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Matching Traits</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {match.reasons?.map((reason, i) => {
                        // Extracting key phrases for badges
                        let badgeColor = "bg-gray-100 text-gray-700";
                        if (reason.toLowerCase().includes('sleep')) badgeColor = "bg-indigo-50 text-indigo-700";
                        else if (reason.toLowerCase().includes('budget')) badgeColor = "bg-green-50 text-green-700";
                        else if (reason.toLowerCase().includes('study')) badgeColor = "bg-blue-50 text-blue-700";
                        else if (reason.toLowerCase().includes('food')) badgeColor = "bg-orange-50 text-orange-700";
                        else if (reason.toLowerCase().includes('cleanliness')) badgeColor = "bg-teal-50 text-teal-700";

                        return (
                          <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                            {reason}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 mt-auto border-t border-gray-50 flex gap-3">
                  <button 
                    onClick={() => alert(`Public profile viewing for ${match.candidate?.name} is coming soon!`)}
                    className="flex-1 border-2 border-primary-600 text-primary-600 py-2 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => window.location.href = `mailto:${match.candidate?.email}?subject=RentMate: Interested in being roommates!`}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No potential roommates found</h3>
            <p className="text-gray-500 mb-6 px-6">We couldn't find anyone matching your preferences right now. Make sure your profile is updated and set to "Looking for a roommate".</p>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Update Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roommates;
