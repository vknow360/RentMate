import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AnimatedSection from '../components/AnimatedSection';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-row-reverse -mt-8 pt-8">
      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=960&q=80" 
          alt="Students in common area" 
          className="absolute inset-0 w-full h-full object-cover rounded-l-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-bg-base/80 to-transparent rounded-l-3xl"></div>
        <div className="absolute bottom-12 right-12 max-w-md text-right">
          <AnimatedSection direction="left" delay={200}>
            <h2 className="text-4xl font-heading font-bold mb-4 text-text-primary">Join the Community</h2>
            <p className="text-text-secondary text-lg">Thousands of students and property owners are already here.</p>
          </AnimatedSection>
        </div>
      </div>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <AnimatedSection direction="up" className="w-full max-w-md">
          <div className="glass-card p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2">Create Account</h1>
              <p className="text-text-secondary">Join RentMate today</p>
            </div>

            {error && (
              <AnimatedSection direction="up" delay={100}>
                <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-lg mb-6 shadow-sm">
                  {error}
                </div>
              </AnimatedSection>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                  onClick={() => handleRoleSelect('student')}
                  className={`cursor-pointer border rounded-xl p-4 text-center transition-all duration-300 hover-lift ${
                    formData.role === 'student' 
                      ? 'border-accent-sky bg-accent-sky/10 shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                      : 'border-glass-border bg-bg-surface hover:border-text-secondary'
                  }`}
                >
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-bold text-text-primary">Student</div>
                </div>
                <div 
                  onClick={() => handleRoleSelect('owner')}
                  className={`cursor-pointer border rounded-xl p-4 text-center transition-all duration-300 hover-lift ${
                    formData.role === 'owner' 
                      ? 'border-accent-sky bg-accent-sky/10 shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                      : 'border-glass-border bg-bg-surface hover:border-text-secondary'
                  }`}
                >
                  <div className="text-2xl mb-2">🔑</div>
                  <div className="font-bold text-text-primary">Owner</div>
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-sm font-medium text-text-secondary group-focus-within:text-accent-sky transition-colors">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-sky/50 focus:border-accent-sky transition-all outline-none text-text-primary placeholder-text-tertiary"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-sm font-medium text-text-secondary group-focus-within:text-accent-sky transition-colors">
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
                <label className="text-sm font-medium text-text-secondary group-focus-within:text-accent-sky transition-colors">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  className="w-full px-4 py-3 bg-bg-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-sky/50 focus:border-accent-sky transition-all outline-none text-text-primary placeholder-text-tertiary"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-sky text-bg-base py-3 px-4 rounded-lg font-bold hover:bg-opacity-90 transition-all duration-300 hover-lift disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-accent-sky font-medium hover:text-opacity-80 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Register;
