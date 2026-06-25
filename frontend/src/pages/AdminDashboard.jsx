import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserModal from '../components/admin/UserModal';
import PropertyModal from '../components/admin/PropertyModal';
import AnimatedSection from '../components/AnimatedSection';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalProperties: 0, totalInquiries: 0 });
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, properties, inquiries, reviews
  const [loading, setLoading] = useState(true);

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, propsRes, inqRes, revRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/properties'),
          api.get('/admin/inquiries'),
          api.get('/admin/reviews')
        ]);
        
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
        setProperties(propsRes.data.data);
        setInquiries(inqRes.data.data);
        setReviews(revRes.data.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, navigate]);

  // User Actions
  const toggleUserVerification = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/verify`);
      setUsers(users.map(u => u._id === id ? res.data.data : u));
    } catch (error) { alert('Failed to verify user'); }
  };

  const toggleUserSuspension = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/suspend`);
      setUsers(users.map(u => u._id === id ? res.data.data : u));
    } catch (error) { alert('Failed to suspend user'); }
  };

  const changeUserRole = async (id, newRole) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === id ? res.data.data : u));
    } catch (error) { alert('Failed to change role'); }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
      } catch (error) { alert('Failed to delete user'); }
    }
  };

  // Property Actions
  const togglePropertyVerification = async (id) => {
    try {
      const res = await api.put(`/admin/properties/${id}/verify`);
      setProperties(properties.map(p => p._id === id ? res.data.data : p));
    } catch (error) { alert('Failed to verify property'); }
  };

  const deleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this property?')) {
      try {
        await api.delete(`/admin/properties/${id}`);
        setProperties(properties.filter(p => p._id !== id));
        setStats({ ...stats, totalProperties: stats.totalProperties - 1 });
      } catch (error) { alert('Failed to delete property'); }
    }
  };

  // Review Actions
  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/admin/reviews/${id}`);
        setReviews(reviews.filter(r => r._id !== id));
      } catch (error) { alert('Failed to delete review'); }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)]">
      <div className="w-16 h-16 border-4 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Filtered data
  const filteredUsers = users.filter(u => (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase()));
  const filteredProperties = properties.filter(p => (p.title || '').toLowerCase().includes(propSearch.toLowerCase()) || (p.city || '').toLowerCase().includes(propSearch.toLowerCase()));

  // SVG Icons
  const IconOverview = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
  const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
  const IconProps = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
  const IconInquiries = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>;
  const IconReviews = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-bg-surface border-r border-glass-border flex flex-col shadow-lg z-20">
        <div className="p-6">
          <h2 className="text-xl font-heading font-bold text-text-primary tracking-wider uppercase text-accent-warm">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-accent-warm text-bg-base shadow-[0_0_15px_rgba(212,165,116,0.3)]' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <IconOverview /> <span className="ml-3">Overview</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'users' ? 'bg-accent-warm text-bg-base shadow-[0_0_15px_rgba(212,165,116,0.3)]' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <IconUsers /> <span className="ml-3">Manage Users</span>
          </button>
          <button onClick={() => setActiveTab('properties')} className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'properties' ? 'bg-accent-warm text-bg-base shadow-[0_0_15px_rgba(212,165,116,0.3)]' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <IconProps /> <span className="ml-3">Properties</span>
          </button>
          <button onClick={() => setActiveTab('inquiries')} className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'inquiries' ? 'bg-accent-warm text-bg-base shadow-[0_0_15px_rgba(212,165,116,0.3)]' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <IconInquiries /> <span className="ml-3">Inquiries</span>
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'reviews' ? 'bg-accent-warm text-bg-base shadow-[0_0_15px_rgba(212,165,116,0.3)]' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <IconReviews /> <span className="ml-3">Reviews</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg-base">
        {/* Top Header */}
        <header className="bg-bg-surface/80 backdrop-blur-md shadow-sm border-b border-glass-border z-10 px-8 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-heading text-text-primary capitalize tracking-wider">{activeTab.replace('-', ' ')}</h1>
          <div className="text-sm text-text-secondary">Logged in as <span className="font-bold text-accent-warm">{user.name}</span></div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <AnimatedSection>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center gap-5 hover-lift border-t-4 border-t-accent-violet">
                  <div className="p-4 bg-accent-violet/20 text-accent-violet rounded-xl shadow-inner border border-accent-violet/30"><IconUsers /></div>
                  <div><h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-1">Total Users</h3><p className="text-4xl font-bold font-heading text-text-primary">{stats.totalUsers}</p></div>
                </div>
                <div className="glass-card p-6 flex items-center gap-5 hover-lift border-t-4 border-t-accent-sky">
                  <div className="p-4 bg-accent-sky/20 text-accent-sky rounded-xl shadow-inner border border-accent-sky/30"><IconProps /></div>
                  <div><h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-1">Total Properties</h3><p className="text-4xl font-bold font-heading text-text-primary">{stats.totalProperties}</p></div>
                </div>
                <div className="glass-card p-6 flex items-center gap-5 hover-lift border-t-4 border-t-accent-rose">
                  <div className="p-4 bg-accent-rose/20 text-accent-rose rounded-xl shadow-inner border border-accent-rose/30"><IconInquiries /></div>
                  <div><h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-1">Total Inquiries</h3><p className="text-4xl font-bold font-heading text-text-primary">{stats.totalInquiries}</p></div>
                </div>
              </div>
            )}
          </AnimatedSection>

          {activeTab === 'users' && (
              <div className="glass-card overflow-hidden flex flex-col">
                <div className="p-5 border-b border-glass-border flex justify-between items-center bg-bg-surface">
                  <div className="relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="pl-10 pr-4 py-2 bg-bg-base border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-warm outline-none w-72 text-sm text-text-primary"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-glass-border">
                    <thead className="bg-bg-surface/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                          <tr key={u._id} className="hover:bg-bg-surface/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full object-cover border border-glass-border" src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random`} alt="" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-text-primary">{u.name}</div>
                                  <div className="text-sm text-text-tertiary">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select 
                                value={u.role} 
                                onChange={(e) => changeUserRole(u._id, e.target.value)}
                                className="text-sm border border-glass-border bg-bg-surface text-text-primary rounded-md px-3 py-1.5 focus:ring-2 focus:ring-accent-warm outline-none"
                              >
                                <option value="student" className="bg-bg-surface text-text-primary">Student</option>
                                <option value="owner" className="bg-bg-surface text-text-primary">Owner</option>
                                <option value="admin" className="bg-bg-surface text-text-primary">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1.5">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-sm w-fit uppercase tracking-wider border ${u.isVerified ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}`}>
                                  {u.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                                {u.isSuspended && (
                                  <span className="px-2.5 py-0.5 inline-flex text-xs font-bold rounded-sm w-fit uppercase tracking-wider bg-error/10 text-error border border-error/30">
                                    Suspended
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                              <div className="flex justify-end gap-3">
                                <button onClick={() => setSelectedUser(u)} className="text-accent-teal hover:text-text-primary transition-colors hover:underline">View</button>
                                <button onClick={() => toggleUserVerification(u._id)} className="text-success hover:text-text-primary transition-colors hover:underline">Verify</button>
                                <button onClick={() => toggleUserSuspension(u._id)} className="text-warning hover:text-text-primary transition-colors hover:underline">{u.isSuspended ? 'Unsuspend' : 'Suspend'}</button>
                                <button onClick={() => deleteUser(u._id)} className="text-error hover:text-text-primary transition-colors hover:underline">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center text-2xl mb-4 border border-glass-border">👥</div>
                              <p className="text-text-primary font-bold text-lg">No users found</p>
                              <p className="text-text-secondary text-sm mt-1">There are no matching users to display.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          )}

          {activeTab === 'properties' && (
              <div className="glass-card overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-glass-border flex justify-between items-center bg-bg-surface">
                  <div className="relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                      type="text" 
                      placeholder="Search properties..." 
                      className="pl-10 pr-4 py-2 bg-bg-base border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-warm outline-none w-72 text-sm text-text-primary"
                      value={propSearch}
                      onChange={e => setPropSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-glass-border">
                    <thead className="bg-bg-surface/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Property</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {filteredProperties.map(p => (
                        <tr key={p._id} className="hover:bg-bg-surface/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-text-primary mb-1">{p.title}</div>
                            <div className="text-xs text-text-tertiary">{p.city} - <span className="uppercase">{p.propertyType}</span></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-medium">
                            {p.ownerId?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-sm uppercase tracking-wider border ${p.isVerified ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}`}>
                              {p.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold space-x-4">
                            <button onClick={() => setSelectedProperty(p)} className="text-accent-teal hover:text-text-primary transition-colors hover:underline">View</button>
                            <button onClick={() => togglePropertyVerification(p._id)} className="text-success hover:text-text-primary transition-colors hover:underline">Verify</button>
                            <button onClick={() => deleteProperty(p._id)} className="text-error hover:text-text-primary transition-colors hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          )}

          {activeTab === 'inquiries' && (
              <div className="glass-card overflow-hidden">
                <table className="min-w-full divide-y divide-glass-border">
                  <thead className="bg-bg-surface/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Property</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border">
                    {inquiries.map(inq => (
                      <tr key={inq._id} className="hover:bg-bg-surface/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-text-primary">{inq.propertyId?.title || 'Deleted Property'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary font-medium">{inq.studentId?.name || 'Deleted User'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-sm uppercase tracking-wider border ${inq.status === 'pending' ? 'bg-warning/10 text-warning border-warning/30' : inq.status === 'responded' ? 'bg-success/10 text-success border-success/30' : 'bg-bg-surface text-text-secondary border-glass-border'}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-tertiary">{new Date(inq.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )}

          {activeTab === 'reviews' && (
              <div className="glass-card overflow-hidden">
                <table className="min-w-full divide-y divide-glass-border">
                  <thead className="bg-bg-surface/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Property</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border">
                    {reviews.map(rev => (
                      <tr key={rev._id} className="hover:bg-bg-surface/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-text-primary">{rev.propertyId?.title || 'Deleted Property'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary font-medium">{rev.studentId?.name || 'Deleted User'}</td>
                        <td className="px-6 py-4 text-sm text-accent-warm font-bold flex items-center gap-1">★ {rev.rating}<span className="text-text-tertiary">/5</span></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteReview(rev._id)} className="text-error hover:text-text-primary text-sm font-bold transition-colors hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )}

        </main>
      </div>

      {/* Modals */}
      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  );
};

export default AdminDashboard;
