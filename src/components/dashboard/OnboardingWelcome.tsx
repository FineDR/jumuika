import React from 'react';
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../ui/Logo';

interface OnboardingWelcomeProps {
  onOpenRegisterModal: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onOpenRegisterModal }) => {
  const { t } = useTranslation();

  const steps = [
    {
      number: '1',
      title: t('onboarding_welcome.step1_title'),
      desc: t('onboarding_welcome.step1_desc')
    },
    {
      number: '2',
      title: t('onboarding_welcome.step2_title'),
      desc: t('onboarding_welcome.step2_desc')
    },
    {
      number: '3',
      title: t('onboarding_welcome.step3_title'),
      desc: t('onboarding_welcome.step3_desc')
    }
  ];

  return (
    <div className="max-w-[800px] mx-auto py-6 xs:py-10 sm:py-12 px-4 xs:px-6 sm:px-8 flex flex-col items-center gap-6 sm:gap-10 text-center animate-in fade-in duration-[800ms] ease-out">
      <div className="flex flex-col items-center text-center gap-4 sm:gap-6 mb-4 sm:mb-14">
        <div className="relative">
          <div className="absolute inset-0 bg-secondary/30 blur-2xl rounded-full scale-150"></div>
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-surface border border-secondary/30 shadow-2xl flex items-center justify-center">
            <LogoIcon className="w-10 h-10 sm:w-14 sm:h-14 drop-shadow-md" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl xs:text-3xl sm:text-5xl font-heading font-extrabold tracking-tight bg-gradient-to-br from-white to-secondary text-transparent bg-clip-text">
            {t('onboarding_welcome.title')}
          </h1>
          <p className="text-xs xs:text-sm sm:text-xl text-muted max-w-[600px] leading-relaxed mx-auto mt-2">
            {t('onboarding_welcome.subtitle')}
          </p>
        </div>
      </div>

      {/* Onboarding Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full my-4">
        {steps.map((step) => (
          <div 
            key={step.number}
            className="bg-surface/80 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left flex flex-col gap-2 sm:gap-3 backdrop-blur-xl relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(20,184,166,0.15)] hover:border-secondary/30"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center font-bold text-xs sm:text-sm font-heading shadow-inner">
              {step.number}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">{step.title}</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-5 justify-center w-full">
        <button 
          onClick={onOpenRegisterModal} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:px-8 sm:py-4 bg-secondary text-slate-900 font-bold rounded-xl text-sm sm:text-lg transition-all shadow-[0_8px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_10px_25px_rgba(20,184,166,0.4)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
        >
          <UserPlus className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" />
          <span>{t('onboarding_welcome.cta')}</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Trust Signpost */}
      <div className="flex items-center justify-center gap-2 text-[10px] xs:text-xs font-medium text-muted mt-2 sm:mt-4 bg-foreground/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-border/50">
        <CheckCircle2 size={14} className="text-secondary" />
        <span>{t('onboarding_welcome.trust')}</span>
      </div>
    </div>
  );
};
