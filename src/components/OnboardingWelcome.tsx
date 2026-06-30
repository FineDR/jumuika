import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { Receipt, UserPlus, Database, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingWelcomeProps {
  onOpenRegisterModal: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onOpenRegisterModal }) => {
  const { seedDemoData } = useJumuika();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
    } catch (err) {
      alert('Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  const steps = [
    {
      number: '1',
      title: 'Register Contributor',
      desc: 'Save contributor details once. The profile opens automatically for immediate scheduling.'
    },
    {
      number: '2',
      title: 'Schedule Contribution Plan',
      desc: 'Set up single targets or split them into installment schedules (daily, weekly, biweekly, monthly, custom).'
    },
    {
      number: '3',
      title: 'Record & Waterfall Payments',
      desc: 'Select due installments to pay off. Excess payments automatically cascade to reduce future scheduled balances.'
    }
  ];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2.5rem',
      textAlign: 'center',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* Visual Header */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 0 30px var(--mint-glow)',
        marginBottom: '1rem'
      }}>
        <Receipt size={40} style={{ color: 'var(--secondary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontFamily: 'Outfit',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ffffff 0%, var(--secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          Welcome to Jumuika
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          lineHeight: '1.6',
          margin: '0 auto'
        }}>
          The scheduled contribution engine. Track expected payments over time, cascade receipts, and monitor outstanding member ledgers automatically.
        </p>
      </div>

      {/* Onboarding Steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        margin: '1.5rem 0'
      }}>
        {steps.map((step) => (
          <div 
            key={step.number}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              backdropFilter: 'blur(12px)',
              position: 'relative'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--border-focus)',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              fontFamily: 'Outfit'
            }}>
              {step.number}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{step.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.25rem',
        justifyContent: 'center',
        width: '100%'
      }}>
        <button 
          onClick={onOpenRegisterModal} 
          className="btn btn-primary"
          style={{
            padding: '1rem 2rem',
            fontSize: '1.05rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <UserPlus size={20} />
          Register First Contributor
          <ArrowRight size={18} />
        </button>

        <button 
          onClick={handleSeed} 
          disabled={seeding}
          className="btn btn-secondary"
          style={{
            padding: '1rem 2rem',
            fontSize: '1.05rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Database size={20} />
          {seeding ? 'Seeding workspace...' : 'Seed Demo Workspace'}
        </button>
      </div>

      {/* Trust Signpost */}
      <div className="flex align-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <CheckCircle2 size={14} style={{ color: 'var(--secondary)' }} />
        <span>Strictly adheres to AI-EOS project and database design standards.</span>
      </div>
    </div>
  );
};
