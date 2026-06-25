import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

const ManageListings = () => {
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propsRes, inqRes] = await Promise.all([
        api.get(`/properties?owner=me`),
        api.get(`/inquiries/owner`)
      ]);
      setProperties(propsRes.data.data.properties);
      setInquiries(inqRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing permanently?')) {
      try {
        await api.delete(`/properties/${id}`);
        setProperties(properties.filter(p => p._id !== id));
      } catch (error) {
        console.error('Failed to delete', error);
        alert('Failed to delete property');
      }
    }
  };

  const toggleVacancyStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'full' : 'available';
    try {
      const res = await api.put(`/properties/${id}`, { vacancyStatus: newStatus });
      setProperties(properties.map(p => p._id === id ? res.data.data : p));
    } catch (error) {
      alert('Failed to update vacancy status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-16 h-16 border-4 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const availableUnits = properties.filter(p => p.vacancyStatus === 'available').length;
  const pendingInquiries = inquiries.filter(iq => iq.status === 'pending').length;

  return (
    <div className="min-h-[calc(100vh-64px)] pb-12">
      {/* Top Banner / Dashboard Header */}
      <div className="bg-bg-surface border-b border-glass-border py-8 px-4 sm:px-6 lg:px-8 mb-8">
        <AnimatedSection>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary">Property Owner Dashboard</h1>
              <p className="text-text-secondary mt-2">Manage your properties and inquiries efficiently.</p>
            </div>
            <Link to="/properties/new" className="flex items-center bg-accent-warm text-bg-base px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(212,165,116,0.3)] hover:bg-accent-warm-muted transition-colors font-bold hover-lift">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              Add New Listing
            </Link>
          </div>
        </AnimatedSection>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metrics Row */}
        <AnimatedSection delay={100} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-card p-6 flex items-center border-l-4 border-l-accent-violet hover-lift">
              <div className="p-4 bg-accent-violet/10 text-accent-violet rounded-xl mr-5 border border-accent-violet/20 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Properties</h3>
                <p className="text-3xl font-bold font-heading text-text-primary mt-1">{properties.length}</p>
              </div>
            </div>
            <div className="glass-card p-6 flex items-center border-l-4 border-l-accent-sky hover-lift">
              <div className="p-4 bg-accent-sky/10 text-accent-sky rounded-xl mr-5 border border-accent-sky/20 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Available Units</h3>
                <p className="text-3xl font-bold font-heading text-text-primary mt-1">{availableUnits}</p>
              </div>
            </div>
            <div className="glass-card p-6 flex items-center border-l-4 border-l-accent-rose hover-lift">
              <div className="p-4 bg-accent-rose/10 text-accent-rose rounded-xl mr-5 border border-accent-rose/20 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pending Inquiries</h3>
                <p className="text-3xl font-bold font-heading text-text-primary mt-1">{pendingInquiries}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Properties List */}
        <AnimatedSection delay={200} direction="up">
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-5 border-b border-glass-border bg-bg-surface flex justify-between items-center">
              <h2 className="text-lg font-bold font-heading text-text-primary uppercase tracking-wider flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                Your Properties
              </h2>
            </div>
            
            <div className="p-0">
              {properties.length > 0 ? (
                <ul className="divide-y divide-glass-border">
                  {properties.map(property => {
                    const propInquiries = inquiries.filter(iq => iq.propertyId?._id === property._id);
                    const propPendingInquiries = propInquiries.filter(iq => iq.status === 'pending').length;

                    return (
                      <li key={property._id} className="p-6 hover:bg-bg-surface/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                        <div className="flex items-center space-x-5 flex-1">
                          <img 
                            src={property.images?.[0] || 'https://via.placeholder.com/100'} 
                            alt={property.title} 
                            className="w-20 h-20 rounded-xl object-cover shadow-md border border-glass-border" 
                          />
                          <div>
                            <h3 className="font-bold font-heading text-text-primary text-lg flex items-center">
                              {property.title}
                              {property.isVerified && <svg className="w-5 h-5 ml-2 text-accent-teal drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>}
                            </h3>
                            <p className="text-sm text-text-secondary font-medium mt-1">{property.locality}, {property.city}</p>
                            <div className="mt-3 flex items-center space-x-3 text-sm">
                              <span className="font-bold text-accent-warm px-2 py-0.5 bg-accent-warm/10 rounded-md border border-accent-warm/20">₹{property.rent}/mo</span>
                              <span className="text-glass-border">|</span>
                              <span className="text-text-secondary capitalize font-medium">{property.propertyType}</span>
                              <span className="text-glass-border">|</span>
                              <span className="text-text-secondary capitalize font-medium">{property.sharingType} Sharing</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-4 min-w-[200px]">
                          {/* Quick Vacancy Toggle */}
                          <div className="flex items-center bg-bg-surface p-1.5 rounded-xl border border-glass-border shadow-inner">
                            <button 
                              onClick={() => property.vacancyStatus !== 'available' && toggleVacancyStatus(property._id, property.vacancyStatus)}
                              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${property.vacancyStatus === 'available' ? 'bg-success text-bg-base shadow-md' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'}`}
                            >
                              Available
                            </button>
                            <button 
                              onClick={() => property.vacancyStatus !== 'full' && toggleVacancyStatus(property._id, property.vacancyStatus)}
                              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${property.vacancyStatus === 'full' ? 'bg-error text-bg-base shadow-md' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'}`}
                            >
                              Full
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Link to="/inquiries" className="relative p-2.5 text-text-secondary hover:text-accent-teal bg-bg-surface rounded-lg border border-glass-border hover:border-accent-teal/50 shadow-sm hover:shadow-[0_0_10px_rgba(78,205,196,0.2)] transition-all group-btn hover-lift">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                              {propPendingInquiries > 0 && (
                                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-bg-base bg-error rounded-full border-2 border-bg-elevated shadow-sm">
                                  {propPendingInquiries}
                               </span>
                              )}
                            </Link>
                            <Link to={`/properties/${property._id}/edit`} className="p-2.5 text-text-secondary hover:text-accent-warm bg-bg-surface rounded-lg border border-glass-border hover:border-accent-warm/50 shadow-sm hover:shadow-[0_0_10px_rgba(212,165,116,0.2)] transition-all hover-lift">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </Link>
                            <button onClick={() => handleDelete(property._id)} className="p-2.5 text-text-secondary hover:text-error bg-bg-surface rounded-lg border border-glass-border hover:border-error/50 shadow-sm hover:shadow-[0_0_10px_rgba(255,82,82,0.2)] transition-all hover-lift">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-bg-surface rounded-full flex items-center justify-center text-3xl mb-6 border border-glass-border animate-float">🏠</div>
                  <p className="text-text-primary font-bold font-heading text-xl mb-2">No properties listed</p>
                  <p className="text-text-secondary">Add your first property to start receiving inquiries.</p>
                  <Link to="/properties/new" className="mt-6 bg-accent-warm text-bg-base px-6 py-2.5 rounded-lg font-bold hover:bg-accent-warm-muted transition-colors shadow-md hover-lift">Add New Listing</Link>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ManageListings;
