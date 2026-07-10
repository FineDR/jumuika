import React, { useState } from 'react';
import { useLocoo, type Schedule } from '../../context/LocooContext';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Plus, DollarSign, Edit2, Trash2, 
  Clock, AlertCircle, X, Phone, FileText, Wallet
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ContributorProfileProps {
  contributorId: string;
  onBack: () => void;
  onOpenScheduleModal: (contributorId: string) => void;
  onOpenPaymentModal: (contributorId: string, scheduleId?: string | null) => void;
  onOpenPayoutModal: (contributorId: string) => void;
}

export const ContributorProfile: React.FC<ContributorProfileProps> = ({
  contributorId,
  onBack,
  onOpenScheduleModal,
  onOpenPaymentModal,
  onOpenPayoutModal
}) => {
  const { contributors, schedules, payouts, deleteSchedule, editSchedule } = useLocoo();
  const { t } = useTranslation();
  
  // Edit schedule inline modal state
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDueDate, setEditDueDate] = useState<string>('');

  const contributor = contributors.find(c => c.id === contributorId);

  if (!contributor) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
        <Button 
          variant="ghost"
          onClick={onBack}
          className="mb-4 gap-2"
        >
          <ArrowLeft size={16} /> Back to list
        </Button>
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl">
          <AlertCircle size={48} className="text-danger mb-4" />
          <h3 className="font-heading text-xl font-bold text-foreground mb-2">{t('profile.not_found')}</h3>
          <p className="text-muted text-sm max-w-md">{t('profile.not_found_desc')}</p>
        </div>
      </div>
    );
  }

  // Filter contributor's schedules
  const contributorSchedules = schedules
    .filter(s => s.contributorId === contributorId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Filter contributor's payouts
  const contributorPayouts = payouts
    .filter(p => p.contributorId === contributorId)
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.now();
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.now();
      return timeB - timeA;
    });

  // Calculations
  const totalScheduled = contributor.totalScheduled || 0;
  const totalPaid = contributor.totalPaid || 0;
  const remainingBalance = contributor.remainingBalance ?? (totalScheduled - totalPaid);
  const totalReceived = contributorPayouts.reduce((sum, p) => sum + p.amount, 0);

  // Overdue payments sum
  const overdueSchedules = contributorSchedules.filter(s => s.status === 'Overdue');
  const overdueAmount = overdueSchedules.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  // Find next due payment
  const unpaidSchedules = contributorSchedules.filter(s => s.remainingAmount > 0);
  const nextDueSchedule = unpaidSchedules.length > 0 ? unpaidSchedules[0] : null;

  // Percentage progress
  const progressPercent = totalScheduled > 0 
    ? Math.min(100, Math.round((totalPaid / totalScheduled) * 100)) 
    : 0;

  // Handle schedule deletion
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm(t('profile.confirm_delete_schedule'))) {
      try {
        await deleteSchedule(scheduleId);
      } catch (err) {
        alert(t('profile.failed_delete_schedule'));
      }
    }
  };

  // Open inline edit modal
  const handleOpenEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditAmount(schedule.amount);
    setEditDueDate(schedule.dueDate);
  };

  // Save edited schedule
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    if (editAmount <= 0) {
      alert(t('profile.amount_greater_zero'));
      return;
    }

    try {
      await editSchedule(editingSchedule.id, editAmount, editDueDate);
      setEditingSchedule(null);
    } catch (err) {
      alert(t('profile.failed_edit_schedule'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button 
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft size={16} /> {t('profile.back_to_contributors')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-start">
        {/* Left Side: Summary Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-5 mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary/80 text-white font-heading font-bold text-2xl shadow-inner">
              {contributor.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h3 className="font-heading text-xl font-bold text-foreground">{contributor.fullName}</h3>
              {contributor.phone && (
                <p className="flex items-center gap-1.5 text-sm text-muted mt-1">
                  <Phone size={14} /> {contributor.phone}
                </p>
              )}
            </div>
          </div>

          {contributor.notes && (
            <div className="bg-foreground/5 border border-border rounded-xl p-4 text-sm mb-6">
              <div className="flex items-center gap-2 text-muted font-semibold text-xs uppercase tracking-wider mb-1.5">
                <FileText size={12} /> {t('profile.notes')}
              </div>
              <p className="italic text-foreground/80 break-words leading-relaxed">{contributor.notes}</p>
            </div>
          )}

          <div className="flex flex-col gap-1 mb-6">
            <div className="flex justify-between py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted">{t('profile.total_scheduled')}</span>
              <span className="font-bold text-foreground">{totalScheduled.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted">{t('profile.total_paid')}</span>
              <span className="font-bold text-success">{totalPaid.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/50 bg-primary/5 px-3 -mx-3 rounded-xl">
              <span className="text-sm font-bold text-primary flex items-center gap-1.5"><Wallet size={14}/> {t('profile.total_received')}</span>
              <span className="font-bold text-primary">{totalReceived.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted">{t('profile.remaining_balance')}</span>
              <span className={`font-bold ${remainingBalance > 0 ? 'text-warning' : 'text-muted'}`}>
                {remainingBalance.toLocaleString()} TZS
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/50 border-dashed mt-1">
              <span className="text-sm font-medium text-muted">{t('profile.overdue_balance')}</span>
              <span className="font-bold text-danger">{overdueAmount.toLocaleString()} TZS</span>
            </div>
            {nextDueSchedule && (
              <div className="flex justify-between py-3 border-b border-border/50 border-dashed">
                <span className="text-sm font-medium text-muted">{t('profile.next_payment_due')}</span>
                <span className="font-bold text-info text-right">
                  {nextDueSchedule.remainingAmount.toLocaleString()} TZS <br/>
                  <span className="text-xs text-muted font-normal">({nextDueSchedule.dueDate})</span>
                </span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm font-bold text-foreground mb-2">
              <span>{t('profile.payment_progress')}</span>
              <span className="text-secondary">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-foreground/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-success transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              variant="secondary"
              size="lg"
              className="w-full gap-2"
              onClick={() => onOpenScheduleModal(contributorId)}
            >
              <Plus size={18} /> {t('profile.schedule_contribution')}
            </Button>
            <Button 
              variant="primary"
              size="lg"
              className="w-full gap-2"
              onClick={() => onOpenPaymentModal(contributorId)}
            >
              <DollarSign size={18} /> {t('profile.record_payment')}
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="w-full gap-2 border-border/50"
              onClick={() => onOpenPayoutModal(contributorId)}
            >
              <Wallet size={18} /> {t('profile.record_payout')}
            </Button>
          </div>
        </div>

        {/* Right Side: Schedule Timeline */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-heading text-2xl font-bold text-foreground mb-8">{t('profile.payment_schedule')}</h3>

          {contributorSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-border rounded-xl">
              <Clock size={48} className="text-muted/50 mb-4" />
              <p className="text-foreground font-medium mb-6">{t('profile.no_contributions')}</p>
              <Button 
                variant="outline"
                onClick={() => onOpenScheduleModal(contributorId)}
              >
                {t('profile.schedule_first_contribution')}
              </Button>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-border/50 ml-2 sm:ml-4 space-y-8">
              {contributorSchedules.map((schedule) => {
                const isPaid = schedule.status === 'Completed';
                // Check for partially paid status
                const canModify = schedule.amountPaid === 0;

                const statusColors: Record<string, string> = {
                  'Completed': 'bg-success border-success text-success text-success-foreground',
                  'Partially Paid': 'bg-info border-info text-info text-info-foreground',
                  'Due Today': 'bg-warning border-warning text-warning text-warning-foreground',
                  'Overdue': 'bg-danger border-danger text-danger text-danger-foreground',
                  'Upcoming': 'bg-foreground/20 border-foreground/30 text-muted'
                };

                const badgeBg = statusColors[schedule.status]?.split(' ')[0] || 'bg-foreground/20';
                const nodeColorClass = statusColors[schedule.status]?.split(' ')[1] || 'border-border';
                const nodeFillClass = statusColors[schedule.status]?.split(' ')[0] || 'bg-background';

                return (
                  <div key={schedule.id} className="relative group">
                    {/* Node */}
                    <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-4 h-4 rounded-full border-[3px] z-10 ${nodeColorClass} ${nodeFillClass} shadow-sm group-hover:scale-125 transition-transform`}></div>
                    
                    {/* Content */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 bg-foreground/[0.02] hover:bg-foreground/[0.04] border border-border hover:border-foreground/20 rounded-xl transition-all shadow-sm group-hover:shadow-md">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-heading font-bold text-lg text-foreground">
                            {(() => {
                              const d = new Date(schedule.dueDate);
                              const dayNum = d.getDate();
                              const monthIdx = d.getMonth();
                              const yearNum = d.getFullYear();
                              const shortMonthName = t(`calendar_view.months_short.${monthIdx}`);
                              return `${dayNum} ${shortMonthName} ${yearNum}`;
                            })()}
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 bg-foreground/5 text-muted rounded-md uppercase tracking-wider">
                            {schedule.frequency === 'one-time' ? t('profile.one_time') : `${t('profile.inst')} ${schedule.installmentNumber}`}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm ${badgeBg.replace('/20', '')}`}>
                            {t(`status.${schedule.status.toLowerCase().replace(' ', '_')}`)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-foreground mt-1">
                          {t('profile.amount')} <strong className="font-bold">{schedule.amount.toLocaleString()} TZS</strong>
                          {(schedule.amountPaid > 0) && (
                            <span className="text-muted ml-2">| {t('profile.paid')} <span className="text-success font-bold">{schedule.amountPaid.toLocaleString()} TZS</span></span>
                          )}
                          {(!isPaid && schedule.amountPaid > 0) && (
                            <span className="text-muted ml-2">| {t('profile.due')} <span className="text-warning font-bold">{schedule.remainingAmount.toLocaleString()} TZS</span></span>
                          )}
                        </div>
                        
                        {schedule.notes && <div className="text-sm italic text-muted mt-1">{schedule.notes}</div>}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isPaid && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onOpenPaymentModal(contributorId, schedule.id)}
                          >
                            {t('profile.pay_btn')}
                          </Button>
                        )}
                        {canModify ? (
                          <div className="flex items-center gap-1">
                            <button
                              className="p-2 text-muted hover:text-info hover:bg-info/10 rounded-lg transition-colors"
                              onClick={() => handleOpenEditModal(schedule)}
                              title="Edit installment details"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              title="Delete scheduled installment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted/70 italic px-2">
                            {isPaid ? t('profile.locked') : t('profile.locked_partial')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Payouts History */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Wallet size={20} className="text-primary"/> {t('profile.payouts_history')}
          </h3>

          {contributorPayouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center border-2 border-dashed border-border rounded-xl">
              <p className="text-muted text-sm font-medium">{t('profile.no_payouts')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {contributorPayouts.map((payout) => (
                <div 
                  key={payout.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-foreground/5 border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-foreground">{payout.payoutDate}</span>
                    {payout.notes && <span className="text-xs text-muted italic">{payout.notes}</span>}
                  </div>
                  <span className="font-bold text-sm text-primary">+{payout.amount.toLocaleString()} TZS</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit schedule modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h3 className="font-heading text-xl font-bold text-foreground">{t('profile.edit_installment')}</h3>
              <button 
                className="p-2 text-muted hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors"
                onClick={() => setEditingSchedule(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-muted" htmlFor="editAmount">{t('profile.installment_amount')}</label>
                <input
                  id="editAmount"
                  type="number"
                  className="w-full p-3 bg-background border border-border rounded-lg text-foreground font-sans focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-muted" htmlFor="editDueDate">{t('profile.due_date')}</label>
                <input
                  id="editDueDate"
                  type="date"
                  className="w-full p-3 bg-background border border-border rounded-lg text-foreground font-sans focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/50">
                <Button 
                  variant="ghost"
                  type="button" 
                  onClick={() => setEditingSchedule(null)}
                >
                  {t('profile.cancel')}
                </Button>
                <Button 
                  variant="primary"
                  type="submit" 
                >
                  {t('profile.save_changes')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
