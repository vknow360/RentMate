import React from 'react';

const UserModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-8">
            <img 
              src={user.profileImage || 'https://via.placeholder.com/100'} 
              alt={user.name} 
              className="w-24 h-24 rounded-full object-cover shadow-sm border border-gray-200"
            />
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-2 flex space-x-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">{user.role}</span>
                {user.isSuspended && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Suspended</span>}
                {user.isVerified ? 
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Verified</span> : 
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Unverified</span>
                }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
              <p className="text-gray-900">{user.phone || 'N/A'}</p>
            </div>
            {user.role === 'student' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">College</h4>
                <p className="text-gray-900">{user.college || 'N/A'}</p>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Joined Date</h4>
              <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            {user.verificationDocUrl && (
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">ID Document</h4>
                  <a href={user.verificationDocUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm">View Document</a>
                </div>
              </div>
            )}
          </div>

          {user.role === 'student' && user.preferences && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Roommate Preferences</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div><span className="text-gray-500 text-sm block">Looking for Roommate?</span> <span className="font-medium text-gray-900">{user.isLookingForRoommate ? 'Yes' : 'No'}</span></div>
                <div><span className="text-gray-500 text-sm block">Sleep Schedule</span> <span className="font-medium text-gray-900 capitalize">{user.preferences.sleepSchedule?.replace('_', ' ')}</span></div>
                <div><span className="text-gray-500 text-sm block">Food</span> <span className="font-medium text-gray-900 capitalize">{user.preferences.foodPreference?.replace('_', ' ')}</span></div>
                <div><span className="text-gray-500 text-sm block">Cleanliness</span> <span className="font-medium text-gray-900">{user.preferences.cleanliness}/5</span></div>
                <div><span className="text-gray-500 text-sm block">Smoking</span> <span className="font-medium text-gray-900">{user.preferences.smoking ? 'Yes' : 'No'}</span></div>
                <div><span className="text-gray-500 text-sm block">Budget</span> <span className="font-medium text-gray-900">₹{user.preferences.budget}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
