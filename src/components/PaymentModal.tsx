import React, { useState, useEffect } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { X, Info, ChevronDown, User, Target, CreditCard, PenTool, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  // Selection states
  const [selectedInstId, setSelectedInstId] = useState<string | null>(null);
  const [selectedContributorId, setSelectedContributorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('M-Pesa');
  const [recordedBy, setRecordedBy] = useState<string>('Treasurer');
  const [notes, setNotes] = useState<string>('');
  
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedContributorId(contributorId);
    setSearchQuery('');
    setDropdownOpen(false);
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
  }, [contributorId, initialSelectedScheduleId, isOpen]);

  if (!isOpen) return null;

  const activeContributorId = selectedContributorId || contributorId;
  const contributor = contributors.find(c => c.id === activeContributorId);

  const unpaidSchedules = activeContributorId
    ? schedules
        .filter(s => s.contributorId === activeContributorId && s.remainingAmount > 0)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    : [];

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
        text = `Records partial payment. Remaining balance: ${(selectedSched.remainingAmount - paymentVal).toLocaleString()} TZS.`;
      } else if (paymentVal === selectedSched.remainingAmount) {
        text = `Fully pays this installment.`;
      } else {
        const excess = paymentVal - selectedSched.remainingAmount;
        text = `Fully pays this installment and cascades remaining ${excess.toLocaleString()} TZS.`;
      }
    } else {
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
        text = `Distributes to ${paidCount} installment(s), fully paying off ${fullyPaid}.`;
        if (remaining > 0) text += ` Leaves ${remaining.toLocaleString()} TZS credit.`;
      } else {
        text = `Logs entire ${paymentVal.toLocaleString()} TZS as overpayment credit.`;
      }
    }
    return text;
  };

  const appDetails = getApplicationDetails();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!activeContributorId) {
      setError('Please select a contributor first');
      return;
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    setSaving(true);
    try {
      await recordPayment(
        activeContributorId,
        selectedInstId,
        paymentAmount,
        paymentMethod,
        recordedBy,
        notes
      );
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

  const filteredContributors = contributors.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[500px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col">
            <h3 className="font-heading text-lg font-bold text-foreground">{t('add_payment')}</h3>
            <span className="text-xs text-muted">
              {contributorId ? (
                <>Receiving from <strong className="text-foreground">{contributor?.fullName}</strong></>
              ) : (
                'Select a member to record a payment'
              )}
            </span>
          </div>
          <button 
            className="p-1.5 bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-full transition-all focus:outline-none" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {error && (
            <div className="p-2.5 mb-4 bg-danger/10 border border-danger/20 text-danger rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!contributorId && (
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">{t('select_contributor')} <span className="text-danger">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User size={16} />
                  </div>
                  <button
                    type="button"
                    className="w-full pl-9 pr-10 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm text-left flex justify-between items-center transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className="truncate">
                      {contributor ? contributor.fullName : t('select_contributor')}
                    </span>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted">
                      <ChevronDown size={16} />
                    </div>
                  </button>
                </div>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-surface border border-border/50 rounded-xl mt-1 z-30 shadow-xl p-2 flex flex-col gap-2 max-h-60 overflow-y-auto backdrop-blur-xl">
                    <input
                      type="text"
                      placeholder={t('search_contributor')}
                      className="w-full p-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-secondary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex flex-col mt-1 max-h-40 overflow-y-auto">
                      {filteredContributors.length === 0 ? (
                        <div className="text-xs text-muted p-2 text-center">No members found</div>
                      ) : (
                        filteredContributors.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full p-2 text-left text-sm text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
                            onClick={() => {
                              setSelectedContributorId(c.id);
                              setDropdownOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            {c.fullName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeContributorId && unpaidSchedules.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Target Installment (Optional)</label>
                <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {unpaidSchedules.map((s) => (
                    <div 
                      key={s.id}
                      className={`flex justify-between items-center p-2.5 rounded-xl border cursor-pointer transition-all ${selectedInstId === s.id ? 'bg-secondary/10 border-secondary/50 shadow-sm' : 'bg-foreground/5 border-transparent hover:bg-foreground/10'}`}
                      onClick={() => handleSelectSchedule(s.id, s.remainingAmount)}
                    >
                      <div className="flex flex-col">
                        <span className={`font-semibold text-[0.9rem] ${selectedInstId === s.id ? 'text-secondary' : 'text-foreground'}`}>
                          {s.frequency === 'one-time' ? 'One-time' : `Inst #${s.installmentNumber}`}
                        </span>
                        <span className="text-[10px] text-muted font-medium">Due: {s.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${selectedInstId === s.id ? 'text-secondary' : 'text-foreground'}`}>{s.remainingAmount.toLocaleString()} TZS</span>
                        <div className={`w-2 h-2 rounded-full ${
                          s.status === 'Completed' ? 'bg-success' :
                          s.status === 'Partially Paid' ? 'bg-warning' :
                          s.status === 'Due Today' ? 'bg-danger' :
                          s.status === 'Overdue' ? 'bg-danger' : 'bg-info'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="amount">Payment Amount <span className="text-danger">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Target size={16} />
                </div>
                <input
                  id="amount"
                  type="number"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. 30,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="paymentMethod">Method</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <CreditCard size={16} />
                  </div>
                  <select
                    id="paymentMethod"
                    className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background appearance-none"
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
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="recordedBy">Recorded By</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <PenTool size={16} />
                  </div>
                  <input
                    id="recordedBy"
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                    value={recordedBy}
                    onChange={(e) => setRecordedBy(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="notes">Notes</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <AlignLeft size={16} />
                </div>
                <input
                  id="notes"
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. Ref QX45..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {appDetails && (
              <div className="flex gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-xl mt-1 items-start">
                <Info size={16} className="text-secondary shrink-0 mt-0.5" />
                <div className="text-xs text-foreground/80 leading-relaxed font-medium">{appDetails}</div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border/50">
              <Button 
                variant="ghost"
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                type="submit" 
                isLoading={saving}
                className="px-5 py-2 text-sm"
              >
                {saving ? 'Processing...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
