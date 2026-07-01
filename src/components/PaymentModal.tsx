import React, { useState, useEffect } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { X, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

interface PaymentModalProps {
  isOpen: boolean;
  contributorId: string | null;
  selectedScheduleId?: string | null;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  contributorId, 
  selectedScheduleId: initialSelectedScheduleId = null,
  onClose 
}) => {
  const { contributors, schedules, recordPayment } = useJumuika();
  
  // Selection states
  const [selectedInstId, setSelectedInstId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('M-Pesa');
  const [recordedBy, setRecordedBy] = useState<string>('Treasurer');
  const [notes, setNotes] = useState<string>('');
  
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const contributor = contributors.find(c => c.id === contributorId);

  // Sync initial selection
  useEffect(() => {
    if (initialSelectedScheduleId) {
      setSelectedInstId(initialSelectedScheduleId);
      const s = schedules.find(sched => sched.id === initialSelectedScheduleId);
      if (s) {
        setAmount(s.remainingAmount.toString());
      }
    } else {
      setSelectedInstId(null);
      setAmount('');
    }
  }, [initialSelectedScheduleId, isOpen]);

  if (!isOpen || !contributorId) return null;

  // Filter unpaid schedules for this contributor
  const unpaidSchedules = schedules
    .filter(s => s.contributorId === contributorId && s.remainingAmount > 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const handleSelectSchedule = (scheduleId: string, remainingAmount: number) => {
    if (selectedInstId === scheduleId) {
      setSelectedInstId(null);
      setAmount('');
    } else {
      setSelectedInstId(scheduleId);
      setAmount(remainingAmount.toString());
    }
  };

  const getApplicationDetails = () => {
    const paymentVal = Number(amount);
    if (isNaN(paymentVal) || paymentVal <= 0) return null;

    let text = '';
    let selectedSched = schedules.find(s => s.id === selectedInstId);
    
    if (selectedSched) {
      if (paymentVal < selectedSched.remainingAmount) {
        text = `This will record a partial payment of ${paymentVal.toLocaleString()} KES. The installment will have a remaining balance of ${(selectedSched.remainingAmount - paymentVal).toLocaleString()} KES.`;
      } else if (paymentVal === selectedSched.remainingAmount) {
        text = `This will fully pay this installment (${paymentVal.toLocaleString()} KES).`;
      } else {
        const excess = paymentVal - selectedSched.remainingAmount;
        text = `This will fully pay this installment (${selectedSched.remainingAmount.toLocaleString()} KES) and automatically cascade the remaining ${excess.toLocaleString()} KES to reduce future due balances.`;
      }
    } else {
      // General payment distribution
      let remaining = paymentVal;
      let paidCount = 0;
      let fullyPaid = 0;

      for (const s of unpaidSchedules) {
        if (remaining <= 0) break;
        const applied = Math.min(remaining, s.remainingAmount);
        remaining -= applied;
        paidCount++;
        if (applied >= s.remainingAmount) fullyPaid++;
      }

      if (paidCount > 0) {
        text = `This general payment of ${paymentVal.toLocaleString()} KES will be distributed: it will affect ${paidCount} installment(s), fully paying off ${fullyPaid} of them.`;
        if (remaining > 0) {
          text += ` The excess credit of ${remaining.toLocaleString()} KES will remain on the account to offset future scheduled bills.`;
        }
      } else {
        text = `The member has no outstanding scheduled balances. This entire payment of ${paymentVal.toLocaleString()} KES will be logged as overpayment credit.`;
      }
    }
    return text;
  };

  const appDetails = getApplicationDetails();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    setSaving(true);
    try {
      await recordPayment(
        contributorId,
        selectedInstId,
        paymentAmount,
        paymentMethod,
        recordedBy,
        notes
      );
      // Reset form
      setAmount('');
      setSelectedInstId(null);
      setNotes('');
      toast.success('Payment recorded successfully!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-lg border border-border animate-scale-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex flex-col">
            <h3 className="font-heading text-xl font-bold text-foreground">Record Payment</h3>
            <span className="text-sm text-muted">
              Receiving payment from <strong className="text-foreground">{contributor?.fullName}</strong>
            </span>
          </div>
          <button 
            className="p-2 bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-full transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.95]" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="p-3 mb-6 bg-danger/10 border border-danger/30 text-danger rounded-md text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {unpaidSchedules.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-muted">Tribute Installment to Pay (Optional / Cascade Select)</label>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto p-1">
                  {unpaidSchedules.map((s) => (
                    <div 
                      key={s.id}
                      className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all duration-fast ${selectedInstId === s.id ? 'bg-secondary/10 border-secondary' : 'bg-foreground/5 border-border hover:bg-foreground/10 hover:border-muted'}`}
                      onClick={() => handleSelectSchedule(s.id, s.remainingAmount)}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-[0.95rem]">
                          {s.frequency === 'one-time' ? 'One-time' : `Installment #${s.installmentNumber}`}
                        </span>
                        <span className="text-xs text-muted">Due: {s.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{s.remainingAmount.toLocaleString()} KES</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          s.status === 'Completed' ? 'bg-success/15 text-success' :
                          s.status === 'Partially Paid' ? 'bg-warning/15 text-warning' :
                          s.status === 'Due Today' ? 'bg-danger/15 text-danger' :
                          s.status === 'Overdue' ? 'bg-danger/15 text-danger' : 'bg-info/15 text-info'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted" htmlFor="amount">Payment Amount *</label>
              <input
                id="amount"
                type="number"
                className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="e.g. 30,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-muted" htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-muted" htmlFor="recordedBy">Recorded By</label>
                <input
                  id="recordedBy"
                  type="text"
                  className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted" htmlFor="notes">Payment Notes (Optional)</label>
              <input
                id="notes"
                type="text"
                className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="e.g. Received via M-Pesa transaction ref QX45..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {appDetails && (
              <div className="flex gap-3 p-4 bg-secondary/10 border border-secondary/30 rounded-lg mt-2">
                <Info size={18} className="text-secondary shrink-0 mt-0.5" />
                <div className="text-sm text-foreground leading-relaxed">{appDetails}</div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <Button 
                variant="ghost"
                type="button" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                type="submit" 
                isLoading={saving}
              >
                {saving ? 'Processing Payment...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
