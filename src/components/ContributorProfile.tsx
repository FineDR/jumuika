import React, { useState } from 'react';
import { useJumuika, type Schedule } from '../context/JumuikaContext';
import { 
  ArrowLeft, Plus, DollarSign, Edit2, Trash2, 
  Clock, AlertCircle, X, Phone, FileText 
} from 'lucide-react';
import { Button } from './ui/Button';

interface ContributorProfileProps {
  contributorId: string;
  onBack: () => void;
  onOpenScheduleModal: (contributorId: string) => void;
  onOpenPaymentModal: (contributorId: string, scheduleId?: string | null) => void;
}

export const ContributorProfile: React.FC<ContributorProfileProps> = ({
  contributorId,
  onBack,
  onOpenScheduleModal,
  onOpenPaymentModal
}) => {
  const { contributors, schedules, deleteSchedule, editSchedule } = useJumuika();
  
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
          <h3 className="font-heading text-xl font-bold text-foreground mb-2">Contributor Not Found</h3>
          <p className="text-muted text-sm max-w-md">The contributor profile you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Filter contributor's schedules
  const contributorSchedules = schedules
    .filter(s => s.contributorId === contributorId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Calculations
  const totalScheduled = contributor.totalScheduled || 0;
  const totalPaid = contributor.totalPaid || 0;
  const remainingBalance = contributor.remainingBalance ?? (totalScheduled - totalPaid);

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
    if (window.confirm('Are you sure you want to delete this scheduled installment? This will update the contributor total scheduled amount.')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (err) {
        alert('Failed to delete schedule installment');
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
      alert('Amount must be greater than 0');
      return;
    }

    try {
      await editSchedule(editingSchedule.id, editAmount, editDueDate);
      setEditingSchedule(null);
    } catch (err) {
      alert('Failed to edit scheduled installment');
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
          <ArrowLeft size={16} /> Back to Contributors
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-start">
        {/* Left Side: Summary Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm sticky top-24">
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
                <FileText size={12} /> Notes
              </div>
              <p className="italic text-foreground/80 break-words leading-relaxed">{contributor.notes}</p>
            </div>
          )}

          <div className="flex flex-col gap-1 mb-6">
            <div className="flex justify-between py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted">Total Scheduled</span>
              <span className="font-bold text-foreground">{totalScheduled.toLocaleString()} KES</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted">Total Paid</span>
              <span className="font-bold text-success">{totalPaid.toLocaleString()} KES</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted">Remaining Balance</span>
              <span className={`font-bold ${remainingBalance > 0 ? 'text-warning' : 'text-muted'}`}>
                {remainingBalance.toLocaleString()} KES
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/50 border-dashed mt-1">
              <span className="text-sm font-medium text-muted">Overdue Balance</span>
              <span className="font-bold text-danger">{overdueAmount.toLocaleString()} KES</span>
            </div>
            {nextDueSchedule && (
              <div className="flex justify-between py-3 border-b border-border/50 border-dashed">
                <span className="text-sm font-medium text-muted">Next Payment Due</span>
                <span className="font-bold text-info text-right">
                  {nextDueSchedule.remainingAmount.toLocaleString()} KES <br/>
                  <span className="text-xs text-muted font-normal">({nextDueSchedule.dueDate})</span>
                </span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm font-bold text-foreground mb-2">
              <span>Payment Progress</span>
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
              <Plus size={18} /> Schedule Contribution
            </Button>
            <Button 
              variant="primary"
              size="lg"
              className="w-full gap-2"
              onClick={() => onOpenPaymentModal(contributorId)}
            >
              <DollarSign size={18} /> Record Payment
            </Button>
          </div>
        </div>

        {/* Right Side: Schedule Timeline */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-heading text-2xl font-bold text-foreground mb-8">Payment Schedule</h3>

          {contributorSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-border rounded-xl">
              <Clock size={48} className="text-muted/50 mb-4" />
              <p className="text-foreground font-medium mb-6">No contributions scheduled for this member yet.</p>
              <Button 
                variant="outline"
                onClick={() => onOpenScheduleModal(contributorId)}
              >
                Schedule First Contribution
              </Button>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-border/50 ml-2 sm:ml-4 space-y-8">
              {contributorSchedules.map((schedule) => {
                const isPaid = schedule.status === 'Completed';
                const isPartiallyPaid = schedule.status === 'Partially Paid';
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
                            {new Date(schedule.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 bg-foreground/5 text-muted rounded-md uppercase tracking-wider">
                            {schedule.frequency === 'one-time' ? 'One-time' : `Inst. ${schedule.installmentNumber}`}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm ${badgeBg.replace('/20', '')}`}>
                            {schedule.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-foreground mt-1">
                          Amount: <strong className="font-bold">{schedule.amount.toLocaleString()} KES</strong>
                          {(schedule.amountPaid > 0) && (
                            <span className="text-muted ml-2">| Paid: <span className="text-success font-bold">{schedule.amountPaid.toLocaleString()} KES</span></span>
                          )}
                          {(!isPaid && schedule.amountPaid > 0) && (
                            <span className="text-muted ml-2">| Due: <span className="text-warning font-bold">{schedule.remainingAmount.toLocaleString()} KES</span></span>
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
                            Pay
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
                            {isPaid ? 'Locked' : 'Locked (Partial)'}
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
      </div>

      {/* Edit schedule modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h3 className="font-heading text-xl font-bold text-foreground">Edit Installment</h3>
              <button 
                className="p-2 text-muted hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors"
                onClick={() => setEditingSchedule(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-muted" htmlFor="editAmount">Installment Amount *</label>
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
                <label className="text-sm font-semibold text-muted" htmlFor="editDueDate">Due Date *</label>
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
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  type="submit" 
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
