import React from 'react';
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LogoIcon } from '../ui/Logo';

interface OnboardingWelcomeProps {
  onOpenRegisterModal: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onOpenRegisterModal }) => {
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
    <div className="max-w-[800px] mx-auto py-12 px-8 flex flex-col items-center gap-10 text-center animate-in fade-in duration-[800ms] ease-out">
      <div className="flex flex-col items-center text-center gap-6 mb-10 sm:mb-14">
        <div className="relative">
          <div className="absolute inset-0 bg-secondary/30 blur-2xl rounded-full scale-150"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-surface border border-secondary/30 shadow-2xl flex items-center justify-center">
            <LogoIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight bg-gradient-to-br from-white to-secondary text-transparent bg-clip-text">
            Welcome to Jumuika
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-[600px] leading-relaxed mx-auto mt-2">
            The scheduled contribution engine. Track expected payments over time, cascade receipts, and monitor outstanding member ledgers automatically.
          </p>
        </div>
      </div>

      {/* Onboarding Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full my-6">
        {steps.map((step) => (
          <div 
            key={step.number}
            className="bg-surface/80 border border-border rounded-2xl p-6 text-left flex flex-col gap-3 backdrop-blur-xl relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(20,184,166,0.15)] hover:border-secondary/30"
          >
            <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center font-bold text-sm font-heading shadow-inner">
              {step.number}
            </div>
            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-5 justify-center w-full">
        <button 
          onClick={onOpenRegisterModal} 
          className="flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-slate-900 font-bold rounded-xl text-lg transition-all shadow-[0_8px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_10px_25px_rgba(20,184,166,0.4)] hover:-translate-y-1 active:scale-[0.98]"
        >
          <UserPlus size={22} />
          Register First Contributor
          <ArrowRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Trust Signpost */}
      <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted mt-4 bg-foreground/5 px-4 py-2 rounded-full border border-border/50">
        <CheckCircle2 size={14} className="text-secondary" />
        <span>Strictly adheres to AI-EOS project and database design standards.</span>
      </div>
    </div>
  );
};
