import React, { useState } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
import { Search, Plus, User, Phone, ChevronRight, CalendarClock } from 'lucide-react';
import { Button } from '../ui/Button';

interface ContributorListProps {
  onSelectContributor: (id: string) => void;
  onOpenRegisterModal: () => void;
  onOpenScheduleModal: (contributorId: string) => void;
  onOpenPaymentModal: (contributorId: string) => void;
  onOpenPayoutModal: (contributorId: string) => void;
  onOpenBulkScheduleModal: () => void;
}

export const ContributorList: React.FC<ContributorListProps> = ({
  onSelectContributor,
  onOpenRegisterModal,
  onOpenScheduleModal,
  onOpenPaymentModal,
  onOpenPayoutModal,
  onOpenBulkScheduleModal
}) => {
  const { contributors } = useJumuika();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'balance-desc' | 'paid-desc' | 'created-desc'>('created-desc');

  const filteredContributors = contributors.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(query) ||
      (c.phone?.toLowerCase().includes(query) || false)
    );
  });

  const sortedContributors = [...filteredContributors].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return a.fullName.localeCompare(b.fullName);
      case 'name-desc': return b.fullName.localeCompare(a.fullName);
      case 'balance-desc': return (b.remainingBalance || 0) - (a.remainingBalance || 0);
      case 'paid-desc': return (b.totalPaid || 0) - (a.totalPaid || 0);
      case 'created-desc':
      default:
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    }
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">Contributors</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Manage members, schedules, and billing status</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={onOpenBulkScheduleModal}
            variant="ghost"
            size="md"
            className="gap-2 shrink-0 flex-1 sm:flex-none border border-border hover:border-secondary/50"
            title="Schedule all members at once"
          >
            <CalendarClock size={16} />
            <span className="hidden sm:inline">Schedule All</span>
            <span className="sm:hidden">Bulk</span>
          </Button>
          <Button
            onClick={onOpenRegisterModal}
            size="md"
            className="gap-2 shrink-0 flex-1 sm:flex-none"
          >
            <Plus size={16} />
            <span>Register</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
            <input
              type="text"
              className="w-full py-2.5 pl-9 pr-4 bg-foreground/5 border border-border rounded-lg text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="w-full sm:w-[190px] p-2.5 bg-foreground/5 border border-border rounded-lg text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 shrink-0"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="created-desc">Date Registered</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="balance-desc">Balance (High–Low)</option>
            <option value="paid-desc">Total Paid (High–Low)</option>
          </select>
        </div>

        {sortedContributors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center gap-3 text-muted border-2 border-dashed border-border rounded-xl">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-border" />
            <p className="font-medium text-sm sm:text-base max-w-xs">
              {contributors.length === 0
                ? 'No contributors yet. Register your first contributor to get started!'
                : 'No contributors match your search criteria.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile card list (< md) */}
            <div className="flex flex-col gap-3 md:hidden">
              {sortedContributors.map((c) => {
                const percentPaid = c.totalScheduled > 0
                  ? Math.min(100, Math.round((c.totalPaid / c.totalScheduled) * 100))
                  : 0;

                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 p-4 bg-foreground/[0.02] border border-border rounded-xl hover:bg-foreground/5 hover:border-foreground/20 transition-all"
                  >
                    {/* Top row */}
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onSelectContributor(c.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary text-slate-900 flex items-center justify-center font-heading text-sm font-bold shrink-0">
                        {c.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{c.fullName}</p>
                        {c.phone && (
                          <p className="flex items-center gap-1 text-xs text-muted mt-0.5">
                            <Phone size={11} />
                            {c.phone}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-muted shrink-0" />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-border/50">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Scheduled</p>
                        <p className="text-xs font-bold text-foreground">{c.totalScheduled.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Paid</p>
                        <p className="text-xs font-bold text-success">{c.totalPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Balance</p>
                        <p className={`text-xs font-bold ${(c.remainingBalance || 0) > 0 ? 'text-danger' : 'text-muted'}`}>
                          {(c.remainingBalance || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Progress</span>
                        <span>{percentPaid}%</span>
                      </div>
                      <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-success rounded-full transition-all duration-700"
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        className="flex-1"
                        onClick={() => onOpenScheduleModal(c.id)}
                      >
                        Schedule
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        className="flex-1"
                        onClick={() => onOpenPaymentModal(c.id)}
                      >
                        Pay
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="flex-1 border border-border/50 text-foreground"
                        onClick={() => onOpenPayoutModal(c.id)}
                      >
                        Payout
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table (≥ md) */}
            <div className="hidden md:block overflow-x-auto -mx-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Contributor</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">Scheduled</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">Paid</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">Balance</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Progress</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContributors.map((c) => {
                    const percentPaid = c.totalScheduled > 0
                      ? Math.min(100, Math.round((c.totalPaid / c.totalScheduled) * 100))
                      : 0;

                    return (
                      <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-foreground/5 transition-colors">
                        <td
                          className="px-4 py-4 cursor-pointer"
                          onClick={() => onSelectContributor(c.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-secondary text-slate-900 flex items-center justify-center font-heading text-sm font-bold shrink-0">
                              {c.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground">{c.fullName}</p>
                              {c.phone && (
                                <p className="flex items-center gap-1 text-xs text-muted mt-0.5">
                                  <Phone size={11} />
                                  {c.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-bold text-foreground text-right text-sm">{c.totalScheduled.toLocaleString()}</td>
                        <td className="px-4 py-4 font-semibold text-success text-right text-sm">{c.totalPaid.toLocaleString()}</td>
                        <td className={`px-4 py-4 font-semibold text-right text-sm ${(c.remainingBalance || 0) > 0 ? 'text-danger' : 'text-muted'}`}>
                          {(c.remainingBalance || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 w-[130px]">
                            <span className="text-xs font-semibold text-foreground">{percentPaid}%</span>
                            <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-secondary to-success rounded-full transition-all duration-700"
                                style={{ width: `${percentPaid}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenScheduleModal(c.id)}
                              title="Schedule Contributions"
                            >
                              Schedule
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onOpenPaymentModal(c.id)}
                              title="Record Payment"
                            >
                              Pay
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="border border-border/50"
                              onClick={() => onOpenPayoutModal(c.id)}
                              title="Record Payout"
                            >
                              Payout
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSelectContributor(c.id)}
                              title="View Profile"
                              className="px-2"
                            >
                              <ChevronRight size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
