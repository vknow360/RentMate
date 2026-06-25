import React from 'react';

const UserModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-glass-border sticky top-0 bg-bg-base/80 backdrop-blur-md z-10">
          <h2 className="text-2xl font-bold font-heading text-text-primary">User Profile</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-accent-rose transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-8">
            <img 
              src={user.profileImage || 'https://via.placeholder.com/100'} 
              alt={user.name} 
              className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-glass-border"
            />
            <div>
              <h3 className="text-2xl font-semibold font-heading text-text-primary">{user.name}</h3>
              <p className="text-text-secondary">{user.email}</p>
              <div className="mt-3 flex space-x-2">
                <span className="px-3 py-1 bg-bg-surface border border-glass-border text-text-primary text-xs font-medium rounded-full capitalize">{user.role}</span>
                {user.isSuspended && <span className="px-3 py-1 bg-error/10 border border-error/20 text-error text-xs font-medium rounded-full">Suspended</span>}
                {user.isVerified ? 
                  <span className="px-3 py-1 bg-success/10 border border-success/20 text-success text-xs font-medium rounded-full">Verified</span> : 
                  <span className="px-3 py-1 bg-warning/10 border border-warning/20 text-warning text-xs font-medium rounded-full">Unverified</span>
                }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-glass-border p-4 rounded-lg">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Phone</h4>
              <p className="text-text-primary font-medium">{user.phone || 'N/A'}</p>
            </div>
            {user.role === 'student' && (
              <div className="bg-bg-surface border border-glass-border p-4 rounded-lg">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">College</h4>
                <p className="text-text-primary font-medium">{user.college || 'N/A'}</p>
              </div>
            )}
            <div className="bg-bg-surface border border-glass-border p-4 rounded-lg">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Joined Date</h4>
              <p className="text-text-primary font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            {user.verificationDocUrl && (
              <div className="bg-bg-surface border border-glass-border p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">ID Document</h4>
                  <a href={user.verificationDocUrl} target="_blank" rel="noreferrer" className="text-accent-sky hover:underline text-sm font-medium">View Document</a>
                </div>
              </div>
            )}
          </div>

          {user.role === 'student' && user.preferences && (
            <div className="mt-8">
              <h3 className="text-lg font-bold font-heading text-text-primary mb-4 border-b border-glass-border pb-2">Roommate Preferences</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div><span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Looking for Roommate?</span> <span className="font-medium text-text-primary">{user.isLookingForRoommate ? 'Yes' : 'No'}</span></div>
                <div><span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Sleep Schedule</span> <span className="font-medium text-text-primary capitalize">{user.preferences.sleepSchedule?.replace('_', ' ') || 'N/A'}</span></div>
                <div><span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Food</span> <span className="font-medium text-text-primary capitalize">{user.preferences.foodPreference?.replace('_', ' ') || 'N/A'}</span></div>
                <div><span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Cleanliness</span> <span className="font-medium text-text-primary">{user.preferences.cleanliness || 'N/A'}/5</span></div>
                <div><span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Smoking</span> <span className="font-medium text-text-primary">{user.preferences.smoking ? 'Yes' : 'No'}</span></div>
                <div><span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Budget</span> <span className="font-medium text-text-primary">{user.preferences.budget ? `₹${user.preferences.budget}` : 'N/A'}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
