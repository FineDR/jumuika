import React, { useState, useEffect } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { X, Calendar, AlignLeft, DollarSign, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributorId: string | null;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({ isOpen, onClose, contributorId }) => {
  const { addPayout, contributors, payments, payouts } = useJumuika();
  const contributor = contributors.find(c => c.id === contributorId);
  
  const [amount, setAmount] = useState('');
  const [payoutDate, setPayoutDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Calculate current pool balance
  const currentPoolBalance = React.useMemo(() => {
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
    return totalCollected - totalPayouts;
  }, [payments, payouts]);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setPayoutDate(new Date().toLocaleDateString('en-CA'));
      setNotes('');
      setError('');
    }
  }, [isOpen, contributorId]);

  if (!isOpen || !contributor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numAmount > currentPoolBalance) {
      setError(`Cannot payout more than the current pool balance (${currentPoolBalance.toLocaleString()} TZS)`);
      return;
    }

    if (!payoutDate) {
      setError('Payout Date is required');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await addPayout(
        contributor.id,
        numAmount,
        payoutDate,
        notes.trim()
      );
      toast.success('Payout recorded successfully!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[400px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Wallet size={16} />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">Record Payout</h3>
          </div>
          <button 
            className="p-1.5 bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-full transition-all focus:outline-none" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="bg-foreground/5 rounded-xl p-4 mb-5 border border-border/50">
            <p className="text-sm text-muted mb-1">Paying out to:</p>
            <p className="font-bold text-foreground text-lg">{contributor.fullName}</p>
            <div className="mt-2 flex justify-between items-center text-sm border-t border-border/50 pt-2">
              <span className="text-muted">Available Pool Balance:</span>
              <span className="font-bold text-success">{currentPoolBalance.toLocaleString()} TZS</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="payoutAmount">Amount (TZS) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <DollarSign size={16} />
                </div>
                <input
                  id="payoutAmount"
                  type="number"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus:bg-background"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="payoutDate">Payout Date *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Calendar size={16} />
                </div>
                <input
                  id="payoutDate"
                  type="date"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus:bg-background"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="payoutNotes">Notes</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-muted">
                  <AlignLeft size={16} />
                </div>
                <textarea
                  id="payoutNotes"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus:bg-background resize-y min-h-[80px]"
                  placeholder="e.g. March cycle payout"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border/50">
              <Button 
                variant="ghost"
                type="button" 
                onClick={onClose}
                disabled={saving}
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
                {saving ? 'Recording...' : 'Record Payout'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
