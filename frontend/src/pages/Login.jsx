import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AnimatedSection from '../components/AnimatedSection';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex -mt-8 pt-8">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=960&q=80" 
          alt="Cozy room" 
          className="absolute inset-0 w-full h-full object-cover rounded-r-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-base/80 to-transparent rounded-r-3xl"></div>
        <div className="absolute bottom-12 left-12 max-w-md">
          <AnimatedSection direction="right" delay={200}>
            <h2 className="text-4xl font-heading font-bold mb-4 text-text-primary">Welcome back to RentMate</h2>
            <p className="text-text-secondary text-lg">Your perfect home and ideal roommates are waiting for you.</p>
          </AnimatedSection>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <AnimatedSection direction="up" className="w-full max-w-md">
          <div className="glass-card p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2">Sign In</h1>
              <p className="text-text-secondary">Please enter your details to continue</p>
            </div>

            {error && (
              <AnimatedSection direction="up" delay={100}>
                <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-lg mb-6 shadow-sm">
                  {error}
                </div>
              </AnimatedSection>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1 group">
                <label className="text-sm font-medium text-text-secondary group-focus-within:text-accent-warm transition-colors">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-sky/50 focus:border-accent-sky transition-all outline-none text-text-primary placeholder-text-tertiary"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-sm font-medium text-text-secondary group-focus-within:text-accent-warm transition-colors">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-sky/50 focus:border-accent-sky transition-all outline-none text-text-primary placeholder-text-tertiary"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-sky text-bg-base py-3 px-4 rounded-lg font-bold hover:bg-opacity-90 transition-all duration-300 hover-lift disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-text-secondary">
                Don't have an account?{' '}
                <Link to="/register" className="text-accent-sky font-medium hover:text-opacity-80 transition-colors">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Login;
