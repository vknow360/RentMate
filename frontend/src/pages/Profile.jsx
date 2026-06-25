import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: '',
    preferredCity: '',
    isLookingForRoommate: false,
    preferences: {
      sleepSchedule: 'flexible',
      studyHabits: 'flexible',
      foodPreference: 'veg',
      smoking: false,
      cleanliness: 3,
      socialType: 'balanced',
      noiseTolerance: 3,
      budget: '',
      bio: ''
    }
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        preferredCity: user.preferredCity || '',
        isLookingForRoommate: user.isLookingForRoommate || false,
        preferences: {
          ...formData.preferences,
          ...user.preferences,
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('pref_')) {
      const prefName = name.replace('pref_', '');
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [prefName]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage({ text: '', type: '' });
      await updateProfile(formData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to update profile', type: 'error' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] pb-12">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        <AnimatedSection>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-2">Profile Settings</h2>
            <p className="text-text-secondary">Manage your personal information and preferences.</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100} direction="up">
          <div className="glass-card p-6 sm:p-10">
            
            {message.text && (
              <div className={`p-4 rounded-xl mb-8 border font-medium ${message.type === 'success' ? 'bg-success/10 text-success border-success/30' : 'bg-error/10 text-error border-error/30'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-bold font-heading text-accent-warm uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-glass-border pb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Name</label>
                    <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Phone</label>
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Profile Image URL</label>
                    <div className="flex gap-4 items-center">
                      {formData.profileImage && (
                        <img src={formData.profileImage} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-glass-border flex-shrink-0" />
                      )}
                      <input name="profileImage" type="url" value={formData.profileImage} onChange={handleChange} placeholder="https://..." className="flex-1 px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              {user.role === 'student' && (
                <div className="pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-glass-border pb-3">
                    <h3 className="text-lg font-bold font-heading text-accent-warm uppercase tracking-wider flex items-center gap-2 mb-4 sm:mb-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      Roommate Preferences
                    </h3>
                    <div className="flex items-center bg-bg-surface px-4 py-2 rounded-lg border border-glass-border">
                      <input 
                        id="isLookingForRoommate" 
                        name="isLookingForRoommate" 
                        type="checkbox" 
                        checked={formData.isLookingForRoommate} 
                        onChange={handleChange}
                        className="h-5 w-5 text-accent-warm focus:ring-accent-warm border-glass-border rounded bg-bg-base cursor-pointer" 
                      />
                      <label htmlFor="isLookingForRoommate" className="ml-3 block text-sm font-bold text-text-primary cursor-pointer">
                        Looking for a roommate
                      </label>
                    </div>
                  </div>

                  <div className={`transition-all duration-500 ${formData.isLookingForRoommate ? 'opacity-100 max-h-[2000px]' : 'opacity-50 max-h-[2000px] pointer-events-none grayscale-[50%]'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Preferred City</label>
                        <select name="preferredCity" value={formData.preferredCity} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none" required={formData.isLookingForRoommate}>
                          <option value="">Select a city</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Pune">Pune</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Chennai">Chennai</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Sleep Schedule</label>
                        <select name="pref_sleepSchedule" value={formData.preferences.sleepSchedule} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none">
                          <option value="early_bird">Early Bird</option>
                          <option value="night_owl">Night Owl</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Study Habits</label>
                        <select name="pref_studyHabits" value={formData.preferences.studyHabits} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none">
                          <option value="quiet_focused">Quiet & Focused</option>
                          <option value="group_study">Group Study</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Food Preference</label>
                        <select name="pref_foodPreference" value={formData.preferences.foodPreference} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none">
                          <option value="veg">Vegetarian</option>
                          <option value="non_veg">Non-Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="eggetarian">Eggetarian</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Social Type</label>
                        <select name="pref_socialType" value={formData.preferences.socialType} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none">
                          <option value="introvert">Introvert</option>
                          <option value="extrovert">Extrovert</option>
                          <option value="balanced">Balanced</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center bg-bg-surface px-4 py-3 rounded-lg border border-glass-border">
                        <input name="pref_smoking" id="smoking" type="checkbox" checked={formData.preferences.smoking} onChange={handleChange} className="h-5 w-5 text-accent-warm rounded border-glass-border focus:ring-accent-warm bg-bg-base cursor-pointer" />
                        <label htmlFor="smoking" className="ml-3 block text-sm font-bold text-text-primary cursor-pointer">I smoke</label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-text-secondary font-bold">₹</span>
                          </div>
                          <input name="pref_budget" type="number" value={formData.preferences.budget} onChange={handleChange} className="w-full pl-8 px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Cleanliness (1-5)</label>
                        <div className="px-2">
                          <input name="pref_cleanliness" type="range" min="1" max="5" value={formData.preferences.cleanliness} onChange={handleChange} className="w-full accent-accent-warm" />
                          <div className="flex justify-between text-xs font-bold text-text-tertiary mt-1">
                            <span>Relaxed (1)</span>
                            <span>Very Tidy (5)</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Noise Tolerance (1-5)</label>
                        <div className="px-2">
                          <input name="pref_noiseTolerance" type="range" min="1" max="5" value={formData.preferences.noiseTolerance} onChange={handleChange} className="w-full accent-accent-warm" />
                          <div className="flex justify-between text-xs font-bold text-text-tertiary mt-1">
                            <span>Low (1)</span>
                            <span>High (5)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Bio</label>
                      <textarea name="pref_bio" rows="4" value={formData.preferences.bio} onChange={handleChange} className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent-warm outline-none resize-none" placeholder="A little about yourself..."></textarea>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-glass-border">
                <button type="submit" className="bg-accent-warm text-bg-base px-8 py-3 rounded-lg font-bold hover:bg-accent-warm-muted transition-colors shadow-[0_0_15px_rgba(212,165,116,0.3)] hover-lift">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Profile;
