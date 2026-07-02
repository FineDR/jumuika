import React, { useState } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
import { X, Users, DollarSign, Calendar, AlignLeft, Repeat, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

interface BulkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-Time (e.g. funeral, harambee)' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Biweekly', label: 'Bi-weekly' },
  { value: 'Daily', label: 'Daily' },
];

export const BulkScheduleModal: React.FC<BulkScheduleModalProps> = ({ isOpen, onClose }) => {
  const { bulkScheduleAll, contributors, currentEventId, events } = useJumuika();

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [frequency, setFrequency] = useState('one-time');
  const [installmentsCount, setInstallmentsCount] = useState('1');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentEvent = events.find(e => e.id === currentEventId);
  const memberCount = contributors.filter(c => c.eventId === currentEventId).length;
  const isInstallment = frequency !== 'one-time';
  const parsedAmount = Number(amount) || 0;
  const parsedInstallments = Math.max(1, Number(installmentsCount) || 1);
  const totalPerMember = parsedAmount;
  const totalAllMembers = parsedAmount * memberCount;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parsedAmount <= 0) {
      setError('Amount is required');
      return;
    }
    if (!dueDate) {
      setError('Date is required');
      return;
    }
    if (memberCount === 0) {
      setError('No members in this event to schedule');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const count = await bulkScheduleAll(
        isInstallment ? 'installment' : 'one-time',
        parsedAmount,
        dueDate,
        frequency,
        isInstallment ? parsedInstallments : 1,
        notes.trim()
      );
      toast.success(`Schedules created for ${count} member${count !== 1 ? 's' : ''}!`);
      setAmount('');
      setNotes('');
      setFrequency('one-time');
      setInstallmentsCount('1');
      setDueDate(new Date().toLocaleDateString('en-CA'));
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create schedules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[460px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Schedule All Members</h3>
            <p className="text-xs text-muted mt-0.5">
              {currentEvent ? currentEvent.name : 'Current Event'} · {memberCount} member{memberCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            className="p-1.5 bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-full transition-all focus:outline-none"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {error && (
            <div className="p-2.5 bg-danger/10 border border-danger/20 text-danger rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Summary Banner */}
          <div className="flex items-center gap-3 px-4 py-3 bg-secondary/8 border border-secondary/20 rounded-xl">
            <Users size={18} className="text-secondary shrink-0" />
            <p className="text-sm text-foreground font-medium">
              This will create a schedule for{' '}
              <span className="font-bold text-secondary">{memberCount} member{memberCount !== 1 ? 's' : ''}</span> at once.
              {parsedAmount > 0 && (
                <> Total pool: <span className="font-bold text-secondary">{totalAllMembers.toLocaleString()} TZS</span></>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Frequency */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="bulkFrequency">
                <span className="flex items-center gap-1.5"><Repeat size={12} /> Payment Type <span className="text-danger">*</span></span>
              </label>
              <select
                id="bulkFrequency"
                className="w-full px-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                disabled={saving}
              >
                {FREQUENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="bulkAmount">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={12} />
                  {isInstallment ? 'Total Amount per Member (TZS)' : 'Amount per Member (TZS)'}
                  <span className="text-danger">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <DollarSign size={16} />
                </div>
                <input
                  id="bulkAmount"
                  type="number"
                  min="1"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50"
                  placeholder="e.g. 5,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            {/* Installments count (only for installment type) */}
            {isInstallment && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="bulkInstallments">
                  <span className="flex items-center gap-1.5"><Hash size={12} /> Number of Installments <span className="text-danger">*</span></span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Hash size={16} />
                  </div>
                  <input
                    id="bulkInstallments"
                    type="number"
                    min="2"
                    max="60"
                    className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50"
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(e.target.value)}
                    disabled={saving}
                  />
                </div>
                {parsedAmount > 0 && parsedInstallments > 1 && (
                  <p className="text-xs text-muted">
                    ≈ {Math.floor(parsedAmount / parsedInstallments).toLocaleString()} TZS per installment
                  </p>
                )}
              </div>
            )}

            {/* Due Date / Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="bulkDueDate">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {isInstallment ? 'Start Date' : 'Due Date'}
                  <span className="text-danger">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Calendar size={16} />
                </div>
                <input
                  id="bulkDueDate"
                  type="date"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="bulkNotes">
                <span className="flex items-center gap-1.5"><AlignLeft size={12} /> Notes (Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-muted">
                  <AlignLeft size={16} />
                </div>
                <textarea
                  id="bulkNotes"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 resize-y min-h-[60px]"
                  placeholder={frequency === 'one-time' ? 'e.g. Funeral support – Mama Agnes' : 'e.g. Monthly Chama contribution'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Summary line */}
            {parsedAmount > 0 && memberCount > 0 && (
              <div className="px-4 py-3 bg-foreground/[0.03] border border-border/50 rounded-xl text-xs text-muted font-medium space-y-1">
                <div className="flex justify-between">
                  <span>Per member</span>
                  <span className="font-bold text-foreground">{totalPerMember.toLocaleString()} TZS</span>
                </div>
                <div className="flex justify-between">
                  <span>Total members</span>
                  <span className="font-bold text-foreground">{memberCount}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                  <span>Expected pool total</span>
                  <span className="font-bold text-secondary">{totalAllMembers.toLocaleString()} TZS</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
              <Button variant="ghost" type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={saving} className="px-5 py-2 text-sm gap-2">
                {saving ? 'Scheduling...' : `Schedule ${memberCount} Member${memberCount !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
