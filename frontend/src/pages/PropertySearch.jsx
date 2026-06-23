import { useState, useEffect } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';

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
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Sticky Horizontal Filter Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm py-4 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">City</label>
              <input name="city" type="text" value={filters.city} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" placeholder="e.g. Bangalore" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">College</label>
              <input name="nearestCollege" type="text" value={filters.nearestCollege} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" placeholder="e.g. DU" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Max Rent (₹)</label>
              <input name="maxRent" type="number" value={filters.maxRent} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" placeholder="e.g. 15000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 text-sm">
                <option value="">Any</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Apartment">Apartment</option>
                <option value="Shared Room">Shared Room</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sharing</label>
              <select name="sharingType" value={filters.sharingType} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 text-sm">
                <option value="">Any</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="dormitory">Dormitory</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button type="button" onClick={clearFilters} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Clear
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results Grid - Full Width */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Properties</h2>
          <span className="text-gray-500 text-sm">{properties.length} results found</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <p className="text-gray-900 text-lg font-medium">No properties found</p>
            <p className="text-gray-500 mt-1">Try adjusting your filters or searching in a different city.</p>
            <button onClick={clearFilters} className="mt-4 text-primary-600 font-medium hover:text-primary-800">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;
