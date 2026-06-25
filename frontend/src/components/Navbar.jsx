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
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, children }) => (
    <Link 
      to={to} 
      className="text-text-primary hover:text-accent-warm px-3 py-2 rounded-md transition-all duration-300 hover-lift inline-block"
    >
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-heading font-bold tracking-tight text-text-primary hover-lift">
            Rent<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-sky to-accent-violet">Mate</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <div className="hidden md:flex gap-2 items-center">
                  {user.role === 'student' && (
                    <>
                      <NavLink to="/properties">Properties</NavLink>
                      <NavLink to="/roommates">Find Roommates</NavLink>
                      <NavLink to="/expenses">Expenses</NavLink>
                      <NavLink to="/wishlist">Wishlist</NavLink>
                    </>
                  )}
                  {user.role === 'owner' && (
                    <NavLink to="/manage-listings">My Listings</NavLink>
                  )}
                  {user.role === 'admin' && (
                    <NavLink to="/admin">Admin Dashboard</NavLink>
                  )}
                  <NavLink to="/inquiries">Inquiries</NavLink>
                  <NavLink to="/profile">Profile</NavLink>
                </div>
                
                {/* Notification Bell */}
                <Link to="/notifications" className={`relative p-2 rounded-full transition-all duration-300 hover-lift mx-2 text-text-primary hover:text-accent-warm ${unreadCount > 0 ? 'animate-glow' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-bg-base bg-accent-warm rounded-full transform translate-x-1/4 -translate-y-1/4">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <button 
                  onClick={handleLogout}
                  className="bg-bg-surface border border-glass-border hover:bg-accent-warm hover:text-bg-base text-text-primary px-4 py-2 rounded-md transition-all duration-300 hover-lift font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text-primary hover:text-accent-warm px-3 py-2 rounded-md transition-all duration-300 hover-lift">Login</Link>
                <Link to="/register" className="bg-accent-sky text-bg-base hover:bg-opacity-90 px-4 py-2 rounded-md transition-all duration-300 hover-lift font-medium shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
