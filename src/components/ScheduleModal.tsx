import React, { useState, useEffect } from 'react';
import { useJumuika, generateInstallmentDates } from '../context/JumuikaContext';
import { X } from 'lucide-react';
import { Button } from './ui/Button';

interface ScheduleModalProps {
  isOpen: boolean;
  contributorId: string | null;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, contributorId, onClose }) => {
  const { contributors, addSchedule } = useJumuika();
  const [activeOption, setActiveOption] = useState<'one-time' | 'installment'>('one-time');

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

  // Generate live installment preview
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
      await addSchedule(
        contributorId,
        isOneTime ? 'one-time' : 'installment',
        amountVal,
        dateVal,
        countVal,
        frequency,
        notes
      );
      // Reset form
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-lg border border-border animate-scale-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex flex-col">
            <h3 className="font-heading text-xl font-bold text-foreground">Schedule Contribution</h3>
            <span className="text-sm text-muted">
              Creating schedule for <strong className="text-foreground">{contributor?.fullName}</strong>
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

          <div className="flex gap-2 p-1.5 bg-foreground/5 border border-border rounded-lg mb-6">
            <button 
              type="button"
              className={`flex-1 text-center py-2.5 rounded-md font-semibold text-sm transition-all duration-fast ${activeOption === 'one-time' ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
              onClick={() => setActiveOption('one-time')}
            >
              Option A: One-Time
            </button>
            <button 
              type="button"
              className={`flex-1 text-center py-2.5 rounded-md font-semibold text-sm transition-all duration-fast ${activeOption === 'installment' ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
              onClick={() => setActiveOption('installment')}
            >
              Option B: Installment Plan
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {activeOption === 'one-time' ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-muted" htmlFor="amount">Amount *</label>
                  <input
                    id="amount"
                    type="number"
                    className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="e.g. 100,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required={activeOption === 'one-time'}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-muted" htmlFor="dueDate">Due Date *</label>
                  <input
                    id="dueDate"
                    type="date"
                    className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required={activeOption === 'one-time'}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-muted" htmlFor="totalTarget">Total Target Amount *</label>
                  <input
                    id="totalTarget"
                    type="number"
                    className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="e.g. 120,000"
                    value={totalTarget}
                    onChange={(e) => setTotalTarget(e.target.value)}
                    required={activeOption === 'installment'}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-semibold text-muted" htmlFor="installments">Number of Installments *</label>
                    <input
                      id="installments"
                      type="number"
                      min="2"
                      max="60"
                      className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="e.g. 4"
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      required={activeOption === 'installment'}
                    />
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-semibold text-muted" htmlFor="frequency">Frequency *</label>
                    <select
                      id="frequency"
                      className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Biweekly">Biweekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Custom">Custom (Every 30 Days)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-muted" htmlFor="startDate">Start Date / First Installment Due *</label>
                  <input
                    id="startDate"
                    type="date"
                    className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required={activeOption === 'installment'}
                  />
                </div>

                {previewInstallments.length > 0 && (
                  <div className="mt-4 p-5 bg-foreground/5 border border-border rounded-lg">
                    <div className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Generated Payment Plan Preview</div>
                    <div className="flex flex-col gap-1">
                      {previewInstallments.map((p) => (
                        <div key={p.number} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                          <span className="text-sm text-foreground">Installment #{p.number} — {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <strong className="text-sm text-foreground font-bold">{p.amount.toLocaleString()} KES</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted" htmlFor="notes">Notes / Labels (Optional)</label>
              <input
                id="notes"
                type="text"
                className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="e.g. Development fund contribution"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

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
                {saving ? 'Creating Schedule...' : 'Save Schedule'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
