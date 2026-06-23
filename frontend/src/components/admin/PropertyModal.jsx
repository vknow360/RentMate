import React from 'react';

const PropertyModal = ({ property, onClose }) => {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-1/2">
              {property.images && property.images.length > 0 ? (
                <div className="grid gap-2">
                  <img src={property.images[0]} alt={property.title} className="w-full h-64 object-cover rounded-lg shadow-sm" />
                  {property.images.length > 1 && (
                    <div className="grid grid-cols-2 gap-2">
                      {property.images.slice(1, 3).map((img, i) => (
                        <img key={i} src={img} alt={`${property.title} ${i}`} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">No Images</div>
              )}
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{property.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${property.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {property.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-primary-600 mb-4">₹{property.rent} <span className="text-sm font-normal text-gray-500">/ month</span></p>
                <div className="space-y-3 mb-6">
                  <p className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {property.locality}, {property.city}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Near {property.nearestCollege}
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{property.propertyType}</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">{property.sharingType} Sharing</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${property.vacancyStatus === 'available' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{property.vacancyStatus}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Owner Information</h4>
                <p className="font-medium text-gray-900">{property.ownerId?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600">{property.ownerId?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{property.description || 'No description provided.'}</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Amenities</h4>
              {property.amenities && property.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-md text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No amenities listed.</p>
              )}
              
              <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 border-b pb-2">Financials</h4>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="font-semibold">₹{property.rent}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Security Deposit</span>
                <span className="font-semibold">₹{property.deposit || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
