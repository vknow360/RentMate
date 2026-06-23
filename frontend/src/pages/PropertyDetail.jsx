import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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

  if (loading) return <div className="text-center py-12">Loading property...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!property) return <div className="text-center py-12">Property not found</div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-8 lg:px-12">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-600 mt-1">{property.locality}, {property.city}</p>
          {reviewsData.totalReviews > 0 && (
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 font-medium text-gray-700">{reviewsData.averageRating}</span>
              <span className="ml-1 text-sm text-gray-500">({reviewsData.totalReviews} reviews)</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">₹{property.rent}<span className="text-sm text-gray-500 font-normal">/mo</span></div>
          {property.deposit && <div className="text-sm text-gray-500">Deposit: ₹{property.deposit}</div>}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img src={property.images[0]} alt="Main" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">No Image</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 h-64 md:h-96">
          {[1, 2, 3, 4].map(idx => (
             <div key={idx} className="bg-gray-200 rounded-lg overflow-hidden h-full">
               {property.images && property.images[idx] ? (
                 <img src={property.images[idx]} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
               ) : (
                 <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">No Image</div>
               )}
             </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <section className="bg-white p-5 rounded shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">Details</h2>
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div><span className="text-gray-500">Property Type:</span> <span className="font-medium text-gray-900">{property.propertyType}</span></div>
              <div><span className="text-gray-500">Sharing Type:</span> <span className="font-medium text-gray-900">{property.sharingType}</span></div>
              <div><span className="text-gray-500">Nearest College:</span> <span className="font-medium text-gray-900">{property.nearestCollege || 'N/A'}</span></div>
              <div><span className="text-gray-500">Vacancy:</span> <span className="font-medium text-gray-900">{property.vacancyStatus}</span></div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 mt-6">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{property.description || 'No description provided.'}</p>
          </section>

          <section className="bg-white p-5 rounded shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">Amenities</h2>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{amenity}</span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No amenities listed.</p>
            )}
          </section>

          {/* Reviews Section */}
          <section className="bg-white p-5 rounded shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">Reviews</h2>
            
            {user?.role === 'student' && !reviewsData.reviews.some(r => r.studentId?._id === user._id) && (
              <form onSubmit={submitReview} className="mb-8 bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Leave a Review</h3>
                {reviewStatus.error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm mb-3">{reviewStatus.error}</div>}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select 
                    value={reviewForm.rating} 
                    onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                    className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 bg-white"
                  >
                    {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea 
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 text-sm"
                    rows="3"
                  ></textarea>
                </div>
                <button type="submit" disabled={reviewStatus.sending} className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition-colors font-medium">
                  {reviewStatus.sending ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {reviewsData.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.reviews.map(review => (
                  <div key={review._id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-gray-900">{review.studentId?.name || 'Anonymous User'}</div>
                      <div className="text-yellow-400 text-sm">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </section>

          {property.latitude && property.longitude && (
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location Map</h2>
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${property.latitude},${property.longitude}`}
                  allowFullScreen
                ></iframe>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded shadow-sm border border-gray-200 sticky top-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">Owner Info</h2>
            <div className="mb-4">
              <p className="font-medium text-gray-900">{property.ownerId?.name}</p>
              <p className="text-sm text-gray-500">{property.ownerId?.email}</p>
            </div>
            
            {user?.role === 'student' ? (
              <div className="mb-3">
                {inquiryStatus.success && <div className="bg-green-50 text-green-700 p-2 rounded text-sm mb-3">Inquiry sent successfully!</div>}
                {inquiryStatus.error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm mb-3">{inquiryStatus.error}</div>}
                
                {showInquiryForm ? (
                  <form onSubmit={submitInquiry} className="space-y-3">
                    <textarea 
                      required
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 text-sm"
                      rows="3"
                      placeholder="Hi, I'm interested in this property..."
                    ></textarea>
                    <div className="flex gap-2">
                      <button type="submit" disabled={inquiryStatus.sending} className="flex-1 bg-primary-600 text-white py-2 rounded text-sm hover:bg-primary-700 transition-colors font-medium">
                        {inquiryStatus.sending ? 'Sending...' : 'Send'}
                      </button>
                      <button type="button" onClick={() => setShowInquiryForm(false)} className="flex-1 border border-gray-300 bg-white py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowInquiryForm(true)} className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition-colors font-medium">
                    Contact Owner
                  </button>
                )}
              </div>
            ) : user?.role === 'owner' && user?._id === property.ownerId?._id ? (
               <Link to={`/properties/${property._id}/edit`} className="block text-center w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition-colors font-medium mb-3">
                 Edit Property
               </Link>
            ) : (
               <div className="text-sm text-gray-500 text-center border border-gray-200 p-3 rounded bg-gray-50 mb-3">
                 Login as a student to contact owner
               </div>
            )}
            
            {user?.role === 'student' && (
              <button onClick={toggleWishlist} className={`w-full border py-2 rounded transition-colors font-medium flex justify-center items-center gap-2 ${inWishlist ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${inWishlist ? 'fill-current' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={inWishlist ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
