import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedSection from './AnimatedSection';

const PropertyCard = ({ property, index = 0 }) => {
  return (
    <AnimatedSection delay={index * 100} direction="up" className="h-full">
      <GlassCard tilt glow className="flex flex-col h-full overflow-hidden group">
        <div className="h-48 relative overflow-hidden bg-bg-surface">
          {property.images && property.images.length > 0 ? (
            <img 
              src={property.images[0]} 
              alt={property.title} 
              className="w-full h-full object-cover parallax-img opacity-80 group-hover:opacity-100 transition-opacity" 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-text-tertiary">
              No Image Available
            </div>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-bg-base opacity-60"></div>
          
          <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-bg-base bg-accent-violet shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            ₹{property.rent}/mo
          </div>
          
          {!property.isVerified && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold text-bg-base bg-warning shadow-sm">
              Pending Verification
            </div>
          )}
        </div>
        
        <div className="p-5 flex flex-col flex-grow relative z-10">
          <h3 className="text-lg font-heading font-bold text-text-primary mb-1 truncate group-hover:text-accent-warm transition-colors">{property.title}</h3>
          <p className="text-sm text-text-secondary mb-4 truncate">{property.locality}, {property.city}</p>
          
          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between text-sm text-text-tertiary bg-bg-surface/50 p-2 rounded-md">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                {property.propertyType}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                {property.sharingType}
              </span>
            </div>
            
            <Link 
              to={`/properties/${property._id}`}
              className="block w-full text-center text-accent-warm border border-glass-border hover:border-accent-warm hover:bg-accent-warm/10 py-2 rounded-md transition-all duration-300 font-medium hover-lift"
            >
              View Details
            </Link>
          </div>
        </div>
      </GlassCard>
    </AnimatedSection>
  );
};

export default PropertyCard;
