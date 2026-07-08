import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocoo } from '../../context/LocooContext';
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
  const { t } = useTranslation();
  const { contributors } = useLocoo();
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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl xs:text-3xl lg:text-4xl font-extrabold text-foreground">{t('contributors_page.title')}</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">{t('contributors_page.subtitle')}</p>
        </div>
        <div className="flex flex-col xs:flex-row items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={onOpenBulkScheduleModal}
            variant="ghost"
            size="md"
            className="gap-2 w-full xs:w-auto border border-border hover:border-secondary/50 justify-center cursor-pointer"
            title="Schedule all members at once"
          >
            <CalendarClock size={16} />
            <span>{t('contributors_page.schedule_all')}</span>
          </Button>
          <Button
            onClick={onOpenRegisterModal}
            size="md"
            className="gap-2 w-full xs:w-auto justify-center cursor-pointer"
          >
            <Plus size={16} />
            <span>{t('contributors_page.register')}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col xs:flex-row gap-3 mb-5 sm:mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
            <input
              type="text"
              className="w-full py-2.5 pl-9 pr-4 bg-foreground/5 border border-border rounded-lg text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              placeholder={t('contributors_page.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="w-full xs:w-[190px] p-2.5 bg-foreground/5 border border-border rounded-lg text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 shrink-0"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="created-desc">{t('contributors_page.sort.date')}</option>
            <option value="name-asc">{t('contributors_page.sort.name_asc')}</option>
            <option value="name-desc">{t('contributors_page.sort.name_desc')}</option>
            <option value="balance-desc">{t('contributors_page.sort.balance')}</option>
            <option value="paid-desc">{t('contributors_page.sort.paid')}</option>
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
                    <div className="grid grid-cols-3 gap-1.5 text-center py-2 border-y border-border/50">
                      <div className="min-w-0">
                        <p className="text-[9px] xs:text-[10px] uppercase tracking-wider text-muted font-semibold truncate">{t('contributors_page.scheduled')}</p>
                        <p className="text-[11px] xs:text-xs font-bold text-foreground truncate">{c.totalScheduled.toLocaleString()}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] xs:text-[10px] uppercase tracking-wider text-muted font-semibold truncate">{t('contributors_page.paid')}</p>
                        <p className="text-[11px] xs:text-xs font-bold text-success truncate">{c.totalPaid.toLocaleString()}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] xs:text-[10px] uppercase tracking-wider text-muted font-semibold truncate">{t('contributors_page.balance')}</p>
                        <p className={`text-[11px] xs:text-xs font-bold truncate ${(c.remainingBalance || 0) > 0 ? 'text-danger' : 'text-muted'}`}>
                          {(c.remainingBalance || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>{t('contributors_page.progress')}</span>
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
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="xs"
                        className="w-full justify-center py-2 cursor-pointer"
                        onClick={() => onOpenPaymentModal(c.id)}
                      >
                        Pay
                      </Button>
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="xs"
                          className="flex-1 justify-center py-2 cursor-pointer"
                          onClick={() => onOpenScheduleModal(c.id)}
                        >
                          Schedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="flex-1 justify-center py-2 border border-border/50 text-foreground cursor-pointer"
                          onClick={() => onOpenPayoutModal(c.id)}
                        >
                          Payout
                        </Button>
                      </div>
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
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">{t('contributors_page.name')}</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">{t('contributors_page.scheduled')}</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">{t('contributors_page.paid')}</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">{t('contributors_page.balance')}</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">{t('contributors_page.progress')}</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">{t('contributors_page.actions')}</th>
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
