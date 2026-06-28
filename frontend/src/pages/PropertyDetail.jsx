import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

const CITY_COORDINATES = {
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 }
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState({ sending: false, success: false, error: '' });
  
  // Reviews state
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewStatus, setReviewStatus] = useState({ sending: false, error: '' });

  const [mapCoords, setMapCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (property) {
      const cityKey = (property.city || '').toLowerCase().trim();
      const defaultCoords = CITY_COORDINATES[cityKey] || { lat: 20.5937, lng: 78.9629 };

      const dbLat = parseFloat(property.latitude);
      const dbLng = parseFloat(property.longitude);

      const isMismatched =
        cityKey !== 'delhi' &&
        dbLat >= 28.0 && dbLat <= 29.0 &&
        dbLng >= 77.0 && dbLng <= 78.0;

      const isCoordsDefault =
        defaultCoords &&
        Math.abs(dbLat - defaultCoords.lat) < 0.0001 &&
        Math.abs(dbLng - defaultCoords.lng) < 0.0001;

      const hasRealDbLocation =
        !isNaN(dbLat) &&
        !isNaN(dbLng) &&
        dbLat !== 0 &&
        dbLng !== 0 &&
        !isMismatched &&
        !isCoordsDefault;

      if (hasRealDbLocation) {
        // DB has real location. Point directly to it and don't query Nominatim.
        setMapCoords({ lat: dbLat, lng: dbLng });
      } else {
        // DB location doesn't exist or is default. Let's geocode using Nominatim to find a real location.
        const queryFull = `${property.locality || ''}, ${property.city || ''}`;
        
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryFull)}&limit=1`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              setMapCoords({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
              });
            } else {
              // Try searching only for the city if full query failed
              fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(property.city || '')}&limit=1`)
                .then((res2) => res2.json())
                .then((data2) => {
                  if (data2 && data2.length > 0) {
                    setMapCoords({
                      lat: parseFloat(data2[0].lat),
                      lng: parseFloat(data2[0].lon)
                    });
                  } else {
                    // Final fallback to city default
                    setMapCoords({ lat: defaultCoords.lat, lng: defaultCoords.lng });
                  }
                })
                .catch((err) => {
                  console.error('City-only geocoding error:', err);
                  setMapCoords({ lat: defaultCoords.lat, lng: defaultCoords.lng });
                });
            }
          })
          .catch((err) => {
            console.error('Full geocoding error:', err);
            setMapCoords({ lat: defaultCoords.lat, lng: defaultCoords.lng });
          });
      }
    }
  }, [property]);

  useEffect(() => {
    const fetchPropertyAndWishlist = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data.data);
        
        if (user && user.role === 'student') {
          const wlRes = await api.get(`/properties/${id}/check`.replace('properties', 'wishlist'));
          setInWishlist(wlRes.data.data.inWishlist);
        }
        
        // Fetch reviews
        const revRes = await api.get(`/reviews/property/${id}`);
        setReviewsData(revRes.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyAndWishlist();
  }, [id, user]);

  const toggleWishlist = async () => {
    try {
      await api.post(`/wishlist/${id}`);
      setInWishlist(!inWishlist);
    } catch (err) {
      alert('Failed to update wishlist');
    }
  };

  const submitInquiry = async (e) => {
    e.preventDefault();
    try {
      setInquiryStatus({ sending: true, success: false, error: '' });
      await api.post('/inquiries', { propertyId: id, message: inquiryMessage });
      setInquiryStatus({ sending: false, success: true, error: '' });
      setInquiryMessage('');
      setShowInquiryForm(false);
    } catch (err) {
      setInquiryStatus({ sending: false, success: false, error: err.response?.data?.error || 'Failed to send inquiry' });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      setReviewStatus({ sending: true, error: '' });
      const res = await api.post('/reviews', { propertyId: id, ...reviewForm });
      // Update reviews list optimistically
      const newReviews = [res.data.data, ...reviewsData.reviews];
      const newTotal = reviewsData.totalReviews + 1;
      const newAvg = ((reviewsData.averageRating * reviewsData.totalReviews) + reviewForm.rating) / newTotal;
      
      setReviewsData({
        reviews: newReviews,
        totalReviews: newTotal,
        averageRating: Math.round(newAvg * 10) / 10
      });
      setReviewForm({ rating: 5, comment: '' });
      setReviewStatus({ sending: false, error: '' });
    } catch (err) {
      setReviewStatus({ sending: false, error: err.response?.data?.error || 'Failed to submit review' });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="w-16 h-16 border-4 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="glass-card p-8 border-error/50">
        <p className="text-error font-bold text-xl">{error}</p>
      </div>
    </div>
  );
  
  if (!property) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="glass-card p-8">
        <p className="text-text-primary font-bold text-xl">Property not found</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-4 sm:px-8 lg:px-12 pb-20">
      <AnimatedSection>
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-text-primary mb-2">{property.title}</h1>
            <p className="text-text-secondary text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {property.locality}, {property.city}
            </p>
            {reviewsData.totalReviews > 0 && (
              <div className="flex items-center mt-3 bg-bg-surface px-3 py-1 rounded-full border border-glass-border w-fit">
                <span className="text-accent-warm text-lg">★</span>
                <span className="ml-1 font-bold text-text-primary">{reviewsData.averageRating}</span>
                <span className="ml-1 text-sm text-text-secondary">({reviewsData.totalReviews} reviews)</span>
              </div>
            )}
          </div>
          <div className="md:text-right glass-card px-6 py-3 border-accent-warm/30">
            <div className="text-3xl font-bold text-accent-warm font-heading">₹{property.rent}<span className="text-sm text-text-secondary font-normal">/mo</span></div>
            {property.deposit && <div className="text-sm text-text-secondary mt-1">Deposit: ₹{property.deposit}</div>}
          </div>
        </div>
      </AnimatedSection>

      {/* Image Gallery */}
      <AnimatedSection delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="h-64 md:h-96 glass-card overflow-hidden p-1">
            {property.images && property.images.length > 0 ? (
              <img src={property.images[0]} alt="Main" className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-bg-surface text-text-tertiary rounded-lg">No Image Available</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 h-64 md:h-96">
            {[1, 2, 3, 4].map(idx => (
               <div key={idx} className="glass-card overflow-hidden p-1 h-full">
                 {property.images && property.images[idx] ? (
                   <img src={property.images[idx]} alt={`Gallery ${idx}`} className="w-full h-full object-cover rounded-lg hover:scale-110 transition-transform duration-700" />
                 ) : (
                   <div className="flex items-center justify-center w-full h-full bg-bg-surface text-text-tertiary text-sm rounded-lg">No Image</div>
                 )}
               </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <AnimatedSection direction="up" delay={200}>
            <section className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-bold font-heading uppercase tracking-wider text-accent-warm mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Property Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-bg-surface p-4 rounded-xl border border-glass-border">
                  <div className="text-text-secondary text-xs uppercase mb-1">Type</div>
                  <div className="font-bold text-text-primary">{property.propertyType}</div>
                </div>
                <div className="bg-bg-surface p-4 rounded-xl border border-glass-border">
                  <div className="text-text-secondary text-xs uppercase mb-1">Sharing</div>
                  <div className="font-bold text-text-primary capitalize">{property.sharingType}</div>
                </div>
                <div className="bg-bg-surface p-4 rounded-xl border border-glass-border">
                  <div className="text-text-secondary text-xs uppercase mb-1">Vacancy</div>
                  <div className="font-bold text-text-primary">{property.vacancyStatus}</div>
                </div>
                <div className="bg-bg-surface p-4 rounded-xl border border-glass-border">
                  <div className="text-text-secondary text-xs uppercase mb-1">Nearest College</div>
                  <div className="font-bold text-text-primary truncate">{property.nearestCollege || 'N/A'}</div>
                </div>
              </div>
              <h3 className="font-bold font-heading text-text-primary mb-3 text-xl">Description</h3>
              <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{property.description || 'No description provided.'}</p>
            </section>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={300}>
            <section className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-bold font-heading uppercase tracking-wider text-accent-warm mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                Amenities
              </h2>
              {property.amenities && property.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <span key={idx} className="bg-bg-surface border border-glass-border text-text-primary px-4 py-2 rounded-full text-sm font-medium hover:border-accent-warm transition-colors cursor-default">
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-text-tertiary italic">No amenities listed.</p>
              )}
            </section>
          </AnimatedSection>

          {/* Location Map */}
          {mapCoords.lat && mapCoords.lng && (
            <AnimatedSection direction="up" delay={400}>
              <section className="glass-card p-6 sm:p-8">
                <h2 className="text-lg font-bold font-heading uppercase tracking-wider text-accent-warm mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                  Location
                </h2>
                <div className="w-full h-80 bg-bg-surface rounded-xl overflow-hidden border border-glass-border">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng - 0.005}%2C${mapCoords.lat - 0.005}%2C${mapCoords.lng + 0.005}%2C${mapCoords.lat + 0.005}&layer=mapnik&marker=${mapCoords.lat}%2C${mapCoords.lng}`}
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            </AnimatedSection>
          )}

          {/* Reviews Section */}
          <AnimatedSection direction="up" delay={500}>
            <section className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-bold font-heading uppercase tracking-wider text-accent-warm mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                Reviews
              </h2>
              
              {user?.role === 'student' && !reviewsData.reviews.some(r => r.studentId?._id === user._id) && (
                <form onSubmit={submitReview} className="mb-8 bg-bg-surface p-6 rounded-xl border border-glass-border">
                  <h3 className="font-bold font-heading text-text-primary mb-4 text-xl">Leave a Review</h3>
                  {reviewStatus.error && <div className="bg-error/10 border border-error/50 text-error p-3 rounded-lg text-sm mb-4">{reviewStatus.error}</div>}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Rating</label>
                    <select 
                      value={reviewForm.rating} 
                      onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                      className="w-full md:w-48 px-4 py-2 border border-glass-border rounded-lg bg-bg-base text-text-primary focus:ring-2 focus:ring-accent-warm outline-none"
                    >
                      {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Comment</label>
                    <textarea 
                      required
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                      className="w-full px-4 py-3 border border-glass-border rounded-lg bg-bg-base text-text-primary focus:ring-2 focus:ring-accent-warm outline-none"
                      rows="3"
                      placeholder="Share your experience..."
                    ></textarea>
                  </div>
                  <button type="submit" disabled={reviewStatus.sending} className="bg-accent-warm text-bg-base px-6 py-2 rounded-lg font-bold hover:bg-accent-warm-muted transition-all disabled:opacity-50 hover-lift">
                    {reviewStatus.sending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {reviewsData.reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviewsData.reviews.map((review, i) => (
                    <div key={review._id} className={`border-b border-glass-border pb-6 ${i === reviewsData.reviews.length - 1 ? 'border-0 pb-0' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center font-bold">
                          {review.studentId?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">{review.studentId?.name || 'Anonymous User'}</div>
                          <div className="text-accent-warm text-sm">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </div>
                        </div>
                      </div>
                      <p className="text-text-secondary mt-3 pl-13">{review.comment}</p>
                      <p className="text-xs text-text-tertiary mt-2 pl-13">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-bg-surface rounded-xl border border-glass-border">
                  <p className="text-text-secondary">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </section>
          </AnimatedSection>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <AnimatedSection direction="left" delay={300}>
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Property Owner</h2>
              <div className="flex items-center gap-4 mb-6 bg-bg-surface p-4 rounded-xl border border-glass-border">
                <div className="w-12 h-12 bg-accent-warm/20 text-accent-warm rounded-full flex items-center justify-center font-bold text-xl">
                  {property.ownerId?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-bold text-text-primary">{property.ownerId?.name}</p>
                  <p className="text-xs text-text-secondary mt-1">{property.ownerId?.email}</p>
                </div>
              </div>
              
              {user?.role === 'student' ? (
                <div className="space-y-4">
                  {inquiryStatus.success && <div className="bg-success/10 text-success border border-success/30 p-3 rounded-lg text-sm">Inquiry sent successfully!</div>}
                  {inquiryStatus.error && <div className="bg-error/10 text-error border border-error/30 p-3 rounded-lg text-sm">{inquiryStatus.error}</div>}
                  
                  {showInquiryForm ? (
                    <form onSubmit={submitInquiry} className="space-y-3 bg-bg-surface p-4 rounded-xl border border-glass-border">
                      <textarea 
                        required
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-glass-border rounded-lg bg-bg-base text-text-primary focus:ring-2 focus:ring-accent-warm outline-none text-sm"
                        rows="4"
                        placeholder="Hi, I'm interested in this property..."
                      ></textarea>
                      <div className="flex gap-2">
                        <button type="submit" disabled={inquiryStatus.sending} className="flex-1 bg-accent-warm text-bg-base py-2 rounded-lg font-bold hover:bg-accent-warm-muted transition-colors text-sm hover-lift">
                          {inquiryStatus.sending ? 'Sending...' : 'Send'}
                        </button>
                        <button type="button" onClick={() => setShowInquiryForm(false)} className="flex-1 border border-glass-border text-text-primary py-2 rounded-lg hover:bg-bg-surface transition-colors text-sm">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setShowInquiryForm(true)} className="w-full bg-accent-warm text-bg-base py-3 rounded-lg font-bold hover:bg-accent-warm-muted transition-all hover-lift shadow-[0_0_15px_rgba(212,165,116,0.3)]">
                      Contact Owner
                    </button>
                  )}
                  
                  <button onClick={toggleWishlist} className={`w-full border py-3 rounded-lg transition-all font-bold flex justify-center items-center gap-2 hover-lift ${inWishlist ? 'border-error/50 text-error bg-error/10' : 'border-glass-border text-text-primary bg-bg-surface hover:border-accent-warm hover:text-accent-warm'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={inWishlist ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
                  </button>
                </div>
              ) : user?.role === 'owner' && user?._id === property.ownerId?._id ? (
                 <Link to={`/properties/${property._id}/edit`} className="block text-center w-full border border-accent-warm text-accent-warm py-3 rounded-lg hover:bg-accent-warm/10 transition-all font-bold hover-lift">
                   Edit Property
                 </Link>
              ) : (
                 <div className="text-sm text-text-secondary text-center border border-glass-border p-4 rounded-xl bg-bg-surface italic">
                   Login as a student to contact owner or save to wishlist
                 </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
