import React, { useState } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h2 className="font-heading text-4xl font-extrabold text-foreground mb-2">Payments Log</h2>
        <p className="text-sm text-muted">View history of contribution collections and receipts</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-grow min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              className="w-full py-3 pl-10 pr-4 bg-foreground/5 border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              placeholder="Search by contributor, payment method, recorded by..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4 text-muted border-2 border-dashed border-border rounded-xl bg-foreground/5">
            <Receipt className="w-12 h-12 text-border" />
            <p className="font-medium">No payments recorded yet under this event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Contributor</th>
                  <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">Amount</th>
                  <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Method</th>
                  <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Recorded By</th>
                  <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Date/Time</th>
                  <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const paymentDate = p.createdAt?.seconds 
                    ? new Date(p.createdAt.seconds * 1000).toLocaleString('en-GB')
                    : 'Just now';

                  return (
                    <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-foreground/5 transition-colors duration-fast">
                      <td className="p-5">
                        <div className="flex items-center gap-3 font-semibold text-foreground">
                          <User size={16} className="text-secondary" />
                          {getContributorName(p.contributorId)}
                        </div>
                      </td>
                      <td className="p-5 font-bold text-success text-right whitespace-nowrap">
                        +{p.amount.toLocaleString()} TZS
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-foreground/5 text-foreground rounded-md uppercase tracking-wider border border-border">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-foreground font-medium">{p.recordedBy}</td>
                      <td className="p-5 text-sm text-muted whitespace-nowrap">{paymentDate}</td>
                      <td className="p-5 text-sm text-muted italic max-w-[250px] break-words">
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
