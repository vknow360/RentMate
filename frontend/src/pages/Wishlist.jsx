import { useState, useEffect } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import AnimatedSection from '../components/AnimatedSection';

const Wishlist = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/wishlist');
        setProperties(res.data.data);
      } catch (error) {
        console.error('Failed to fetch wishlist', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] pb-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-2">My Wishlist</h1>
            <p className="text-text-secondary">Properties you've saved for later.</p>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 glass-card skeleton-shimmer border-transparent opacity-50"></div>
              ))}
            </div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, idx) => (
              <PropertyCard key={property._id} property={property} index={idx} />
            ))}
          </div>
        ) : (
          <AnimatedSection direction="up">
            <div className="text-center py-20 glass-card">
              <div className="w-20 h-20 bg-bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-glass-border animate-float">
                <svg className="h-10 w-10 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </div>
              <p className="text-text-primary text-xl font-heading font-bold mb-2">Your wishlist is empty</p>
              <p className="text-text-secondary mb-6">Start exploring properties and save your favorites here.</p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
