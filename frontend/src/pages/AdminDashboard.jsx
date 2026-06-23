import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserModal from '../components/admin/UserModal';
import PropertyModal from '../components/admin/PropertyModal';

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

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;

  // Filtered data
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredProperties = properties.filter(p => p.title.toLowerCase().includes(propSearch.toLowerCase()) || p.city.toLowerCase().includes(propSearch.toLowerCase()));

  // SVG Icons
  const IconOverview = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
  const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
  const IconProps = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
  const IconInquiries = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>;
  const IconReviews = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <IconOverview /> <span className="ml-3">Overview</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'users' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <IconUsers /> <span className="ml-3">Manage Users</span>
          </button>
          <button onClick={() => setActiveTab('properties')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'properties' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <IconProps /> <span className="ml-3">Properties</span>
          </button>
          <button onClick={() => setActiveTab('inquiries')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'inquiries' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <IconInquiries /> <span className="ml-3">Inquiries</span>
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'reviews' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <IconReviews /> <span className="ml-3">Reviews</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="text-sm text-gray-500">Logged in as <span className="font-semibold text-gray-900">{user.name}</span></div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><IconUsers /></div>
                <div><h3 className="text-gray-500 text-sm font-medium">Total Users</h3><p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><IconProps /></div>
                <div><h3 className="text-gray-500 text-sm font-medium">Total Properties</h3><p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><IconInquiries /></div>
                <div><h3 className="text-gray-500 text-sm font-medium">Total Inquiries</h3><p className="text-3xl font-bold text-gray-900">{stats.totalInquiries}</p></div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-64"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={u.profileImage || 'https://via.placeholder.com/40'} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{u.name}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select 
                            value={u.role} 
                            onChange={(e) => changeUserRole(u._id, e.target.value)}
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="student">Student</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {u.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                            {u.isSuspended && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 w-fit">
                                Suspended
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setSelectedUser(u)} className="text-blue-600 hover:text-blue-900">View</button>
                            <button onClick={() => toggleUserVerification(u._id)} className="text-green-600 hover:text-green-900">Verify</button>
                            <button onClick={() => toggleUserSuspension(u._id)} className="text-orange-600 hover:text-orange-900">{u.isSuspended ? 'Unsuspend' : 'Suspend'}</button>
                            <button onClick={() => deleteUser(u._id)} className="text-red-600 hover:text-red-900">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <input 
                  type="text" 
                  placeholder="Search properties..." 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-64"
                  value={propSearch}
                  onChange={e => setPropSearch(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{p.title}</div>
                          <div className="text-sm text-gray-500">{p.city} - {p.propertyType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.ownerId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {p.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button onClick={() => setSelectedProperty(p)} className="text-blue-600 hover:text-blue-900">View</button>
                          <button onClick={() => togglePropertyVerification(p._id)} className="text-green-600 hover:text-green-900">Verify</button>
                          <button onClick={() => deleteProperty(p._id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.map(inq => (
                    <tr key={inq._id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{inq.propertyId?.title || 'Deleted Property'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{inq.studentId?.name || 'Deleted User'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${inq.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : inq.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(inq.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map(rev => (
                    <tr key={rev._id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{rev.propertyId?.title || 'Deleted Property'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{rev.studentId?.name || 'Deleted User'}</td>
                      <td className="px-6 py-4 text-sm text-yellow-500 font-bold">★ {rev.rating}/5</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteReview(rev._id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
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
