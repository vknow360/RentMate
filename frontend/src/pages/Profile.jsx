import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: '',
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
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
        
        {message.text && (
          <div className={`p-4 rounded mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
              <input name="profileImage" type="url" value={formData.profileImage} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>

          {user.role === 'student' && (
            <>
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Roommate Preferences</h3>
                  <div className="flex items-center">
                    <input 
                      id="isLookingForRoommate" 
                      name="isLookingForRoommate" 
                      type="checkbox" 
                      checked={formData.isLookingForRoommate} 
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
                    />
                    <label htmlFor="isLookingForRoommate" className="ml-2 block text-sm text-gray-900">
                      Looking for a roommate
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Schedule</label>
                    <select name="pref_sleepSchedule" value={formData.preferences.sleepSchedule} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
                      <option value="early_bird">Early Bird</option>
                      <option value="night_owl">Night Owl</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Study Habits</label>
                    <select name="pref_studyHabits" value={formData.preferences.studyHabits} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
                      <option value="quiet_focused">Quiet & Focused</option>
                      <option value="group_study">Group Study</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Preference</label>
                    <select name="pref_foodPreference" value={formData.preferences.foodPreference} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
                      <option value="veg">Vegetarian</option>
                      <option value="non_veg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="eggetarian">Eggetarian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Social Type</label>
                    <select name="pref_socialType" value={formData.preferences.socialType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
                      <option value="introvert">Introvert</option>
                      <option value="extrovert">Extrovert</option>
                      <option value="balanced">Balanced</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center h-full pt-6">
                    <input name="pref_smoking" id="smoking" type="checkbox" checked={formData.preferences.smoking} onChange={handleChange} className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                    <label htmlFor="smoking" className="ml-2 block text-sm text-gray-700">I smoke</label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness (1-5)</label>
                    <input name="pref_cleanliness" type="range" min="1" max="5" value={formData.preferences.cleanliness} onChange={handleChange} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Relaxed</span>
                      <span>Very Tidy</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Noise Tolerance (1-5)</label>
                    <input name="pref_noiseTolerance" type="range" min="1" max="5" value={formData.preferences.noiseTolerance} onChange={handleChange} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (₹)</label>
                    <input name="pref_budget" type="number" value={formData.preferences.budget} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500" />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea name="pref_bio" rows="3" value={formData.preferences.bio} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500" placeholder="A little about yourself..."></textarea>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
