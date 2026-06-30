import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Receipt, 
  ArrowRight, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Users,
  TrendingUp
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, allow launching app straight to dashboard
  const handleLaunch = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: <Users size={28} className="text-secondary" style={{ color: 'var(--secondary)' }} />,
      title: 'Contributor Registry',
      description: 'Manage profiles, contacts, and personal contribution ledgers in a single consolidated workspace.'
    },
    {
      icon: <Calendar size={28} className="text-secondary" style={{ color: 'var(--secondary)' }} />,
      title: 'Structured Schedules',
      description: 'Split contribution targets into custom installment calendars (daily, weekly, monthly) automatically.'
    },
    {
      icon: <Layers size={28} className="text-secondary" style={{ color: 'var(--secondary)' }} />,
      title: 'Waterfall Payments',
      description: 'Record payments that automatically waterfall down outstanding dues, cascading to upcoming target schedules.'
    },
    {
      icon: <TrendingUp size={28} className="text-secondary" style={{ color: 'var(--secondary)' }} />,
      title: 'Insightful Logs',
      description: 'Track receipt timelines, remaining balances, and calendar milestones with granular auditing dashboards.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f1c2e 0%, var(--bg-dark) 100%)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      {/* Navbar */}
      <header style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(5, 11, 20, 0.75)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)'
          }}>
            <Receipt size={22} style={{ color: 'var(--secondary)' }} />
          </div>
          <span style={{
            fontFamily: 'Outfit',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--secondary)',
            letterSpacing: '0.05em',
            textShadow: '0 0 10px var(--mint-glow)'
          }}>JUMUIKA</span>
        </div>

        <div>
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/auth" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
                Sign In
              </Link>
              <button onClick={() => navigate('/auth')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flexGrow: 1, padding: '4rem 2rem 6rem' }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '30px',
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem',
            color: 'var(--secondary)',
            fontWeight: 600
          }}>
            <ShieldCheck size={16} />
            Secure Multi-User Contribution Engine
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '3.8rem',
            fontFamily: 'Outfit',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 0%, var(--secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '850px'
          }}>
            Coordinate Scheduled Contribution Targets Effortlessly
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '650px',
            margin: '0 auto'
          }}>
            Track expected payments over time, configure custom target installment plans, cascade transaction cashflows, and run detailed audit reports.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            <button onClick={handleLaunch} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              {user ? 'Launch Dashboard' : 'Get Started Now'}
              <ArrowRight size={20} />
            </button>
            {!user && (
              <button 
                onClick={() => {
                  const el = document.getElementById('features-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="btn" 
                style={{ 
                  padding: '1rem 2.5rem', 
                  fontSize: '1.1rem',
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'var(--text-main)'
                }}
              >
                Explore Features
              </button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <section id="features-section" style={{
          maxWidth: '1100px',
          margin: '7rem auto 0',
          paddingTop: '4rem',
          borderTop: '1px solid var(--border)'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.2rem',
            fontFamily: 'Outfit',
            fontWeight: 700,
            marginBottom: '4rem',
            color: 'var(--text-main)'
          }}>
            Engineered for Modern Contribution Logistics
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, i) => (
              <div 
                key={i} 
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'var(--transition)',
                  backdropFilter: 'blur(8px)',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'var(--secondary)';
                  e.currentTarget.style.boxShadow = '0 10px 30px var(--mint-glow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'rgba(173, 239, 209, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'rgba(5, 11, 20, 0.95)',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--secondary)' }} />
            <span>Strictly adheres to AI-EOS engineering and security standards.</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Jumuika Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
