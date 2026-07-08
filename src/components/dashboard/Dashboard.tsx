import React, { useMemo } from 'react';
import { useLocoo } from '../../context/LocooContext';
import { 
  Calendar, AlertCircle, Clock, CheckCircle2, User, 
  Wallet, TrendingUp, ArrowRight, Activity, HandHeart, RefreshCw, Landmark
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface DashboardProps {
  onSelectContributorId: (id: string) => void;
  onOpenPaymentModal: () => void;
  onOpenRegisterModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onSelectContributorId,
  onOpenPaymentModal,
  onOpenRegisterModal
}) => {
  const { schedules, contributors, payments, payouts, loans, events, currentEventId } = useLocoo();
  const { t } = useTranslation();

  const currentEvent = events.find(e => e.id === currentEventId);
  const todayStr = new Date().toLocaleDateString('en-CA');

  const nextMemberName = useMemo(() => {
    if (currentEvent?.eventType !== 'merry-go-round') return '';
    const order: string[] = (currentEvent as any)?.rotationOrder ?? [];
    const eventContributors = contributors.filter(c => c.eventId === currentEventId);
    if (eventContributors.length === 0) return '';
    
    const activeOrder = order.length > 0 
      ? [...order.filter(id => eventContributors.some(c => c.id === id)), ...eventContributors.map(c => c.id).filter(id => !order.includes(id))]
      : eventContributors.map(c => c.id);

    const eventPayouts = payouts.filter(p => p.eventId === currentEventId);
    const cycleLength = activeOrder.length;
    if (cycleLength === 0) return '';
    const totalPayoutsCount = eventPayouts.length;
    const currentTurnIndex = totalPayoutsCount % cycleLength;
    const nextMemberId = activeOrder[currentTurnIndex];
    const nextMember = contributors.find(c => c.id === nextMemberId);
    return nextMember ? nextMember.fullName : 'None';
  }, [currentEvent, contributors, payouts, currentEventId]);

  // Calculations
  const { 
    totalExpected, 
    totalCollected, 
    currentPoolBalance,
    totalOverdue,
    overdueSchedules,
    upcomingSchedules
  } = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let overdueAmt = 0;
    const overdueList: typeof schedules = [];
    const upcomingList: typeof schedules = [];

    // Calculate collected directly from payments
    payments.forEach(p => collected += p.amount);

    schedules.forEach(s => {
      expected += s.amount;
      if (s.remainingAmount > 0) {
        if (s.dueDate < todayStr) {
          overdueAmt += s.remainingAmount;
          overdueList.push(s);
        } else {
          upcomingList.push(s);
        }
      }
    });

    // Sort upcoming (closest first)
    upcomingList.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    // Sort overdue (oldest first)
    overdueList.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);

    return { 
      totalExpected: expected, 
      totalCollected: collected, 
      totalPayouts,
      currentPoolBalance: collected - totalPayouts,
      totalOverdue: overdueAmt,
      overdueSchedules: overdueList,
      upcomingSchedules: upcomingList
    };
  }, [schedules, payments, payouts, todayStr]);

  // Table Banking metrics
  const tbMetrics = useMemo(() => {
    const eventLoans = loans.filter(l => l.eventId === currentEventId);
    const activeLoans = eventLoans.filter(l => l.status === 'Active');
    const defaultedLoans = eventLoans.filter(l => l.status === 'Defaulted');
    const interestEarned = eventLoans
      .filter(l => l.status === 'Completed')
      .reduce((sum, l) => sum + l.interestAmount, 0);
    return {
      activeLoansCount: activeLoans.length,
      defaultedCount: defaultedLoans.length,
      interestEarned,
    };
  }, [loans, currentEventId]);

  const progressPercentage = totalExpected > 0 
    ? Math.min(Math.round((totalCollected / totalExpected) * 100), 100) 
    : 0;

  // Recent 5 payments
  const recentPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.now();
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.now();
      return timeB - timeA;
    }).slice(0, 5);
  }, [payments]);

  // Recent 5 payouts
  const recentPayouts = useMemo(() => {
    return [...payouts].sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.now();
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.now();
      return timeB - timeA;
    }).slice(0, 5);
  }, [payouts]);

  const getContributorName = (id: string) => {
    const c = contributors.find(c => c.id === id);
    return c ? c.fullName : 'Unknown';
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {t('dashboard')}
            </h2>
            {currentEvent && (
              <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                currentEvent.eventType === 'merry-go-round'
                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                  : currentEvent.eventType === 'table-banking'
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {currentEvent.eventType === 'merry-go-round' ? <RefreshCw size={11} /> : currentEvent.eventType === 'table-banking' ? <Landmark size={11} /> : <HandHeart size={11} />}
                {currentEvent.eventType === 'merry-go-round' ? 'Merry-Go-Round' : currentEvent.eventType === 'table-banking' ? 'Table Banking' : 'Harambee'}
              </span>
            )}
          </div>
            <p className="text-sm text-muted mt-1">
            {currentEvent ? currentEvent.name : t('dashboard_metrics.no_activity')}
          </p>
        </div>
        <div className="flex flex-col xs:flex-row items-center gap-2.5 w-full sm:w-auto">
          <button 
            onClick={onOpenRegisterModal}
            className="w-full xs:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border hover:border-secondary/50 rounded-xl text-xs xs:text-sm font-bold shadow-sm transition-all hover:shadow-md cursor-pointer shrink-0"
          >
            <User size={16} className="text-secondary" />
            {t('contributors_page.add_new')}
          </button>
          <button 
            onClick={onOpenPaymentModal}
            className="w-full xs:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl text-xs xs:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Wallet size={16} />
            {t('payments_page.record_payment')}
          </button>
        </div>
      </motion.div>

      {/* Smart Contextual Alerts */}
      {(overdueSchedules.length > 0 || (currentEvent?.eventType === 'merry-go-round' && currentPoolBalance > 0) || currentEvent?.eventType === 'table-banking') && (
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          {overdueSchedules.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-danger/8 border border-danger/20 rounded-xl">
              <AlertCircle size={16} className="text-danger shrink-0" />
              <p className="text-sm font-semibold text-danger flex-1">
                {overdueSchedules.length} installment{overdueSchedules.length > 1 ? 's are' : ' is'} overdue —{' '}
                <span className="font-bold">{overdueSchedules.reduce((s, x) => s + x.remainingAmount, 0).toLocaleString()} TZS</span> uncollected
              </p>
            </div>
          )}
          {currentEvent?.eventType === 'merry-go-round' && currentPoolBalance > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-violet-500/8 border border-violet-500/20 rounded-xl">
              <RefreshCw size={16} className="text-violet-400 shrink-0 animate-spin-slow" />
              <p className="text-sm font-semibold text-violet-400 flex-1">
                Pool ready for payout —{' '}
                <span className="font-bold">{currentPoolBalance.toLocaleString()} TZS</span> available to disburse{nextMemberName && nextMemberName !== 'None' ? <> to <span className="underline font-bold">{nextMemberName}</span></> : ' to the next member'}
              </p>
            </div>
          )}
          {currentEvent?.eventType === 'table-banking' && (
            <div className="flex items-start gap-3 px-4 py-3 bg-sky-500/8 border border-sky-500/20 rounded-xl">
              <Landmark size={16} className="text-sky-400 shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <p className="text-sm font-semibold text-sky-400">
                  Pool Balance: <span className="font-bold">{currentPoolBalance.toLocaleString()} TZS</span>
                </p>
                <p className="text-sm font-semibold text-foreground/70">
                  Active Loans: <span className="font-bold text-foreground">{tbMetrics.activeLoansCount}</span>
                </p>
                <p className="text-sm font-semibold text-success">
                  Interest Earned: <span className="font-bold">{tbMetrics.interestEarned.toLocaleString()} TZS</span>
                </p>
                {tbMetrics.defaultedCount > 0 && (
                  <p className="text-sm font-bold text-danger">
                    ⚠ {tbMetrics.defaultedCount} defaulted loan{tbMetrics.defaultedCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-secondary/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-secondary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] xs:text-xs uppercase tracking-wider font-bold text-muted mb-1 truncate">{t('dashboard_metrics.total_expected')}</p>
            <h3 className="font-heading text-xl xs:text-lg sm:text-xl md:text-2xl font-extrabold text-foreground truncate">{totalExpected.toLocaleString()} <span className="text-xs xs:text-[10px] sm:text-xs md:text-sm text-muted font-medium">TZS</span></h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} className="text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] xs:text-xs uppercase tracking-wider font-bold text-muted mb-1 truncate">{t('dashboard_metrics.pool_balance')}</p>
            <h3 className="font-heading text-xl xs:text-lg sm:text-xl md:text-2xl font-extrabold text-foreground truncate">{currentPoolBalance.toLocaleString()} <span className="text-xs xs:text-[10px] sm:text-xs md:text-sm text-muted font-medium">TZS</span></h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-info/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 size={64} className="text-info" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] xs:text-xs uppercase tracking-wider font-bold text-muted mb-1 truncate">{t('dashboard_metrics.total_collected')}</p>
            <h3 className="font-heading text-xl xs:text-lg sm:text-xl md:text-2xl font-extrabold text-foreground truncate">{totalCollected.toLocaleString()} <span className="text-xs xs:text-[10px] sm:text-xs md:text-sm text-muted font-medium">TZS</span></h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md border border-border p-4 xs:p-5 rounded-2xl shadow-sm flex items-center gap-3 sm:gap-4 group hover:border-success/30 transition-colors">
          <div className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-border" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-success transition-all duration-1000 ease-out" strokeDasharray={`${progressPercentage}, 100`} strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-xs xs:text-sm font-bold text-foreground">{progressPercentage}%</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] xs:text-xs uppercase tracking-wider font-bold text-muted mb-1 truncate">{t('dashboard_metrics.progress')}</p>
            <p className="text-xs xs:text-[11px] sm:text-sm font-medium text-foreground truncate">{t('dashboard_metrics.goal_completion')}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-danger/5 border border-danger/20 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-danger/40 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle size={64} className="text-danger" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] xs:text-xs uppercase tracking-wider font-bold text-danger mb-1 flex items-center gap-1.5 truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
              {t('dashboard_metrics.total_overdue')}
            </p>
            <h3 className="font-heading text-xl xs:text-lg sm:text-xl md:text-2xl font-extrabold text-danger truncate">{totalOverdue.toLocaleString()} <span className="text-xs xs:text-[10px] sm:text-xs md:text-sm opacity-70 font-medium">TZS</span></h3>
          </div>
        </motion.div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Activity */}
        <motion.div variants={itemVariants} className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2">
                <Activity size={18} className="text-secondary" />
                {t('dashboard_metrics.recent_payments')}
              </h3>
              <span className="text-xs font-bold bg-muted/10 text-muted px-2.5 py-1 rounded-full">{recentPayments.length} {t('dashboard_metrics.transactions')}</span>
            </div>

            {recentPayments.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted text-sm font-medium">{t('dashboard_metrics.no_payments')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentPayments.map((payment, i) => {
                  const paymentDate = payment.createdAt?.seconds 
                    ? new Date(payment.createdAt.seconds * 1000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                    : 'Just now';
                  return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    key={payment.id} 
                    className="flex items-center justify-between gap-2 p-2.5 sm:p-4 rounded-xl hover:bg-foreground/5 transition-colors group cursor-pointer border border-transparent hover:border-border min-w-0"
                    onClick={() => onSelectContributorId(payment.contributorId)}
                  >
                    <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 group-hover:scale-110 transition-transform">
                        <User size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs xs:text-sm text-foreground truncate">{getContributorName(payment.contributorId)}</p>
                        <p className="text-[10px] xs:text-xs text-muted font-medium">{paymentDate}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs xs:text-sm text-success">+{payment.amount.toLocaleString()} TZS</p>
                      <p className="text-[9px] xs:text-[10px] sm:text-xs text-muted uppercase tracking-wider font-semibold">{payment.paymentMethod}</p>
                    </div>
                  </motion.div>
                )})}
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2">
                <Wallet size={18} className="text-primary" />
                {t('dashboard_metrics.recent_payouts')}
              </h3>
              <span className="text-xs font-bold bg-muted/10 text-muted px-2.5 py-1 rounded-full">{recentPayouts.length} {t('dashboard_metrics.disbursements')}</span>
            </div>

            {recentPayouts.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted text-sm font-medium">{t('dashboard_metrics.no_payouts')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentPayouts.map((payout, i) => {
                  return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    key={payout.id} 
                    className="flex items-center justify-between gap-2 p-2.5 sm:p-4 rounded-xl hover:bg-foreground/5 transition-colors group cursor-pointer border border-transparent hover:border-border min-w-0"
                    onClick={() => onSelectContributorId(payout.contributorId)}
                  >
                    <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                        <Wallet size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs xs:text-sm text-foreground truncate">{getContributorName(payout.contributorId)}</p>
                        <p className="text-[10px] xs:text-xs text-muted font-medium">{payout.payoutDate}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs xs:text-sm text-foreground">-{payout.amount.toLocaleString()} TZS</p>
                    </div>
                  </motion.div>
                )})}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Urgency & Upcoming */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          
          {/* Overdue Schedules */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-heading text-lg font-bold flex items-center gap-2 mb-4 text-danger">
              <AlertCircle size={18} />
              Needs Attention
            </h3>
            {overdueSchedules.length === 0 ? (
              <p className="text-sm text-muted">No overdue payments. Great job!</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {overdueSchedules.slice(0, 5).map(schedule => (
                  <div 
                    key={schedule.id}
                    onClick={() => onSelectContributorId(schedule.contributorId)}
                    className="flex flex-col p-3 rounded-lg bg-danger/5 border border-danger/10 cursor-pointer hover:bg-danger/10 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1 min-w-0">
                      <span className="font-bold text-sm truncate">{getContributorName(schedule.contributorId)}</span>
                      <span className="text-xs font-bold text-danger shrink-0">{schedule.remainingAmount.toLocaleString()} TZS</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted">
                      <span>Due: {schedule.dueDate}</span>
                      <ArrowRight size={14} className="text-danger opacity-50" />
                    </div>
                  </div>
                ))}
                {overdueSchedules.length > 5 && (
                  <p className="text-xs text-center text-muted font-medium pt-2">+{overdueSchedules.length - 5} more overdue</p>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Schedules */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-heading text-lg font-bold flex items-center gap-2 mb-4 text-foreground">
              <Calendar size={18} className="text-info" />
              Upcoming
            </h3>
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-muted">No upcoming schedules.</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {upcomingSchedules.slice(0, 5).map(schedule => (
                  <div 
                    key={schedule.id}
                    onClick={() => onSelectContributorId(schedule.contributorId)}
                    className="flex flex-col p-3 rounded-lg hover:bg-foreground/5 border border-transparent hover:border-border cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1 min-w-0">
                      <span className="font-bold text-sm text-foreground truncate">{getContributorName(schedule.contributorId)}</span>
                      <span className="text-xs font-bold shrink-0">{schedule.remainingAmount.toLocaleString()} TZS</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted">
                      <span className="flex items-center gap-1"><Clock size={12}/> {schedule.dueDate}</span>
                      <ArrowRight size={14} className="opacity-30" />
                    </div>
                  </div>
                ))}
                {upcomingSchedules.length > 5 && (
                  <p className="text-xs text-center text-muted font-medium pt-2">+{upcomingSchedules.length - 5} more upcoming</p>
                )}
              </div>
            )}
          </div>

        </motion.div>

      </div>
    </motion.div>
  );
};
