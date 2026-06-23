import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex flex-col h-full transition-transform hover:scale-[1.02]">
      <div className="h-48 bg-gray-200 relative">
        {property.images && property.images.length > 0 ? (
          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            No Image Available
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-semibold shadow-sm text-gray-700">
          ₹{property.rent}/mo
        </div>
        {!property.isVerified && (
          <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">
            Pending Verification
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{property.title}</h3>
        <p className="text-sm text-gray-600 mb-2 truncate">{property.locality}, {property.city}</p>
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>{property.propertyType}</span>
            <span>{property.sharingType} sharing</span>
          </div>
          <Link 
            to={`/properties/${property._id}`}
            className="block w-full text-center bg-gray-50 text-primary-600 border border-primary-200 hover:bg-primary-50 py-2 rounded transition-colors font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
