import { useState, useEffect } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import AnimatedSection from '../components/AnimatedSection';
import AIRecommendations from '../components/AIRecommendations';

const PropertySearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    nearestCollege: '',
    minRent: '',
    maxRent: '',
    type: '',
    sharingType: ''
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const queryParams = new URLSearchParams(activeFilters).toString();
      const res = await api.get(`/properties?${queryParams}`);
      setProperties(res.data.data.properties);
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      nearestCollege: '',
      minRent: '',
      maxRent: '',
      type: '',
      sharingType: ''
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pb-12">
      {/* Sticky Horizontal Filter Bar */}
      <div className="sticky top-20 z-30 glass-card mx-4 sm:mx-6 lg:mx-8 mb-8 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">City</label>
              <input name="city" type="text" value={filters.city} onChange={handleFilterChange} className="w-full px-3 py-2 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm outline-none text-sm text-text-primary placeholder-text-tertiary transition-all" placeholder="e.g. Bangalore" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">College</label>
              <input name="nearestCollege" type="text" value={filters.nearestCollege} onChange={handleFilterChange} className="w-full px-3 py-2 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm outline-none text-sm text-text-primary placeholder-text-tertiary transition-all" placeholder="e.g. DU" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Max Rent (₹)</label>
              <input name="maxRent" type="number" value={filters.maxRent} onChange={handleFilterChange} className="w-full px-3 py-2 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm outline-none text-sm text-text-primary placeholder-text-tertiary transition-all" placeholder="e.g. 15000" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-3 py-2 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm outline-none text-sm text-text-primary transition-all">
                <option value="">Any</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Apartment">Apartment</option>
                <option value="Shared Room">Shared Room</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Sharing</label>
              <select name="sharingType" value={filters.sharingType} onChange={handleFilterChange} className="w-full px-3 py-2 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm outline-none text-sm text-text-primary transition-all">
                <option value="">Any</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="dormitory">Dormitory</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button type="button" onClick={clearFilters} className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-surface border border-glass-border hover:text-text-primary hover:border-text-secondary rounded-lg transition-all hover-lift">
              Clear
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-bg-base bg-accent-warm hover:bg-accent-warm-muted rounded-lg shadow-[0_0_15px_rgba(212,165,116,0.3)] transition-all flex items-center hover-lift">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* AI Recommendations — pinned for logged-in students */}
      <AIRecommendations className="mb-10" />

      {/* Results Grid - Full Width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold font-heading text-text-primary">Featured Properties</h2>
            <span className="text-text-secondary text-sm font-medium bg-bg-surface px-3 py-1 rounded-full border border-glass-border">{properties.length} results found</span>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-80 glass-card skeleton-shimmer border-transparent opacity-50"></div>
              ))}
            </div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property, idx) => (
              <PropertyCard key={property._id} property={property} index={idx} />
            ))}
          </div>
        ) : (
          <AnimatedSection direction="up">
            <div className="text-center py-20 glass-card">
              <div className="w-20 h-20 bg-bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-glass-border animate-float">
                <svg className="h-10 w-10 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
              <p className="text-text-primary text-xl font-heading font-bold mb-2">No properties found</p>
              <p className="text-text-secondary mb-6">Try adjusting your filters or searching in a different city.</p>
              <button onClick={clearFilters} className="px-6 py-2 bg-bg-surface border border-glass-border text-accent-warm font-medium rounded-lg hover:border-accent-warm transition-all hover-lift">
                Clear all filters
              </button>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;
