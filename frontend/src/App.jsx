import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PropertySearch from './pages/PropertySearch';
import PropertyDetail from './pages/PropertyDetail';
import ManageListings from './pages/ManageListings';
import ListingForm from './pages/ListingForm';
import Wishlist from './pages/Wishlist';
import Inquiries from './pages/Inquiries';
import Roommates from './pages/Roommates';
import Expenses from './pages/Expenses';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties" element={<PropertySearch />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/roommates" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Roommates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/expenses" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Expenses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wishlist" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Wishlist />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inquiries" 
                element={
                  <ProtectedRoute>
                    <Inquiries />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manage-listings" 
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <ManageListings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties/new" 
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <ListingForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties/:id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <ListingForm />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
