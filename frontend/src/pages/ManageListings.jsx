import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
      <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const availableUnits = properties.filter(p => p.vacancyStatus === 'available').length;
  const pendingInquiries = inquiries.filter(iq => iq.status === 'pending').length;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] pb-12">
      {/* Top Banner / Dashboard Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Property Owner Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your properties and inquiries efficiently.</p>
          </div>
          <Link to="/properties/new" className="mt-4 md:mt-0 flex items-center bg-primary-600 text-white px-4 py-2 text-sm rounded shadow-sm shadow-primary-200 hover:bg-primary-700 transition-colors font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add New Listing
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Properties</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{properties.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Units</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{availableUnits}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Inquiries</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingInquiries}</p>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold text-gray-900">Your Properties</h2>
          </div>
          
          <div className="p-0">
            {properties.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {properties.map(property => {
                  const propInquiries = inquiries.filter(iq => iq.propertyId?._id === property._id);
                  const propPendingInquiries = propInquiries.filter(iq => iq.status === 'pending').length;

                  return (
                    <li key={property._id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <img 
                          src={property.images?.[0] || 'https://via.placeholder.com/100'} 
                          alt={property.title} 
                          className="w-16 h-16 rounded object-cover shadow-sm border border-gray-200" 
                        />
                        <div>
                          <h3 className="font-bold text-gray-900 text-base flex items-center">
                            {property.title}
                            {property.isVerified && <svg className="w-5 h-5 ml-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">{property.locality}, {property.city}</p>
                          <div className="mt-2 flex items-center space-x-3 text-sm">
                            <span className="font-semibold text-primary-600">₹{property.rent}/mo</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600 capitalize">{property.propertyType}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600 capitalize">{property.sharingType} Sharing</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 min-w-[200px]">
                        {/* Quick Vacancy Toggle */}
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                          <button 
                            onClick={() => property.vacancyStatus !== 'available' && toggleVacancyStatus(property._id, property.vacancyStatus)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${property.vacancyStatus === 'available' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            Available
                          </button>
                          <button 
                            onClick={() => property.vacancyStatus !== 'full' && toggleVacancyStatus(property._id, property.vacancyStatus)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${property.vacancyStatus === 'full' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            Full
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to="/inquiries" className="relative p-2 text-gray-500 hover:text-primary-600 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow transition-all group">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                            {propPendingInquiries > 0 && (
                              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                                {propPendingInquiries}
                              </span>
                            )}
                          </Link>
                          <Link to={`/properties/${property._id}/edit`} className="p-2 text-gray-500 hover:text-blue-600 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </Link>
                          <button onClick={() => handleDelete(property._id)} className="p-2 text-gray-500 hover:text-red-600 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-4">🏠</div>
                <p className="text-gray-900 font-medium text-lg">No properties listed</p>
                <p className="text-gray-500 text-sm mt-1">Add your first property to start receiving inquiries.</p>
                <Link to="/properties/new" className="mt-4 text-primary-600 font-medium hover:text-primary-800">Add New Listing</Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageListings;
