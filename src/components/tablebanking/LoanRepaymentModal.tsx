import React, { useState, useEffect } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
import type { Loan } from '../../context/JumuikaContext';
import { X, DollarSign, CreditCard, Landmark, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

interface LoanRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

const PAYMENT_METHODS = ['Cash', 'M-Pesa', 'Bank Transfer', 'Tigopesa', 'Airtel Money', 'Other'];

export const LoanRepaymentModal: React.FC<LoanRepaymentModalProps> = ({ isOpen, onClose, loan }) => {
  const { contributors, recordLoanRepayment } = useJumuika();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const contributor = loan ? contributors.find(c => c.id === loan.contributorId) : null;

  useEffect(() => {
    if (isOpen && loan) {
      setAmount(loan.remainingBalance.toString());
      setPaymentMethod('Cash');
      setError('');
    }
  }, [isOpen, loan]);

  if (!isOpen || !loan || !contributor) return null;

  const repaymentProgress = loan.totalRepayable > 0
    ? Math.min(100, Math.round((loan.amountRepaid / loan.totalRepayable) * 100))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setError('Enter a valid repayment amount');
      return;
    }
    if (numAmount > loan.remainingBalance) {
      setError(`Amount exceeds remaining balance (${loan.remainingBalance.toLocaleString()} TZS)`);
      return;
    }

    setError('');
    setSaving(true);
    try {
      await recordLoanRepayment(loan.id, numAmount, paymentMethod);
      const isFullyPaid = numAmount >= loan.remainingBalance;
      toast.success(isFullyPaid ? '🎉 Loan fully repaid!' : 'Repayment recorded!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record repayment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[400px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <Landmark size={18} className="text-sky-400" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">Record Repayment</h3>
              <p className="text-xs text-muted">{contributor.fullName}</p>
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
          {/* Loan Summary Card */}
          <div className="bg-foreground/5 rounded-xl p-4 border border-border/50 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted">Principal</p>
                <p className="font-bold text-foreground">{loan.principalAmount.toLocaleString()} TZS</p>
              </div>
              <div>
                <p className="text-xs text-muted">Interest ({loan.interestRate}%/mo)</p>
                <p className="font-bold text-sky-400">+{loan.interestAmount.toLocaleString()} TZS</p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Repayable</p>
                <p className="font-bold text-foreground">{loan.totalRepayable.toLocaleString()} TZS</p>
              </div>
              <div>
                <p className="text-xs text-muted">Remaining</p>
                <p className="font-bold text-danger">{loan.remainingBalance.toLocaleString()} TZS</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[10px] text-muted mb-1">
                <span>Repayment progress</span>
                <span className="font-bold">{repaymentProgress}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${repaymentProgress}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-xs text-muted border-t border-border/50 pt-2">
              <span>Due: <span className="font-semibold text-foreground">{loan.dueDate}</span></span>
              <span>Disbursed: <span className="font-semibold text-foreground">{loan.disbursementDate}</span></span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Repayment Amount (TZS) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <DollarSign size={16} />
                </div>
                <input
                  type="number"
                  step="any"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:bg-background"
                  placeholder={`Max: ${loan.remainingBalance.toLocaleString()}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={saving}
                  min={1}
                  max={loan.remainingBalance}
                />
              </div>
              {/* Quick-fill buttons */}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setAmount(loan.remainingBalance.toString())}
                  className="flex-1 text-xs font-semibold text-sky-400 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={12} /> Full Amount
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(Math.round(loan.remainingBalance / 2).toString())}
                  className="flex-1 text-xs font-semibold text-muted py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  Half
                </button>
              </div>
            </div>

            {/* Payment method */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Payment Method <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <CreditCard size={16} />
                </div>
                <select
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:bg-background appearance-none"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  disabled={saving}
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
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
                className="px-5 py-2 text-sm"
              >
                {saving ? 'Recording...' : 'Record Repayment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
