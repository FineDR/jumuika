import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { Search, Plus, User, Phone, ChevronRight } from 'lucide-react';

interface ContributorListProps {
  onSelectContributor: (id: string) => void;
  onOpenRegisterModal: () => void;
  onOpenScheduleModal: (contributorId: string) => void;
  onOpenPaymentModal: (contributorId: string) => void;
}

export const ContributorList: React.FC<ContributorListProps> = ({
  onSelectContributor,
  onOpenRegisterModal,
  onOpenScheduleModal,
  onOpenPaymentModal
}) => {
  const { contributors } = useJumuika();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'balance-desc' | 'paid-desc' | 'created-desc'>('created-desc');

  // Search & Filter contributors
  const filteredContributors = contributors.filter(c => {
    const query = searchQuery.toLowerCase();
    const nameMatch = c.fullName.toLowerCase().includes(query);
    const phoneMatch = c.phone?.toLowerCase().includes(query) || false;
    return nameMatch || phoneMatch;
  });

  // Sort contributors
  const sortedContributors = [...filteredContributors].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.fullName.localeCompare(b.fullName);
      case 'name-desc':
        return b.fullName.localeCompare(a.fullName);
      case 'balance-desc':
        return (b.remainingBalance || 0) - (a.remainingBalance || 0);
      case 'paid-desc':
        return (b.totalPaid || 0) - (a.totalPaid || 0);
      case 'created-desc':
      default:
        // Use document id or a safe comparison for timestamps
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
    }
  });

  return (
    <div className="contributors-view">
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="page-title">Contributors</h2>
          <p className="page-subtitle">Manage members, schedule payment plans, and view billing status</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenRegisterModal}>
          <Plus size={18} />
          Register Contributor
        </button>
      </div>

      <div className="section-card">
        <div className="controls-row">
          <div className="search-input-wrapper">
            <Search className="search-icon-inside" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label className="form-label" style={{ margin: 'auto 0', textTransform: 'none', whiteSpace: 'nowrap' }}>
              Sort by:
            </label>
            <select
              className="form-control"
              style={{ width: '200px', padding: '0.5rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="created-desc">Date Registered</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="balance-desc">Remaining Balance (High-Low)</option>
              <option value="paid-desc">Total Paid (High-Low)</option>
            </select>
          </div>
        </div>

        {sortedContributors.length === 0 ? (
          <div className="empty-state">
            <User className="empty-state-icon" />
            <p>{contributors.length === 0 ? 'No contributors registered yet. Click the button above to register your first contributor!' : 'No contributors match your search criteria.'}</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contributor</th>
                  <th>Total Scheduled</th>
                  <th>Total Paid</th>
                  <th>Remaining Balance</th>
                  <th>Payment Progress</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedContributors.map((c) => {
                  const percentPaid = c.totalScheduled > 0 
                    ? Math.min(100, Math.round((c.totalPaid / c.totalScheduled) * 100)) 
                    : 0;

                  return (
                    <tr key={c.id}>
                      <td 
                        className="clickable-row" 
                        onClick={() => onSelectContributor(c.id)}
                      >
                        <div className="flex align-center gap-4">
                          <div className="profile-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                            {c.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{c.fullName}</div>
                            {c.phone && (
                              <div className="flex align-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                <Phone size={12} />
                                {c.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><strong>{c.totalScheduled.toLocaleString()} KES</strong></td>
                      <td style={{ color: 'var(--status-completed)', fontWeight: 600 }}>
                        {c.totalPaid.toLocaleString()} KES
                      </td>
                      <td style={{ color: (c.remainingBalance || 0) > 0 ? 'var(--status-overdue)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {(c.remainingBalance || 0).toLocaleString()} KES
                      </td>
                      <td>
                        <div className="progress-container" style={{ width: '150px' }}>
                          <div className="progress-bar-label">
                            <span>{percentPaid}%</span>
                          </div>
                          <div className="progress-track" style={{ height: '6px' }}>
                            <div className="progress-fill" style={{ width: `${percentPaid}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenScheduleModal(c.id)}
                            title="Schedule Contributions"
                          >
                            Schedule
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenPaymentModal(c.id)}
                            title="Record Payment"
                          >
                            Pay
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectContributor(c.id)}
                            style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
