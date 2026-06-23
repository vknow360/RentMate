import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const res = await api.get('/notifications/unread-count');
          setUnreadCount(res.data.data.count);
        } catch (error) {
          console.error('Failed to fetch unread notifications count');
        }
      };

      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <a href="/" className="text-xl font-bold tracking-tight">RentMate</a>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'student' && (
                  <>
                    <a href="/properties" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">Properties</a>
                    <a href="/roommates" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">Find Roommates</a>
                    <a href="/expenses" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">Expenses</a>
                    <a href="/wishlist" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">Wishlist</a>
                  </>
                )}
                {user.role === 'owner' && (
                  <>
                    <a href="/manage-listings" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">My Listings</a>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <a href="/admin" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">Admin Dashboard</a>
                  </>
                )}
                <a href="/inquiries" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">Inquiries</a>
                <a href="/profile" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">Profile</a>
                
                {/* Notification Bell */}
                <a href="/notifications" className="relative p-2 text-white hover:bg-primary-700 rounded-full transition-colors flex items-center justify-center mx-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </a>

                <button 
                  onClick={handleLogout}
                  className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-md transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors">Login</a>
                <a href="/register" className="bg-white text-primary-600 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors font-medium">Register</a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
