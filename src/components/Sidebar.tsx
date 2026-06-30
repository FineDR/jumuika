import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Receipt, Plus, ChevronDown, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenEventModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenEventModal }) => {
  const { events, currentEventId, setCurrentEventId } = useJumuika();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentEvent = events.find(e => e.id === currentEventId);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contributors', label: 'Contributors', icon: Users },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'payments', label: 'Payments Log', icon: Receipt },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-section">
        <Receipt size={28} className="text-secondary" style={{ color: 'var(--secondary)' }} />
        <h1 className="brand-logo">Jumuika</h1>
      </div>

      <div className="event-picker-container">
        <span className="picker-label">Active Event</span>
        <div style={{ position: 'relative' }}>
          <button 
            className="event-select-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>{currentEvent ? currentEvent.name : 'Select Event'}</span>
            <ChevronDown size={16} />
          </button>
          
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--bg-modal)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              marginTop: '4px',
              zIndex: 10,
              boxShadow: 'var(--shadow-md)',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {events.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setCurrentEventId(e.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: e.id === currentEventId ? 'rgba(173, 239, 209, 0.1)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: e.id === currentEventId ? 'var(--secondary)' : 'var(--text-main)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'block',
                    fontWeight: e.id === currentEventId ? '600' : 'normal',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = e.currentTarget.id === currentEventId ? 'rgba(173, 239, 209, 0.1)' : 'transparent';
                  }}
                  id={e.id}
                >
                  {e.name}
                </button>
              ))}
              <button
                onClick={() => {
                  onOpenEventModal();
                  setDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(173, 239, 209, 0.05)',
                  border: 'none',
                  borderTop: '1px solid var(--border)',
                  textAlign: 'left',
                  color: 'var(--secondary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600'
                }}
              >
                <Plus size={16} />
                Create New Event
              </button>
            </div>
          )}
        </div>
      </div>

      <nav style={{ flexGrow: 1 }}>
        <ul className="nav-links">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`}>
                <button onClick={() => setActiveTab(item.id)}>
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Session & Logout Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
        {user && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.displayName || user.email}
            </span>
          </div>
        )}
        <button 
          onClick={async () => {
            await logout();
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(255, 94, 126, 0.04)',
            border: '1px solid rgba(255, 94, 126, 0.12)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-overdue)',
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 94, 126, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 94, 126, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 94, 126, 0.04)';
            e.currentTarget.style.borderColor = 'rgba(255, 94, 126, 0.12)';
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      <div className="sidebar-footer" style={{ marginTop: '0.5rem' }}>
        <p>© 2026 Jumuika App</p>
        <p style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>Scheduled Contributions</p>
      </div>
    </aside>
  );
};
