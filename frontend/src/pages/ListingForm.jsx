import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const ListingForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    deposit: '',
    city: '',
    locality: '',
    nearestCollege: '',
    propertyType: 'PG',
    sharingType: 'single',
    amenities: '',
    vacancyStatus: 'available',
    latitude: '',
    longitude: ''
  });

  const [images, setImages] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchProperty = async () => {
        try {
          const res = await api.get(`/properties/${id}`);
          const prop = res.data.data;
          setFormData({
            title: prop.title || '',
            description: prop.description || '',
            rent: prop.rent || '',
            deposit: prop.deposit || '',
            city: prop.city || '',
            locality: prop.locality || '',
            nearestCollege: prop.nearestCollege || '',
            propertyType: prop.propertyType || 'PG',
            sharingType: prop.sharingType || 'single',
            amenities: prop.amenities ? prop.amenities.join(', ') : '',
            vacancyStatus: prop.vacancyStatus || 'available',
            latitude: prop.latitude || '',
            longitude: prop.longitude || ''
          });
        } catch (err) {
          setError('Failed to load property data');
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      
      const payload = {
        ...formData,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
      };

      let propertyId = id;

      if (isEditMode) {
        await api.put(`/properties/${id}`, payload);
      } else {
        const res = await api.post('/properties', payload);
        propertyId = res.data.data._id;
      }

      // Handle image upload if new images selected
      if (images && images.length > 0) {
        const formDataObj = new FormData();
        Array.from(images).forEach(file => {
          formDataObj.append('images', file);
        });
        
        await api.post(`/properties/${propertyId}/images`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/manage-listings');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save property');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{isEditMode ? 'Edit Listing' : 'Add New Listing'}</h1>
            <p className="text-sm text-gray-500 mt-1">Provide detailed information to attract the right tenants.</p>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/manage-listings')} 
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors font-medium bg-white"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 shadow-sm text-sm">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Basic & Financials */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Section 1: Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-base font-bold text-gray-900">Basic Information</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Property Title</label>
                    <input name="title" required value={formData.title} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-shadow" placeholder="e.g. Spacious PG near Jain University" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-shadow" placeholder="Highlight key features, rules, or environment..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Property Type</label>
                      <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                        <option value="PG">PG</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Shared Room">Shared Room</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Sharing Type</label>
                      <select name="sharingType" value={formData.sharingType} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                        <option value="dormitory">Dormitory</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Location Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-base font-bold text-gray-900">Location Details</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                      <input name="city" required value={formData.city} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Bangalore" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Locality / Area</label>
                      <input name="locality" required value={formData.locality} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Koramangala" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nearest College <span className="text-gray-400 font-normal">(Improves search visibility)</span></label>
                    <input name="nearestCollege" value={formData.nearestCollege} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Christ University" />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Map Coordinates (Optional)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Latitude</label>
                        <input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Longitude</label>
                        <input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Financials, Amenities, Media */}
            <div className="space-y-6">
              
              {/* Section 3: Financials */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-base font-bold text-gray-900">Financials</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Rent (₹)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-xs">₹</span>
                      </div>
                      <input name="rent" type="number" required value={formData.rent} onChange={handleChange} className="w-full pl-7 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Security Deposit (₹)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-xs">₹</span>
                      </div>
                      <input name="deposit" type="number" value={formData.deposit} onChange={handleChange} className="w-full pl-7 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="0.00" />
                    </div>
                  </div>
                  {isEditMode && (
                    <div className="pt-3 border-t border-gray-100">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Vacancy Status</label>
                      <select name="vacancyStatus" value={formData.vacancyStatus} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                        <option value="available">Available for Rent</option>
                        <option value="full">Currently Full</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Amenities & Media */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-base font-bold text-gray-900">Amenities & Media</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Amenities</label>
                    <p className="text-[10px] text-gray-500 mb-1">Separate with commas (e.g. wifi, ac, gym)</p>
                    <textarea name="amenities" rows="2" value={formData.amenities} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="wifi, ac, laundry..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Upload Images</label>
                    <p className="text-[10px] text-gray-500 mb-1">Max 5MB each.</p>
                    <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center hover:bg-gray-50 transition-colors">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={handleFileChange} 
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4 pb-8 gap-3">
            <button type="submit" disabled={submitting} className="w-full md:w-auto bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition-colors shadow shadow-primary-200 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving Property...
                </span>
              ) : 'Save Property Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingForm;
