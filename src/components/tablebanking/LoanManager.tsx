import React, { useState, useMemo } from 'react';
import { useLocoo } from '../../context/LocooContext';
import type { Loan } from '../../context/LocooContext';
import {
  Landmark, Plus, Wallet, TrendingUp, AlertCircle,
  CheckCircle2, Clock, Trash2, Users, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { IssueLoanModal } from './IssueLoanModal';
import { LoanRepaymentModal } from './LoanRepaymentModal';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const LoanManager: React.FC = () => {
  const { t } = useTranslation();
  const { loans, loansError, contributors, payments, payouts, currentEventId, events, deleteLoan } = useLocoo();

  const [isIssueLoanOpen, setIsIssueLoanOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed' | 'Defaulted'>('All');

  const currentEvent = events.find(e => e.id === currentEventId);
  const eventLoans = loans.filter(l => l.eventId === currentEventId);

  // Pool metrics
  const { availablePoolBalance, totalActiveLoans, totalInterestEarned, totalDisbursed } = useMemo(() => {
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayoutsAmt = payouts.reduce((sum, p) => sum + p.amount, 0);
    const poolBalance = totalCollected - totalPayoutsAmt;

    const activeLoans = eventLoans.filter(l => l.status === 'Active');
    const activeLoanTotal = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);

    const completedLoans = eventLoans.filter(l => l.status === 'Completed');
    const interestEarned = completedLoans.reduce((sum, l) => sum + l.interestAmount, 0);

    const disbursed = eventLoans.reduce((sum, l) => sum + l.principalAmount, 0);

    return {
      availablePoolBalance: poolBalance,
      totalActiveLoans: activeLoanTotal,
      totalInterestEarned: interestEarned,
      totalDisbursed: disbursed,
    };
  }, [payments, payouts, eventLoans]);

  const filteredLoans = filterStatus === 'All' ? eventLoans : eventLoans.filter(l => l.status === filterStatus);

  const getContributorName = (id: string) =>
    contributors.find(c => c.id === id)?.fullName ?? 'Unknown';

  const handleDelete = async (loan: Loan) => {
    if (loan.status === 'Active') {
      toast.error('Cannot delete an active loan. Mark it as defaulted or wait for repayment.');
      return;
    }
    try {
      await deleteLoan(loan.id);
      toast.success('Loan record deleted');
    } catch {
      toast.error('Failed to delete loan');
    }
  };

  const statusConfig: Record<Loan['status'], { label: string; classes: string; icon: React.ReactNode }> = {
    Active: {
      label: t('status.active', 'Active'),
      classes: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      icon: <Clock size={10} />,
    },
    Completed: {
      label: t('status.completed', 'Completed'),
      classes: 'bg-success/10 text-success border-success/20',
      icon: <CheckCircle2 size={10} />,
    },
    Defaulted: {
      label: t('status.defaulted', 'Defaulted'),
      classes: 'bg-danger/10 text-danger border-danger/20',
      icon: <AlertCircle size={10} />,
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const defaultedLoans = eventLoans.filter(l => l.status === 'Defaulted').length;

  return (
    <>
      <motion.div
        className="flex flex-col gap-6 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">{t('table_banking.loan_book')}</h2>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-sky-500/10 text-sky-400 border-sky-500/20">
                <Landmark size={11} />
                {t('table_banking.title', 'Table Banking')}
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              {t('table_banking.loans_summary', {
                eventName: currentEvent?.name,
                count: eventLoans.length,
                defaultValue: '{{eventName}} · {{count}} loan(s) recorded'
              })}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsIssueLoanOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-sky-500 hover:bg-sky-500/90 w-full sm:w-auto justify-center"
            disabled={availablePoolBalance <= 0}
          >
            <Plus size={16} strokeWidth={2.5} />
            {t('table_banking.issue_loan')}
          </Button>
        </motion.div>

        {/* Alerts */}
        {loansError && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 px-4 py-3 bg-danger/8 border border-danger/20 rounded-xl">
              <AlertCircle size={16} className="text-danger shrink-0" />
              <p className="text-sm font-semibold text-danger flex-1">
                {loansError}
              </p>
            </div>
          </motion.div>
        )}

        {defaultedLoans > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 px-4 py-3 bg-danger/8 border border-danger/20 rounded-xl">
              <AlertCircle size={16} className="text-danger shrink-0" />
              <p className="text-sm font-semibold text-danger flex-1">
                {t('table_banking.defaulted_loans_warning_action', {
                  count: defaultedLoans,
                  defaultValue: '{{count}} defaulted loan(s) — follow up with members immediately.'
                })}
              </p>
            </div>
          </motion.div>
        )}

        {availablePoolBalance <= 0 && eventLoans.length === 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <AlertCircle size={16} className="text-amber-400 shrink-0" />
              <p className="text-sm font-semibold text-amber-400">
                {t('table_banking.collect_first')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Available Pool */}
          <div className="bg-surface/80 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-sky-500/30 transition-colors col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet size={64} className="text-sky-400" />
            </div>
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-wider font-bold text-muted mb-1">{t('table_banking.available_pool')}</p>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-sky-400">
                {availablePoolBalance.toLocaleString()}
                <span className="text-base text-muted font-medium ml-1">TZS</span>
              </h3>
            </div>
          </div>

          {/* Total Disbursed */}
          <div className="bg-surface/80 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Landmark size={64} className="text-primary" />
            </div>
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-wider font-bold text-muted mb-1">{t('table_banking.total_loaned')}</p>
              <h3 className="font-heading text-2xl font-extrabold text-foreground">
                {totalDisbursed.toLocaleString()}
                <span className="text-sm text-muted font-medium ml-1">TZS</span>
              </h3>
            </div>
          </div>

          {/* Active Loan Outstanding */}
          <div className="bg-surface/80 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={64} className="text-amber-400" />
            </div>
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-wider font-bold text-muted mb-1">{t('table_banking.outstanding')}</p>
              <h3 className="font-heading text-2xl font-extrabold text-foreground">
                {totalActiveLoans.toLocaleString()}
                <span className="text-sm text-muted font-medium ml-1">TZS</span>
              </h3>
            </div>
          </div>

          {/* Interest Earned */}
          <div className="bg-surface/80 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-success/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} className="text-success" />
            </div>
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-wider font-bold text-muted mb-1">{t('table_banking.interest_earned')}</p>
              <h3 className="font-heading text-2xl font-extrabold text-success">
                {totalInterestEarned.toLocaleString()}
                <span className="text-sm text-muted font-medium ml-1">TZS</span>
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
          {(['All', 'Active', 'Completed', 'Defaulted'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              {status === 'All' ? t('status.all', 'All') :
               status === 'Active' ? t('status.active', 'Active') :
               status === 'Completed' ? t('status.completed', 'Completed') :
               status === 'Defaulted' ? t('status.defaulted', 'Defaulted') :
               status}
              <span className="ml-1.5 opacity-70">
                {status === 'All' ? eventLoans.length : eventLoans.filter(l => l.status === status).length}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Loan Book Table */}
        <motion.div variants={itemVariants} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          {filteredLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              {eventLoans.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4">
                    <Users size={32} className="text-sky-400" />
                  </div>
                  <p className="text-foreground font-bold text-lg mb-1">{t('table_banking.no_loans')}</p>
                  <p className="text-muted text-sm mb-6 max-w-xs">
                    {t('table_banking.collect_first')}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setIsIssueLoanOpen(true)}
                    className="flex items-center gap-2 bg-sky-500 hover:bg-sky-500/90"
                    disabled={availablePoolBalance <= 0}
                  >
                    <Plus size={16} />
                    {t('table_banking.issue_loan')}
                  </Button>
                </>
              ) : (
                <p className="text-muted text-sm">No {filterStatus.toLowerCase()} loans found.</p>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="flex flex-col gap-3 md:hidden p-4">
                {filteredLoans.map((loan) => {
                  const status = statusConfig[loan.status];
                  const progress = loan.totalRepayable > 0
                    ? Math.min(100, Math.round((loan.amountRepaid / loan.totalRepayable) * 100))
                    : 0;
                  const isOverdue = loan.status === 'Active' && loan.dueDate < new Date().toLocaleDateString('en-CA');

                  return (
                    <div
                      key={loan.id}
                      className={`flex flex-col gap-3 p-4 bg-foreground/[0.02] border rounded-xl hover:bg-foreground/5 hover:border-foreground/20 transition-all ${
                        isOverdue ? 'border-danger/30 bg-danger/[0.01]' : 'border-border'
                      }`}
                    >
                      {/* Header: Member name + status badge */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-heading text-xs font-bold shrink-0">
                            {getContributorName(loan.contributorId).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{getContributorName(loan.contributorId)}</p>
                            <p className="text-[10px] text-muted">{loan.disbursementDate}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.classes}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 text-center text-xs">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted font-semibold truncate">{t('table_banking.principal')}</p>
                          <p className="font-bold text-foreground truncate">{loan.principalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted font-semibold truncate">{t('table_banking.interest')}</p>
                          <p className="font-bold text-sky-400 truncate">+{loan.interestAmount.toLocaleString()} ({loan.interestRate}%)</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted font-semibold truncate">{t('table_banking.total_repayable')}</p>
                          <p className="font-bold text-foreground truncate">{loan.totalRepayable.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted font-semibold truncate">{t('table_banking.repaid')}</p>
                          <p className="font-bold text-success truncate">{loan.amountRepaid.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted font-semibold truncate">{t('table_banking.remaining')}</p>
                          <p className={`font-bold truncate ${loan.remainingBalance > 0 ? 'text-danger' : 'text-success'}`}>{loan.remainingBalance.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t('table_banking.repayment_progress', 'Repayment Progress')}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-400 rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer: Due date & Actions */}
                      <div className="flex justify-between items-center gap-2 mt-1">
                        <div className="text-[10px] text-muted">
                          {t('table_banking.due_date', 'Due Date')}: <span className={`font-bold ${isOverdue ? 'text-danger' : 'text-foreground'}`}>{loan.dueDate}</span>
                          {isOverdue && <span className="block text-[8px] uppercase tracking-wider text-danger font-extrabold">{t('status.overdue')}</span>}
                        </div>
                        <div className="flex gap-2">
                          {loan.status === 'Active' && (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => setSelectedLoan(loan)}
                              className="bg-sky-500 hover:bg-sky-500/90 gap-1 cursor-pointer"
                            >
                              <RefreshCw size={11} />
                              <span>{t('table_banking.repay')}</span>
                            </Button>
                          )}
                          {loan.status !== 'Active' && (
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-muted hover:text-danger hover:bg-danger/10 p-1.5 cursor-pointer animate-fade-in"
                              onClick={() => handleDelete(loan)}
                            >
                              <Trash2 size={13} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/60 bg-background/50">
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">{t('payments_page.member')}</th>
                      <th className="text-right px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest hidden sm:table-cell">{t('table_banking.principal')}</th>
                      <th className="text-right px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest hidden md:table-cell">{t('table_banking.interest')}</th>
                      <th className="text-right px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">{t('table_banking.total_repayable')}</th>
                      <th className="text-right px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest hidden lg:table-cell">{t('table_banking.repaid')}</th>
                      <th className="text-right px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">{t('table_banking.remaining')}</th>
                      <th className="text-center px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest hidden sm:table-cell">{t('table_banking.due_date')}</th>
                      <th className="text-center px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
                      <th className="text-right px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredLoans.map((loan, i) => {
                      const status = statusConfig[loan.status];
                      const progress = loan.totalRepayable > 0
                        ? Math.min(100, Math.round((loan.amountRepaid / loan.totalRepayable) * 100))
                        : 0;
                      const isOverdue = loan.status === 'Active' && loan.dueDate < new Date().toLocaleDateString('en-CA');

                      return (
                        <motion.tr
                          key={loan.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`hover:bg-foreground/[0.02] transition-colors ${isOverdue ? 'bg-danger/[0.02]' : ''}`}
                        >
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="font-semibold text-sm text-foreground">{getContributorName(loan.contributorId)}</p>
                              <p className="text-[10px] text-muted mt-0.5">{loan.disbursementDate}</p>
                              {/* Mobile progress */}
                              <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden w-24 sm:hidden">
                                <div
                                  className="h-full bg-sky-400 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              {/* Repay / Delete action always visible here */}
                              {loan.status === 'Active' && (
                                <button
                                  onClick={() => setSelectedLoan(loan)}
                                  className="mt-2 text-[11px] font-bold text-sky-400 hover:text-white px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500 transition-all whitespace-nowrap inline-flex items-center gap-1 border border-sky-500/20"
                                >
                                  <RefreshCw size={11} />
                                  {t('table_banking.repay')}
                                </button>
                              )}
                              {loan.status !== 'Active' && (
                                <button
                                  onClick={() => handleDelete(loan)}
                                  className="mt-2 text-[11px] font-bold text-muted hover:text-danger px-2 py-1 rounded-lg bg-foreground/5 hover:bg-danger/10 transition-all whitespace-nowrap inline-flex items-center gap-1"
                                >
                                  <Trash2 size={11} />
                                  {t('common.delete')}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right text-sm font-semibold text-foreground hidden sm:table-cell">
                            {loan.principalAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right text-sm font-semibold text-sky-400 hidden md:table-cell">
                            +{loan.interestAmount.toLocaleString()}
                            <span className="text-[10px] text-muted ml-1">({loan.interestRate}%)</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <p className="text-sm font-bold text-foreground">{loan.totalRepayable.toLocaleString()}</p>
                            {/* Desktop progress */}
                            <div className="mt-1 h-1 bg-border rounded-full overflow-hidden w-20 ml-auto hidden lg:block">
                              <div
                                className="h-full bg-sky-400 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right text-sm font-semibold text-success hidden lg:table-cell">
                            {loan.amountRepaid.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className={`text-sm font-bold ${loan.remainingBalance > 0 ? 'text-danger' : 'text-success'}`}>
                              {loan.remainingBalance.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                            <span className={`text-xs font-semibold ${isOverdue ? 'text-danger font-bold' : 'text-muted'}`}>
                              {loan.dueDate}
                              {isOverdue && <span className="block text-[9px] uppercase tracking-wider">{t('status.overdue')}</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${status.classes}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {/* Desktop duplicate button for clarity */}
                            {loan.status === 'Active' && (
                              <button
                                onClick={() => setSelectedLoan(loan)}
                                className="hidden sm:inline-flex text-xs font-bold text-sky-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 transition-all whitespace-nowrap items-center gap-1 border border-sky-500/20"
                              >
                                <RefreshCw size={12} />
                                {t('table_banking.repay')}
                              </button>
                            )}
                            {loan.status !== 'Active' && (
                              <button
                                onClick={() => handleDelete(loan)}
                                className="hidden sm:inline-flex p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all items-center gap-1 text-xs"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      <IssueLoanModal isOpen={isIssueLoanOpen} onClose={() => setIsIssueLoanOpen(false)} />
      <LoanRepaymentModal
        isOpen={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
        loan={selectedLoan}
      />
    </>
  );
};
