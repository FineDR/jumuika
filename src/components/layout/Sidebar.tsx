import React, { useState } from 'react';
import { useLocoo } from '../../context/LocooContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Calendar, Receipt, Plus, ChevronDown, LogOut, Sun, Moon, Globe, Settings as SettingsIcon, RefreshCw, Landmark } from 'lucide-react';
import { LogoIcon } from '../ui/Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenEventModal: () => void;
  onOpenPaymentModal: (contribId: string | null) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenEventModal,
  onOpenPaymentModal,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { events, currentEventId, setCurrentEventId, contributors } = useLocoo();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState('');

  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const currentEvent = events.find(e => e.id === currentEventId);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'contributors', label: t('contributors', 'Contributors'), icon: Users },
    ...(currentEvent?.eventType === 'merry-go-round'
      ? [{ id: 'rotation', label: t('rotation', 'Rotation'), icon: RefreshCw }]
      : []),
    ...(currentEvent?.eventType === 'table-banking'
      ? [{ id: 'loans', label: t('table_banking.loan_book', 'Loan Book'), icon: Landmark }]
      : []),
    { id: 'calendar', label: t('calendar', 'Calendar View'), icon: Calendar },
    { id: 'payments', label: t('payments', 'Payments Log'), icon: Receipt },
    { id: 'settings', label: t('settings', 'Settings'), icon: SettingsIcon },
  ];

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(eventSearch.toLowerCase())
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-overlay z-40 lg:hidden transition-opacity duration-300" 
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[280px] xs:w-[280px] bg-surface border-r border-border p-4 xs:p-6 sm:p-8 flex flex-col gap-4 xs:gap-6 sm:gap-8 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none lg:shrink-0 lg:h-screen lg:top-0 overflow-y-auto ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
      <div className="flex items-center gap-3 shrink-0">
        <LogoIcon className="w-8 h-8" />
        <h1 className="font-heading text-xl xs:text-2xl font-extrabold text-secondary uppercase tracking-wider drop-shadow-sm">
          Locoo
        </h1>
      </div>


      <div className="mt-2 relative shrink-0">
        <span className="text-[10px] xs:text-xs uppercase text-muted tracking-widest font-semibold mb-2 block">{t('active_event', 'Active Event')}</span>
        <button
          className="w-full p-2.5 xs:p-3 bg-foreground/5 hover:bg-secondary/10 border border-border hover:border-secondary rounded-md text-foreground font-semibold text-xs xs:text-sm flex items-center justify-between cursor-pointer transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="flex flex-col items-start gap-0.5 min-w-0 pr-2">
            <span className="truncate w-full block text-left text-xs xs:text-sm font-semibold">{currentEvent ? currentEvent.name : t('settings_page.no_active_event', 'Select Event')}</span>
            {currentEvent && (
              <span className={`text-[8px] xs:text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full ${
                currentEvent.eventType === 'merry-go-round' ? 'bg-violet-500/15 text-violet-400'
                : currentEvent.eventType === 'table-banking' ? 'bg-sky-500/15 text-sky-400'
                : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                {currentEvent.eventType === 'merry-go-round' ? t('events_modal.merry_go_round', 'Merry-Go-Round')
                  : currentEvent.eventType === 'table-banking' ? t('table_banking.title', 'Table Banking')
                  : t('events_modal.harambee', 'Harambee')}
              </span>
            )}
          </span>
          <ChevronDown size={16} className={`transition-transform duration-normal shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 bg-surface border border-border rounded-md mt-1 z-30 shadow-lg p-2 flex flex-col gap-2 max-h-60 overflow-y-auto overflow-x-hidden animate-drop-in">
            <input
              type="text"
              placeholder={`${t('search', 'Search')}...`}
              className="w-full p-2 bg-background border border-border rounded text-[11px] xs:text-xs text-foreground focus:outline-none focus:border-secondary"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-col max-h-40 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="text-[11px] xs:text-xs text-muted p-2">{t('common.no_events', 'No events found')}</div>
              ) : (
                filteredEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setCurrentEventId(e.id);
                      setDropdownOpen(false);
                      setEventSearch('');
                    }}
                    className={`w-full p-2 text-left text-[11px] xs:text-xs cursor-pointer flex items-center min-w-0 transition-colors duration-fast rounded-lg ${e.id === currentEventId ? 'bg-secondary/10 text-secondary font-semibold' : 'text-foreground hover:bg-foreground/5'}`}
                  >
                    <span className="flex items-center justify-between gap-1.5 font-sans w-full min-w-0">
                      <span className="truncate font-semibold text-[10px] xs:text-[11px] pr-1.5 w-full block text-left">{e.name}</span>
                      <span className={`text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        e.eventType === 'merry-go-round' ? 'bg-violet-500/15 text-violet-400'
                        : e.eventType === 'table-banking' ? 'bg-sky-500/15 text-sky-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {e.eventType === 'merry-go-round' ? 'MGR' : e.eventType === 'table-banking' ? 'TB' : 'H'}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => {
                onOpenEventModal();
                setDropdownOpen(false);
                setEventSearch('');
              }}
              className="w-full p-2 bg-secondary/5 hover:bg-secondary/10 border-t border-border text-left text-secondary text-[11px] xs:text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Plus size={14} />
              {t('create_new_event', 'Create New Event')}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => onOpenPaymentModal(null)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 xs:px-4 xs:py-3 bg-secondary text-surface hover:bg-secondary/95 hover:-translate-y-0.5 border border-transparent rounded-lg font-bold text-xs xs:text-sm tracking-wide shadow-[0_4px_10px_rgba(20,184,166,0.2)] hover:shadow-[0_4px_15px_rgba(20,184,166,0.3)] transition-all duration-fast shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary active:scale-[0.98]"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>{t('quick_record')}</span>
      </button>

      <nav className="flex-grow mt-2 xs:mt-4">
        <ul className="flex flex-col gap-1.5 xs:gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 xs:gap-4 px-3 py-2 xs:px-4 xs:py-2.5 sm:px-5 sm:py-3 rounded-md font-medium text-xs xs:text-sm lg:text-[0.95rem] transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] ${isActive ? 'bg-secondary text-surface font-semibold shadow-[0_4px_15px_rgba(20,184,166,0.3)]' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Preferences Panel */}
      <div className="flex flex-col gap-2 mt-auto mb-2 xs:mb-4 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'sw' : 'en')}
            className="flex-1 flex items-center justify-center gap-2 p-2 xs:p-2.5 bg-surface border border-border rounded-md text-foreground cursor-pointer transition-colors duration-fast hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
            title="Toggle Language"
          >
            <Globe size={16} className="shrink-0" />
            <span className="text-[10px] xs:text-xs font-semibold">{i18n.language === 'en' ? 'SW' : 'EN'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center p-2 xs:p-2.5 bg-surface border border-border rounded-md text-foreground cursor-pointer transition-colors duration-fast hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          </button>
        </div>
      </div>

      {/* User Session & Logout Panel */}
      <div className="flex flex-col gap-2.5 xs:gap-3 shrink-0">
        {user && (
          <div className="px-3 py-2.5 xs:px-4 xs:py-3 bg-foreground/5 hover:bg-foreground/10 hover:border-secondary/35 rounded-md border border-border text-muted flex flex-col gap-1 transition-all duration-fast group">
            <span className="text-[8px] xs:text-[10px] uppercase tracking-wider font-semibold group-hover:text-secondary transition-colors">{t('active_organizer', 'Active Organizer')}</span>
            <span className="font-semibold text-foreground truncate text-xs xs:text-sm">
              {user.displayName || user.email}
            </span>
            <span className="text-[8px] xs:text-[9px] text-muted opacity-80 group-hover:opacity-100 transition-opacity">
              {t('sidebar.status_summary', { membersCount: contributors.length, eventsCount: events.length, defaultValue: '{{membersCount}} Members • {{eventsCount}} Events' })}
            </span>
          </div>
        )}
        <button 
          onClick={async () => {
            await logout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 xs:px-4 xs:py-3 bg-danger/5 hover:bg-danger/10 border border-danger/20 hover:border-danger/30 rounded-md text-danger font-semibold text-xs xs:text-sm cursor-pointer transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-danger active:scale-[0.98]"
        >
          <LogOut size={16} className="shrink-0" />
          <span>{t('logout', 'Log Out')}</span>
        </button>
      </div>

      <div className="text-[10px] xs:text-xs text-muted text-center mt-1 xs:mt-2 shrink-0">
        <p className="font-medium">{t('copyright', '© 2026 Locoo App')}</p>
        <p className="text-[8px] xs:text-[10px] mt-1 opacity-80">{t('app_suite', 'Locoo Contributions Suite')}</p>
      </div>
    </aside>
    </>
  );
};
