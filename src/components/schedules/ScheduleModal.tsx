import React, { useState, useEffect } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
import { generateInstallmentDates } from '../../utils/schedules';
import { X, Calendar, AlignLeft, Target, Hash, Repeat } from 'lucide-react';
import { Button } from '../ui/Button';

interface ScheduleModalProps {
  isOpen: boolean;
  contributorId: string | null;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, contributorId, onClose }) => {
  const { currentEventId, events, contributors, addSchedule, schedules } = useJumuika();
  const [activeOption, setActiveOption] = useState<'one-time' | 'installment'>('one-time');

  // Track existing unpaid schedules
  const existingUnpaid = schedules.filter(s => s.contributorId === contributorId && s.amountPaid === 0);
  const existingUnpaidAmount = existingUnpaid.reduce((sum, s) => sum + s.amount, 0);
  const showReplaceOption = existingUnpaid.length > 0;
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Form Fields
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [notes, setNotes] = useState<string>('');

  const [totalTarget, setTotalTarget] = useState<string>('');
  const [installments, setInstallments] = useState<string>('4');
  const [frequency, setFrequency] = useState<string>('Monthly');
  const [startDate, setStartDate] = useState<string>(new Date().toLocaleDateString('en-CA'));

  const [previewInstallments, setPreviewInstallments] = useState<{ number: number; date: string; amount: number }[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const contributor = contributors.find(c => c.id === contributorId);
  const currentEvent = events.find(e => e.id === currentEventId);

  useEffect(() => {
    if (isOpen) {
      if (currentEvent?.targetAmount) {
        setAmount(currentEvent.targetAmount.toString());
        setTotalTarget(currentEvent.targetAmount.toString());
      } else {
        setAmount('');
        setTotalTarget('');
      }
      setDueDate(new Date().toLocaleDateString('en-CA'));
      setStartDate(new Date().toLocaleDateString('en-CA'));
      setNotes('');
      setReplaceExisting(false);
    }
  }, [isOpen, currentEvent?.targetAmount]);

  useEffect(() => {
    if (activeOption === 'installment') {
      const targetVal = Number(totalTarget);
      const countVal = Number(installments);
      
      if (targetVal > 0 && countVal > 0 && startDate) {
        const dates = generateInstallmentDates(startDate, countVal, frequency);
        const baseAmount = Math.floor(targetVal / countVal);
        const remainder = targetVal - (baseAmount * countVal);
        
        const preview = Array.from({ length: countVal }, (_, i) => ({
          number: i + 1,
          date: dates[i],
          amount: i === 0 ? baseAmount + remainder : baseAmount
        }));
        
        setPreviewInstallments(preview);
      } else {
        setPreviewInstallments([]);
      }
    }
  }, [totalTarget, installments, frequency, startDate, activeOption]);

  if (!isOpen || !contributorId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const isOneTime = activeOption === 'one-time';
    const amountVal = isOneTime ? Number(amount) : Number(totalTarget);
    const countVal = isOneTime ? 1 : Number(installments);
    const dateVal = isOneTime ? dueDate : startDate;

    if (amountVal <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (countVal <= 0) {
      setError('Number of installments must be greater than 0');
      return;
    }

    if (!dateVal) {
      setError('A valid date is required');
      return;
    }

    setSaving(true);
    try {
      let replaceAmt = 0;
      let toDelete: string[] = [];
      if (replaceExisting && existingUnpaid.length > 0) {
        replaceAmt = existingUnpaidAmount;
        toDelete = existingUnpaid.map(s => s.id);
      }

      await addSchedule(
        contributorId,
        isOneTime ? 'one-time' : 'installment',
        amountVal,
        dateVal,
        countVal,
        frequency,
        notes,
        replaceAmt,
        toDelete
      );
      setAmount('');
      setTotalTarget('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[480px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col">
            <h3 className="font-heading text-lg font-bold text-foreground">Schedule Plan</h3>
            <span className="text-xs text-muted">
              For <strong className="text-foreground">{contributor?.fullName}</strong>
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

          <div className="flex gap-1 p-1 bg-foreground/5 border border-border/50 rounded-lg mb-5 relative">
            <button 
              type="button"
              className={`flex-1 text-center py-2 rounded-md font-semibold text-xs transition-all z-10 ${activeOption === 'one-time' ? 'text-foreground shadow-sm bg-surface' : 'text-muted hover:text-foreground'}`}
              onClick={() => setActiveOption('one-time')}
            >
              One-Time Payment
            </button>
            <button 
              type="button"
              className={`flex-1 text-center py-2 rounded-md font-semibold text-xs transition-all z-10 ${activeOption === 'installment' ? 'text-foreground shadow-sm bg-surface' : 'text-muted hover:text-foreground'}`}
              onClick={() => setActiveOption('installment')}
            >
              Installment Plan
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {activeOption === 'one-time' ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="amount">Amount <span className="text-danger">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Target size={16} />
                    </div>
                    <input
                      id="amount"
                      type="number"
                      className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                      placeholder="e.g. 100,000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required={activeOption === 'one-time'}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="dueDate">Due Date <span className="text-danger">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Calendar size={16} />
                    </div>
                    <input
                      id="dueDate"
                      type="date"
                      className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required={activeOption === 'one-time'}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="totalTarget">Total Target <span className="text-danger">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Target size={16} />
                    </div>
                    <input
                      id="totalTarget"
                      type="number"
                      className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                      placeholder="e.g. 120,000"
                      value={totalTarget}
                      onChange={(e) => setTotalTarget(e.target.value)}
                      required={activeOption === 'installment'}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="installments">Splits <span className="text-danger">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <Hash size={16} />
                      </div>
                      <input
                        id="installments"
                        type="number"
                        min="2"
                        max="2000"
                        className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                        placeholder="e.g. 4"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        required={activeOption === 'installment'}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="frequency">Frequency <span className="text-danger">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <Repeat size={16} />
                      </div>
                      <select
                        id="frequency"
                        className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background appearance-none"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Biweekly">Biweekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="startDate">Start Date <span className="text-danger">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Calendar size={16} />
                    </div>
                    <input
                      id="startDate"
                      type="date"
                      className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required={activeOption === 'installment'}
                    />
                  </div>
                </div>

                {previewInstallments.length > 0 && (
                  <div className="mt-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg max-h-[120px] overflow-y-auto">
                    <div className="text-xs font-bold text-secondary mb-2 uppercase tracking-wider">Plan Preview</div>
                    <div className="flex flex-col gap-1">
                      {previewInstallments.map((p) => (
                        <div key={p.number} className="flex justify-between items-center py-1 border-b border-secondary/10 last:border-b-0">
                          <span className="text-xs text-foreground/80">#{p.number} — {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          <strong className="text-xs text-secondary font-bold">{p.amount.toLocaleString()}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {showReplaceOption && (
              <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-xl mt-2">
                <input
                  type="checkbox"
                  id="replaceExisting"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border/50 text-secondary focus:ring-secondary/50 bg-background"
                />
                <label htmlFor="replaceExisting" className="text-sm text-foreground cursor-pointer flex-1 select-none">
                  <span className="font-semibold block mb-0.5 text-warning-foreground">Replace existing unpaid schedules?</span>
                  <span className="text-xs text-muted block leading-snug">
                    This will delete {existingUnpaid.length} unpaid schedule(s) totaling <strong>{existingUnpaidAmount.toLocaleString()}</strong> and replace them with this new plan.
                  </span>
                </label>
              </div>
            )}

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="notes">Notes</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <AlignLeft size={16} />
                </div>
                <input
                  id="notes"
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. Setup for project X"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

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
                {saving ? 'Saving...' : 'Save Plan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
