import React, { useState, useEffect } from 'react';
import { useLocoo } from '../../context/LocooContext';
import { X, User, DollarSign, Percent, Calendar, AlignLeft, Landmark, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

interface IssueLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IssueLoanModal: React.FC<IssueLoanModalProps> = ({ isOpen, onClose }) => {
  const { contributors, payments, payouts, loans, currentEventId, issueLoan } = useLocoo();

  const [contributorId, setContributorId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('10');
  const [disbursementDate, setDisbursementDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const eventContributors = contributors.filter(c => c.eventId === currentEventId);

  // Calculate available pool balance
  const availablePoolBalance = React.useMemo(() => {
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
    return totalCollected - totalPayouts;
  }, [payments, payouts]);

  // Loan preview calculations
  const loanPreview = React.useMemo(() => {
    const principal = Number(principalAmount);
    const rate = Number(interestRate);
    if (!principal || !rate || !disbursementDate || !dueDate) return null;
    const start = new Date(disbursementDate);
    const end = new Date(dueDate);
    if (end <= start) return null;
    const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const interest = Math.round(principal * (rate / 100) * months);
    const total = principal + interest;
    return { months, interest, total };
  }, [principalAmount, interestRate, disbursementDate, dueDate]);

  useEffect(() => {
    if (isOpen) {
      setContributorId(eventContributors.length > 0 ? eventContributors[0].id : '');
      setPrincipalAmount('');
      setInterestRate('10');
      setDisbursementDate(new Date().toLocaleDateString('en-CA'));
      setDueDate('');
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const principal = Number(principalAmount);
    const rate = Number(interestRate);

    if (!contributorId) { setError('Please select a member'); return; }
    if (!principal || principal <= 0) { setError('Enter a valid loan amount'); return; }
    if (principal > availablePoolBalance) {
      setError(`Loan amount exceeds available pool balance (${availablePoolBalance.toLocaleString()} TZS)`);
      return;
    }
    if (!rate || rate <= 0) { setError('Enter a valid interest rate'); return; }
    if (!disbursementDate) { setError('Disbursement date is required'); return; }
    if (!dueDate) { setError('Due date is required'); return; }
    if (new Date(dueDate) <= new Date(disbursementDate)) {
      setError('Due date must be after disbursement date'); return;
    }

    // Check if member already has an active loan
    const existingActiveLoan = loans.find(
      l => l.contributorId === contributorId && l.eventId === currentEventId && l.status === 'Active'
    );
    if (existingActiveLoan) {
      setError('This member already has an active loan. Please settle it before issuing a new one.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await issueLoan(contributorId, principal, rate, disbursementDate, dueDate, notes.trim());
      toast.success('Loan issued successfully!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to issue loan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[460px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <Landmark size={18} className="text-sky-400" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">Issue Loan</h3>
              <p className="text-xs text-muted mt-0.5">Available Pool: <span className="font-bold text-sky-400">{availablePoolBalance.toLocaleString()} TZS</span></p>
            </div>
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
            <div className="flex items-start gap-2.5 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-xl">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Member */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Member <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <User size={16} />
                </div>
                <select
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:bg-background appearance-none"
                  value={contributorId}
                  onChange={e => setContributorId(e.target.value)}
                  disabled={saving}
                >
                  {eventContributors.length === 0 && <option value="">No members yet</option>}
                  {eventContributors.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Principal Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Loan Amount (TZS) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <DollarSign size={16} />
                </div>
                <input
                  type="number"
                  step="any"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:bg-background"
                  placeholder={`Max: ${availablePoolBalance.toLocaleString()}`}
                  value={principalAmount}
                  onChange={e => setPrincipalAmount(e.target.value)}
                  disabled={saving}
                  min={1}
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Interest Rate (% per month) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Percent size={16} />
                </div>
                <input
                  type="number"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:bg-background"
                  placeholder="e.g. 10"
                  value={interestRate}
                  onChange={e => setInterestRate(e.target.value)}
                  disabled={saving}
                  min={0.1}
                  step="any"
                />
              </div>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Disbursement Date <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Calendar size={14} />
                  </div>
                  <input
                    type="date"
                    className="w-full pl-8 pr-2 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:bg-background"
                    value={disbursementDate}
                    onChange={e => setDisbursementDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Due Date <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Calendar size={14} />
                  </div>
                  <input
                    type="date"
                    className="w-full pl-8 pr-2 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:bg-background"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    disabled={saving}
                    min={disbursementDate}
                  />
                </div>
              </div>
            </div>

            {/* Loan Preview */}
            {loanPreview && (
              <div className="p-4 bg-sky-500/8 border border-sky-500/20 rounded-xl flex flex-col gap-2">
                <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Loan Summary Preview</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[10px] text-muted">Duration</p>
                    <p className="text-sm font-bold text-foreground">{loanPreview.months} mo.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted">Interest</p>
                    <p className="text-sm font-bold text-sky-400">+{loanPreview.interest.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted">Total Repayable</p>
                    <p className="text-sm font-bold text-foreground">{loanPreview.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Notes</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-muted">
                  <AlignLeft size={16} />
                </div>
                <textarea
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:bg-background resize-y min-h-[70px]"
                  placeholder="e.g. Business expansion loan"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
              <Button variant="ghost" type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm">
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={saving}
                className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-500/90"
                disabled={eventContributors.length === 0 || availablePoolBalance <= 0}
              >
                {saving ? 'Issuing...' : 'Issue Loan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
