import { Link } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import GlassCard from '../components/GlassCard';

const Home = () => {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-100px)] flex items-center justify-center -mt-8 pt-8">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl mx-4 shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80" 
            alt="Modern apartment" 
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <AnimatedSection delay={100}>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6 leading-tight">
              Your Smart Home <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-sky via-accent-violet to-accent-rose">Away From Home</span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={300}>
            <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-2xl mx-auto font-light">
              Premium student accommodation, seamless roommate matching, and effortless expense sharing.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={500} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties" className="bg-accent-warm text-bg-base px-8 py-4 rounded-xl font-bold text-lg hover-lift shadow-[0_0_20px_rgba(212,165,116,0.4)] hover:bg-accent-warm-muted transition-colors">
              Explore Properties
            </Link>
            <Link to="/roommates" className="glass-card px-8 py-4 rounded-xl font-bold text-lg hover-lift hover:border-accent-warm transition-colors">
              Find Roommates
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Everything You Need</h2>
            <p className="text-text-secondary text-lg">Designed specifically for student living</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedSection delay={100} direction="up" className="h-full">
            <GlassCard tilt glow className="p-8 h-full flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-bg-surface rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-glass-border">
                <span className="text-3xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading">Verified Properties</h3>
              <p className="text-text-secondary">Browse curated PGs, hostels, and apartments near your college with honest reviews.</p>
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection delay={300} direction="up" className="h-full">
            <GlassCard tilt glow className="p-8 h-full flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-bg-surface rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-glass-border">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading">Smart Matching</h3>
              <p className="text-text-secondary">Our AI algorithm matches you with compatible roommates based on lifestyle and habits.</p>
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection delay={500} direction="up" className="h-full">
            <GlassCard tilt glow className="p-8 h-full flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-bg-surface rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-glass-border">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading">Expense Splitting</h3>
              <p className="text-text-secondary">Track shared bills and rent easily with built-in group expense management.</p>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">How It Works</h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-glass-border to-transparent -translate-y-1/2 z-0"></div>
          
          {[
            { step: '01', title: 'Create Profile', desc: 'Set your preferences and college' },
            { step: '02', title: 'Find Match', desc: 'Connect with ideal roommates' },
            { step: '03', title: 'Book Home', desc: 'Secure your perfect place' },
            { step: '04', title: 'Move In', desc: 'Manage living together' }
          ].map((item, i) => (
            <AnimatedSection key={i} delay={i * 200} className="relative z-10">
              <div className="bg-bg-base border border-glass-border rounded-xl p-6 text-center hover-lift hover:border-accent-warm transition-colors">
                <div className="text-accent-teal font-heading font-bold text-4xl mb-4 opacity-50">{item.step}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Popular Cities</h2>
            <p className="text-text-secondary text-lg">Find homes near top educational hubs</p>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Delhi', 'Mumbai', 'Bangalore', 'Pune'].map((city, i) => (
            <AnimatedSection key={city} delay={i * 100} className="h-full">
              <Link to={`/properties?city=${city}`} className="block h-full">
                <GlassCard tilt className="relative h-40 flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-accent-warm/20 group-hover:bg-accent-warm/40 transition-colors z-10"></div>
                  <h3 className="relative z-20 text-2xl font-bold font-heading text-white group-hover:scale-110 transition-transform">{city}</h3>
                </GlassCard>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Loved by Students</h2>
            <p className="text-text-secondary text-lg">Here's what our community says</p>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Rahul S.', role: 'Engineering Student', text: 'Found the perfect PG near my college within 2 days. The roommate matching feature is a lifesaver!' },
            { name: 'Priya M.', role: 'Medical Student', text: 'Splitting bills used to be a nightmare. RentMate makes it so easy to track who owes what.' },
            { name: 'Amit K.', role: 'Property Owner', text: 'Managing my listings and communicating with tenants is incredibly seamless on this platform.' }
          ].map((testimonial, i) => (
            <AnimatedSection key={i} delay={i * 200}>
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(star => <span key={star} className="text-accent-warm">★</span>)}
                </div>
                <p className="text-text-primary italic mb-6 flex-grow">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-accent-teal/20 flex items-center justify-center text-accent-teal font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{testimonial.name}</h4>
                    <p className="text-xs text-text-secondary">{testimonial.role}</p>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
          </div>
        </AnimatedSection>
        <div className="space-y-4">
          {[
            { q: 'Is RentMate free to use?', a: 'Yes! Students can browse properties, find roommates, and track expenses completely for free.' },
            { q: 'How does the roommate matching work?', a: 'We use the preferences you set in your profile (like sleep schedule, cleanliness, and diet) to calculate a compatibility score with other users.' },
            { q: 'Are the properties verified?', a: 'Properties with a green "Verified" badge have been physically or virtually inspected by our team to ensure authenticity.' }
          ].map((faq, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold font-heading text-text-primary mb-2">{faq.q}</h3>
                <p className="text-text-secondary">{faq.a}</p>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="mx-4 sm:mx-8">
          <div className="relative rounded-3xl overflow-hidden glass-card p-12 text-center border-accent-violet/20">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-sky/10 via-accent-violet/10 to-accent-rose/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">Ready to upgrade your student life?</h2>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">Join thousands of students finding their perfect homes and roommates on RentMate.</p>
              <Link to="/register" className="inline-block bg-accent-warm text-bg-base px-8 py-4 rounded-xl font-bold text-lg hover-lift shadow-lg hover:bg-accent-warm-muted transition-colors">
                Get Started for Free
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
};

export default Home;
