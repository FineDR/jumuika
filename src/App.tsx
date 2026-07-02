import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JumuikaProvider, useJumuika } from './context/JumuikaContext';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ContributorList } from './components/contributors/ContributorList';
import { ContributorProfile } from './components/contributors/ContributorProfile';
import { ContributorRegisterModal } from './components/contributors/ContributorRegisterModal';
import { ScheduleModal } from './components/schedules/ScheduleModal';
import { BulkScheduleModal } from './components/schedules/BulkScheduleModal';
import { RotationManager } from './components/merrygoround/RotationManager';
import { PaymentModal } from './components/payments/PaymentModal';
import { PayoutModal } from './components/payments/PayoutModal';
import { CalendarView } from './components/calendar/CalendarView';
import { PaymentsLog } from './components/payments/PaymentsLog';
import { EventsModal } from './components/events/EventsModal';
import { OnboardingWelcome } from './components/dashboard/OnboardingWelcome';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Settings } from './components/settings/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted text-xl font-heading">
        Verifying authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { loading, contributors } = useJumuika();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedContributorId, setSelectedContributorId] = useState<string | null>(null);

  // Modals visibility states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBulkScheduleOpen, setIsBulkScheduleOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  
  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal context states
  const [payTargetScheduleId, setPayTargetScheduleId] = useState<string | null>(null);
  const [paymentModalContributorId, setPaymentModalContributorId] = useState<string | null>(null);
  const [payoutModalContributorId, setPayoutModalContributorId] = useState<string | null>(null);
  const [pendingSchedulePromptId, setPendingSchedulePromptId] = useState<string | null>(null);

  const handleOpenScheduleModal = (contribId: string) => {
    setSelectedContributorId(contribId);
    setIsScheduleOpen(true);
  };

  const handleOpenPaymentModal = (contribId: string | null, scheduleId: string | null = null) => {
    setPaymentModalContributorId(contribId);
    setPayTargetScheduleId(scheduleId);
    setIsPaymentOpen(true);
  };

  const handleOpenPayoutModal = (contribId: string | null) => {
    setPayoutModalContributorId(contribId);
    setIsPayoutOpen(true);
  };

  const handleSelectContributor = (id: string) => {
    setSelectedContributorId(id);
  };

  const handleRegisterSuccess = (newContributorId: string) => {
    setSelectedContributorId(newContributorId);
    setActiveTab('contributors');
    setPendingSchedulePromptId(newContributorId);
  };

  const handlePromptYes = () => {
    if (pendingSchedulePromptId) {
      handleOpenScheduleModal(pendingSchedulePromptId);
    }
    setPendingSchedulePromptId(null);
  };

  const handleSidebarTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedContributorId(null); // Clear active profile detail view
    setIsMobileMenuOpen(false); // Close drawer on mobile navigation
  };

  const renderActiveView = () => {
    if (selectedContributorId && activeTab === 'contributors') {
      return (
        <ContributorProfile
          contributorId={selectedContributorId}
          onBack={() => setSelectedContributorId(null)}
          onOpenScheduleModal={handleOpenScheduleModal}
          onOpenPaymentModal={handleOpenPaymentModal}
          onOpenPayoutModal={handleOpenPayoutModal}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            onSelectContributorId={(id) => {
              setSelectedContributorId(id);
              setActiveTab('contributors');
            }} 
            onOpenPaymentModal={() => handleOpenPaymentModal(null, null)}
            onOpenRegisterModal={() => setIsRegisterOpen(true)}
          />
        );
      case 'contributors':
        return (
          <ContributorList
            onSelectContributor={handleSelectContributor}
            onOpenRegisterModal={() => setIsRegisterOpen(true)}
            onOpenScheduleModal={handleOpenScheduleModal}
            onOpenPaymentModal={(id) => handleOpenPaymentModal(id, null)}
            onOpenPayoutModal={(id) => handleOpenPayoutModal(id)}
            onOpenBulkScheduleModal={() => setIsBulkScheduleOpen(true)}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            onSelectContributorId={(id) => {
              setSelectedContributorId(id);
              setActiveTab('contributors');
            }} 
          />
        );
      case 'payments':
        return <PaymentsLog />;
      case 'rotation':
        return (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">Rotation Order</h2>
              <p className="text-sm text-muted mt-1">Set the payout cycle for this Merry-Go-Round event</p>
            </div>
            <RotationManager
              isOpen={true}
              onClose={() => setActiveTab('contributors')}
              onOpenPayoutModal={(id) => handleOpenPayoutModal(id)}
              inlinePage={true}
            />
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            onSelectContributorId={(id) => {
              setSelectedContributorId(id);
              setActiveTab('contributors');
            }} 
            onOpenPaymentModal={() => handleOpenPaymentModal(null, null)}
            onOpenRegisterModal={() => setIsRegisterOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Sidebar 
        activeTab={selectedContributorId && activeTab === 'contributors' ? 'contributors' : activeTab} 
        setActiveTab={handleSidebarTabChange} 
        onOpenEventModal={() => setIsEventOpen(true)}
        onOpenPaymentModal={(id) => handleOpenPaymentModal(id, null)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Receipt icon badge */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/15 border border-secondary/25">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
                <path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/>
              </svg>
            </div>
            <h1 className="font-heading text-lg font-extrabold text-foreground tracking-wider">Jumuika</h1>
          </div>

          {/* Animated Hamburger / X Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5 hover:bg-secondary/10 border border-border hover:border-secondary/40 text-foreground hover:text-secondary transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {/* Animated bars → X */}
            <span className="absolute flex flex-col gap-[5px] w-[18px]">
              <span
                className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-background pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 md:p-8 lg:p-10">
        {loading ? (
          <div className="flex items-center justify-center h-[80vh] text-lg text-muted">
            Loading Jumuika data...
          </div>
        ) : contributors.length === 0 && activeTab === 'dashboard' ? (
          <OnboardingWelcome onOpenRegisterModal={() => setIsRegisterOpen(true)} />
        ) : (
          renderActiveView()
        )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
        <div className="flex items-stretch h-16">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
            )},
            { id: 'contributors', label: 'Members', icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            )},
            { id: 'calendar', label: 'Calendar', icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            )},
            { id: 'payments', label: 'Payments', icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            )},
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 relative ${
                  isActive ? 'text-secondary' : 'text-muted hover:text-foreground'
                }`}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-secondary" />
                )}
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-secondary' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      </div>


      <ContributorRegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSuccess={handleRegisterSuccess}
      />
      <ScheduleModal 
        isOpen={isScheduleOpen} 
        contributorId={selectedContributorId} 
        onClose={() => setIsScheduleOpen(false)} 
      />
      <BulkScheduleModal
        isOpen={isBulkScheduleOpen}
        onClose={() => setIsBulkScheduleOpen(false)}
      />
      <PaymentModal 
        isOpen={isPaymentOpen} 
        contributorId={paymentModalContributorId} 
        selectedScheduleId={payTargetScheduleId}
        onClose={() => setIsPaymentOpen(false)} 
      />
      <PayoutModal 
        isOpen={isPayoutOpen}
        contributorId={payoutModalContributorId}
        onClose={() => setIsPayoutOpen(false)}
      />
      <EventsModal 
        isOpen={isEventOpen} 
        onClose={() => setIsEventOpen(false)} 
      />

      {/* Post-registration "Set up schedule?" prompt */}
      {pendingSchedulePromptId && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-scale-in">
          <div className="flex items-center gap-3 px-4 py-3.5 bg-surface border border-secondary/40 rounded-2xl shadow-2xl shadow-secondary/10 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            </div>
            <p className="text-sm font-semibold text-foreground flex-1 leading-snug">
              Member added! Set up their contribution schedule now?
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPendingSchedulePromptId(null)}
                className="text-xs font-semibold text-muted hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-foreground/5 transition-all"
              >
                Skip
              </button>
              <button
                onClick={handlePromptYes}
                className="text-xs font-bold text-secondary-foreground bg-secondary hover:bg-secondary/90 px-3 py-1.5 rounded-lg transition-all"
              >
                Yes, Set Up →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'dark:bg-surface dark:text-foreground',
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-border)',
              }
            }} 
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <JumuikaProvider>
                    <AppContent />
                  </JumuikaProvider>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
