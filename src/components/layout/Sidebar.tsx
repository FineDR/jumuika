import React, { useState } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Calendar, Receipt, Plus, ChevronDown, LogOut, Sun, Moon, Globe, Settings as SettingsIcon } from 'lucide-react';
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
  const { events, currentEventId, setCurrentEventId, contributors } = useJumuika();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState('');

  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const currentEvent = events.find(e => e.id === currentEventId);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'contributors', label: t('contributors', 'Contributors'), icon: Users },
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
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-surface border-r border-border p-6 sm:p-8 flex flex-col gap-8 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none lg:shrink-0 lg:h-screen lg:top-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
      <div className="flex items-center gap-3">
        <LogoIcon className="w-8 h-8" />
        <h1 className="font-heading text-2xl font-extrabold text-secondary uppercase tracking-wider drop-shadow-sm">
          Jumuika
        </h1>
      </div>

      <div className="mt-2 relative">
        <span className="text-xs uppercase text-muted tracking-widest font-semibold mb-2 block">Active Event</span>
        <button 
          className="w-full p-3 bg-foreground/5 hover:bg-secondary/10 border border-border hover:border-secondary rounded-md text-foreground font-semibold text-sm flex items-center justify-between cursor-pointer transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="truncate pr-2">{currentEvent ? currentEvent.name : 'Select Event'}</span>
          <ChevronDown size={16} className={`transition-transform duration-normal ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 bg-surface border border-border rounded-md mt-1 z-30 shadow-lg p-2.5 flex flex-col gap-2 max-h-60 overflow-y-auto overflow-x-hidden animate-drop-in">
            <input
              type="text"
              placeholder="Search event..."
              className="w-full p-2 bg-background border border-border rounded text-xs text-foreground focus:outline-none focus:border-secondary"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-col max-h-40 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="text-xs text-muted p-2">No events found</div>
              ) : (
                filteredEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setCurrentEventId(e.id);
                      setDropdownOpen(false);
                      setEventSearch('');
                    }}
                    className={`w-full p-2.5 text-left text-xs cursor-pointer block transition-colors duration-fast ${e.id === currentEventId ? 'bg-secondary/10 text-secondary font-semibold' : 'text-foreground hover:bg-foreground/5'}`}
                  >
                    <span className="truncate block flex items-center justify-between font-sans">
                      {e.name}
                      {e.id === currentEventId && <span className="text-[10px] font-bold text-secondary">✓</span>}
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
              className="w-full p-2.5 bg-secondary/5 hover:bg-secondary/10 border-t border-border text-left text-secondary text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Plus size={14} />
              Create New Event
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => onOpenPaymentModal(null)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-surface hover:bg-secondary/95 hover:-translate-y-0.5 border border-transparent rounded-lg font-bold text-sm tracking-wide shadow-[0_4px_10px_rgba(20,184,166,0.2)] hover:shadow-[0_4px_15px_rgba(20,184,166,0.3)] transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary active:scale-[0.98]"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>{t('quick_record')}</span>
      </button>

      <nav className="flex-grow mt-4">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-md font-medium text-[0.95rem] transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] ${isActive ? 'bg-secondary text-surface font-semibold shadow-[0_4px_15px_rgba(20,184,166,0.3)]' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Preferences Panel */}
      <div className="flex flex-col gap-2 mt-auto mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'sw' : 'en')}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-surface border border-border rounded-md text-foreground cursor-pointer transition-colors duration-fast hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
            title="Toggle Language"
          >
            <Globe size={16} />
            <span className="text-xs font-semibold">{i18n.language === 'en' ? 'SW' : 'EN'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center p-2.5 bg-surface border border-border rounded-md text-foreground cursor-pointer transition-colors duration-fast hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* User Session & Logout Panel */}
      <div className="flex flex-col gap-3">
        {user && (
          <div className="px-4 py-3 bg-foreground/5 hover:bg-foreground/10 hover:border-secondary/35 rounded-md border border-border text-muted flex flex-col gap-1 transition-all duration-fast group">
            <span className="text-[10px] uppercase tracking-wider font-semibold group-hover:text-secondary transition-colors">Active Organizer</span>
            <span className="font-semibold text-foreground truncate text-sm">
              {user.displayName || user.email}
            </span>
            <span className="text-[9px] text-muted opacity-80 group-hover:opacity-100 transition-opacity">
              {contributors.length} Members • {events.length} Events
            </span>
          </div>
        )}
        <button 
          onClick={async () => {
            await logout();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-danger/5 hover:bg-danger/10 border border-danger/20 hover:border-danger/30 rounded-md text-danger font-semibold text-sm cursor-pointer transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-danger active:scale-[0.98]"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      <div className="text-xs text-muted text-center mt-2">
        <p className="font-medium">© 2026 Jumuika App</p>
        <p className="text-[10px] mt-1 opacity-80">Scheduled Contributions</p>
      </div>
    </aside>
    </>
  );
};
