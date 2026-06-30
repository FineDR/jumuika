import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { Search, User, Receipt } from 'lucide-react';

export const PaymentsLog: React.FC = () => {
  const { payments, contributors } = useJumuika();
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to map contributor name
  const getContributorName = (contributorId: string) => {
    const c = contributors.find(contrib => contrib.id === contributorId);
    return c ? c.fullName : 'Unknown Contributor';
  };

  // Search filter
  const filteredPayments = payments.filter(p => {
    const contributorName = getContributorName(p.contributorId).toLowerCase();
    const method = p.paymentMethod.toLowerCase();
    const recorder = p.recordedBy.toLowerCase();
    const note = (p.notes || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return contributorName.includes(query) || 
           method.includes(query) || 
           recorder.includes(query) || 
           note.includes(query);
  });

  return (
    <div className="payments-log-view">
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="page-title">Payments Log</h2>
          <p className="page-subtitle">View history of contribution collections and receipts</p>
        </div>
      </div>

      <div className="section-card">
        <div className="controls-row">
          <div className="search-input-wrapper">
            <Search className="search-icon-inside" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by contributor, payment method, recorded by..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <Receipt className="empty-state-icon" />
            <p>No payments recorded yet under this event.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contributor</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Recorded By</th>
                  <th>Date/Time</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const paymentDate = p.createdAt?.seconds 
                    ? new Date(p.createdAt.seconds * 1000).toLocaleString('en-GB')
                    : 'Just now';

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex align-center gap-2" style={{ fontWeight: 600 }}>
                          <User size={14} className="text-muted" />
                          {getContributorName(p.contributorId)}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--status-completed)' }}>
                          +{p.amount.toLocaleString()} KES
                        </strong>
                      </td>
                      <td>
                        <span className="badge badge-upcoming" style={{ color: 'var(--text-main)', background: 'rgba(255,255,255,0.05)' }}>
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td>{p.recordedBy}</td>
                      <td>{paymentDate}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '250px', wordBreak: 'break-word' }}>
                        {p.notes || '—'}
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
