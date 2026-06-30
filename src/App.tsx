import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JumuikaProvider, useJumuika } from './context/JumuikaContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ContributorList } from './components/ContributorList';
import { ContributorProfile } from './components/ContributorProfile';
import { ContributorRegisterModal } from './components/ContributorRegisterModal';
import { ScheduleModal } from './components/ScheduleModal';
import { PaymentModal } from './components/PaymentModal';
import { CalendarView } from './components/CalendarView';
import { PaymentsLog } from './components/PaymentsLog';
import { EventsModal } from './components/EventsModal';
import { OnboardingWelcome } from './components/OnboardingWelcome';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--text-muted)',
        fontSize: '1.25rem',
        fontFamily: 'Outfit, sans-serif'
      }}>
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
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);

  // Modal context states
  const [payTargetScheduleId, setPayTargetScheduleId] = useState<string | null>(null);

  const handleOpenScheduleModal = (contribId: string) => {
    setSelectedContributorId(contribId);
    setIsScheduleOpen(true);
  };

  const handleOpenPaymentModal = (contribId: string, scheduleId: string | null = null) => {
    setSelectedContributorId(contribId);
    setPayTargetScheduleId(scheduleId);
    setIsPaymentOpen(true);
  };

  const handleSelectContributor = (id: string) => {
    setSelectedContributorId(id);
  };

  const handleRegisterSuccess = (newContributorId: string) => {
    setSelectedContributorId(newContributorId);
    setActiveTab('contributors');
  };

  const handleSidebarTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedContributorId(null); // Clear active profile detail view
  };

  const renderActiveView = () => {
    if (selectedContributorId && activeTab === 'contributors') {
      return (
        <ContributorProfile
          contributorId={selectedContributorId}
          onBack={() => setSelectedContributorId(null)}
          onOpenScheduleModal={handleOpenScheduleModal}
          onOpenPaymentModal={handleOpenPaymentModal}
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
          />
        );
      case 'contributors':
        return (
          <ContributorList
            onSelectContributor={handleSelectContributor}
            onOpenRegisterModal={() => setIsRegisterOpen(true)}
            onOpenScheduleModal={handleOpenScheduleModal}
            onOpenPaymentModal={(id) => handleOpenPaymentModal(id, null)}
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
      default:
        return (
          <Dashboard 
            onSelectContributorId={(id) => {
              setSelectedContributorId(id);
              setActiveTab('contributors');
            }} 
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={selectedContributorId && activeTab === 'contributors' ? 'contributors' : activeTab} 
        setActiveTab={handleSidebarTabChange} 
        onOpenEventModal={() => setIsEventOpen(true)}
      />

      <main className="main-content">
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            fontSize: '1.2rem',
            color: 'var(--text-muted)'
          }}>
            Loading Jumuika data...
          </div>
        ) : contributors.length === 0 && activeTab === 'dashboard' ? (
          <OnboardingWelcome onOpenRegisterModal={() => setIsRegisterOpen(true)} />
        ) : (
          renderActiveView()
        )}
      </main>

      {/* Register Contributor Modal */}
      <ContributorRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      {/* Schedule Contributions Modal */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        contributorId={selectedContributorId}
        onClose={() => setIsScheduleOpen(false)}
      />

      {/* Record Payments Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        contributorId={selectedContributorId}
        selectedScheduleId={payTargetScheduleId}
        onClose={() => setIsPaymentOpen(false)}
      />

      {/* Create Event Modal */}
      <EventsModal
        isOpen={isEventOpen}
        onClose={() => setIsEventOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
  );
}

export default App;
