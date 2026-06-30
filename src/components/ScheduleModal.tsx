import React, { useState, useEffect } from 'react';
import { useJumuika, generateInstallmentDates } from '../context/JumuikaContext';
import { X } from 'lucide-react';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="modal-title">Schedule Contribution</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Creating schedule for <strong>{contributor?.fullName}</strong>
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 94, 126, 0.15)',
            border: '1px solid var(--status-overdue)',
            color: 'var(--status-overdue)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <div className="tab-container" style={{ marginBottom: '1.25rem' }}>
          <button 
            type="button"
            className={`tab-btn ${activeOption === 'one-time' ? 'active' : ''}`}
            onClick={() => setActiveOption('one-time')}
            style={{ flexGrow: 1, textAlign: 'center' }}
          >
            Option A: One-Time
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeOption === 'installment' ? 'active' : ''}`}
            onClick={() => setActiveOption('installment')}
            style={{ flexGrow: 1, textAlign: 'center' }}
          >
            Option B: Installment Plan
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeOption === 'one-time' ? (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="amount"
                    type="number"
                    className="form-control"
                    placeholder="e.g. 100,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required={activeOption === 'one-time'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dueDate">Due Date *</label>
                <input
                  id="dueDate"
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required={activeOption === 'one-time'}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="totalTarget">Total Target Amount *</label>
                <input
                  id="totalTarget"
                  type="number"
                  className="form-control"
                  placeholder="e.g. 120,000"
                  value={totalTarget}
                  onChange={(e) => setTotalTarget(e.target.value)}
                  required={activeOption === 'installment'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="installments">Number of Installments *</label>
                  <input
                    id="installments"
                    type="number"
                    min="2"
                    max="60"
                    className="form-control"
                    placeholder="e.g. 4"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    required={activeOption === 'installment'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="frequency">Frequency *</label>
                  <select
                    id="frequency"
                    className="form-control"
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

              <div className="form-group">
                <label className="form-label" htmlFor="startDate">Start Date / First Installment Due *</label>
                <input
                  id="startDate"
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required={activeOption === 'installment'}
                />
              </div>

              {previewInstallments.length > 0 && (
                <div className="schedule-preview-box">
                  <div className="preview-title">Generated Payment Plan Preview</div>
                  <div className="preview-list">
                    {previewInstallments.map((p) => (
                      <div key={p.number} className="preview-item">
                        <span>Installment #{p.number} — {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <strong>{p.amount.toLocaleString()} KES</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label" htmlFor="notes">Notes / Labels (Optional)</label>
            <input
              id="notes"
              type="text"
              className="form-control"
              placeholder="e.g. Development fund contribution"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating Schedule...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
