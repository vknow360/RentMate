import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import AnimatedSection from '../components/AnimatedSection';

const ListingForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState('');
  
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

  const handleFetchCoordinates = async () => {
    const { city, locality } = formData;
    if (!city || !locality) {
      setGeocodingError('Please fill in City and Locality/Area fields first.');
      return;
    }
    setGeocodingLoading(true);
    setGeocodingError('');
    try {
      const queryFull = `${locality}, ${city}`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryFull)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }));
      } else {
        // Fallback to searching only city
        const resCity = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
        const dataCity = await resCity.json();
        if (dataCity && dataCity.length > 0) {
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(dataCity[0].lat),
            longitude: parseFloat(dataCity[0].lon)
          }));
          setGeocodingError('Exact locality not found. Coordinates set to city center.');
        } else {
          setGeocodingError('Could not find coordinates for this address.');
        }
      }
    } catch (err) {
      console.error(err);
      setGeocodingError('Error fetching coordinates. Please enter them manually.');
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      
      const parsedLat = formData.latitude !== '' ? parseFloat(formData.latitude) : undefined;
      const parsedLng = formData.longitude !== '' ? parseFloat(formData.longitude) : undefined;

      const payload = {
        ...formData,
        latitude: isNaN(parsedLat) ? undefined : parsedLat,
        longitude: isNaN(parsedLng) ? undefined : parsedLng,
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
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="w-16 h-16 border-4 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] pb-12">
      {/* Header */}
      <div className="bg-bg-surface border-b border-glass-border py-8 px-4 sm:px-6 lg:px-8 mb-8">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary">{isEditMode ? 'Edit Listing' : 'Add New Listing'}</h1>
              <p className="text-text-secondary mt-2">Provide detailed information to attract the right tenants.</p>
            </div>
            <button 
              type="button" 
              onClick={() => navigate('/manage-listings')} 
              className="px-5 py-2.5 border border-glass-border text-text-primary text-sm rounded-lg hover:bg-bg-elevated transition-colors font-bold hover-lift"
            >
              Cancel
            </button>
          </div>
        </AnimatedSection>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AnimatedSection delay={100} direction="up">
          {error && (
            <div className="bg-error/10 border-l-4 border-error text-error p-4 rounded-lg mb-8 shadow-sm">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Basic & Financials */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Section 1: Basic Information */}
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-glass-border bg-bg-surface">
                    <h2 className="text-lg font-bold font-heading text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Basic Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Property Title</label>
                      <input name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" placeholder="e.g. Spacious PG near Jain University" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all resize-none" placeholder="Highlight key features, rules, or environment..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Property Type</label>
                        <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none">
                          <option value="PG">PG</option>
                          <option value="Hostel">Hostel</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Shared Room">Shared Room</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Sharing Type</label>
                        <select name="sharingType" value={formData.sharingType} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none">
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
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-glass-border bg-bg-surface">
                    <h2 className="text-lg font-bold font-heading text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Location Details
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">City</label>
                        <input name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" placeholder="e.g. Bangalore" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Locality / Area</label>
                        <input name="locality" required value={formData.locality} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" placeholder="e.g. Koramangala" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Nearest College <span className="text-text-tertiary font-normal">(Improves search visibility)</span></label>
                      <input name="nearestCollege" value={formData.nearestCollege} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" placeholder="e.g. Christ University" />
                    </div>
                    
                    <div className="bg-bg-surface/50 p-5 rounded-xl border border-glass-border mt-4 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-sm font-bold text-text-primary flex items-center">
                          Map Coordinates (Optional)
                        </h3>
                        <button
                          type="button"
                          disabled={geocodingLoading}
                          onClick={handleFetchCoordinates}
                          className="px-3 py-1 bg-text-primary text-bg-base hover:bg-white text-xs font-semibold rounded-lg transition-all focus:ring-2 focus:ring-accent-warm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                        >
                          {geocodingLoading ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-bg-base" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              Detecting...
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                              Detect from Address
                            </>
                          )}
                        </button>
                      </div>

                      {geocodingError && (
                        <p className="text-xs text-accent-warm italic bg-accent-warm/5 p-2.5 rounded-lg border border-accent-warm/25 animate-pulse">
                          {geocodingError}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-text-tertiary mb-2">Latitude</label>
                          <input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} className="w-full px-4 py-2.5 bg-bg-base border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none" placeholder="e.g. 12.9716" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-tertiary mb-2">Longitude</label>
                          <input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} className="w-full px-4 py-2.5 bg-bg-base border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none" placeholder="e.g. 77.5946" />
                        </div>
                      </div>

                      {formData.latitude && formData.longitude && !isNaN(parseFloat(formData.latitude)) && !isNaN(parseFloat(formData.longitude)) && (
                        <div className="mt-4">
                          <label className="block text-xs font-bold text-text-tertiary mb-2">Location Preview</label>
                          <div className="w-full h-40 bg-bg-surface rounded-xl overflow-hidden border border-glass-border shadow-inner">
                            <iframe
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.longitude) - 0.005}%2C${parseFloat(formData.latitude) - 0.005}%2C${parseFloat(formData.longitude) + 0.005}%2C${parseFloat(formData.latitude) + 0.005}&layer=mapnik&marker=${parseFloat(formData.latitude)}%2C${parseFloat(formData.longitude)}`}
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Financials, Amenities, Media */}
              <div className="space-y-8">
                
                {/* Section 3: Financials */}
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-glass-border bg-bg-surface">
                    <h2 className="text-lg font-bold font-heading text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Financials
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Monthly Rent (₹)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-text-secondary font-bold sm:text-sm">₹</span>
                        </div>
                        <input name="rent" type="number" required value={formData.rent} onChange={handleChange} className="w-full pl-8 px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Security Deposit (₹)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-text-secondary font-bold sm:text-sm">₹</span>
                        </div>
                        <input name="deposit" type="number" value={formData.deposit} onChange={handleChange} className="w-full pl-8 px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" placeholder="0.00" />
                      </div>
                    </div>
                    {isEditMode && (
                      <div className="pt-4 border-t border-glass-border">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Vacancy Status</label>
                        <select name="vacancyStatus" value={formData.vacancyStatus} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none">
                          <option value="available">Available for Rent</option>
                          <option value="full">Currently Full</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Amenities & Media */}
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-glass-border bg-bg-surface">
                    <h2 className="text-lg font-bold font-heading text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      Amenities & Media
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Amenities</label>
                      <p className="text-[10px] text-text-tertiary mb-3 italic">Separate with commas (e.g. wifi, ac, gym)</p>
                      <textarea name="amenities" rows="3" value={formData.amenities} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all resize-none" placeholder="wifi, ac, laundry..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Upload Images</label>
                      <p className="text-[10px] text-text-tertiary mb-3 italic">Max 5MB each.</p>
                      <div className="border-2 border-dashed border-glass-border rounded-xl p-5 text-center hover:bg-bg-elevated transition-colors bg-bg-surface group">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/jpeg, image/png, image/webp" 
                          onChange={handleFileChange} 
                          className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-accent-warm file:text-bg-base hover:file:bg-accent-warm-muted cursor-pointer transition-colors" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end pt-8 pb-12 gap-4">
              <button type="submit" disabled={submitting} className="w-full md:w-auto bg-text-primary text-bg-base px-8 py-3 rounded-xl hover:bg-white transition-colors shadow-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover-lift">
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-bg-base" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving Property...
                  </span>
                ) : 'Save Property Listing'}
              </button>
            </div>
          </form>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ListingForm;
