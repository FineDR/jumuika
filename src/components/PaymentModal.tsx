import React, { useState, useEffect } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { X, Info } from 'lucide-react';

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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="modal-title">Record Payment</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Receiving payment from <strong>{contributor?.fullName}</strong>
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

        <form onSubmit={handleSubmit}>
          {unpaidSchedules.length > 0 && (
            <div className="form-group">
              <label className="form-label">Tribute Installment to Pay (Optional / Cascade Select)</label>
              <div className="quick-schedule-select">
                {unpaidSchedules.map((s) => (
                  <div 
                    key={s.id}
                    className={`quick-schedule-item ${selectedInstId === s.id ? 'selected' : ''}`}
                    onClick={() => handleSelectSchedule(s.id, s.remainingAmount)}
                  >
                    <div className="quick-schedule-info">
                      <span>
                        {s.frequency === 'one-time' ? 'One-time' : `Installment #${s.installmentNumber}`}
                      </span>
                      <span className="quick-schedule-due">Due: {s.dueDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="quick-schedule-amount">{s.remainingAmount.toLocaleString()} KES</span>
                      <span className={`badge badge-${
                        s.status === 'Completed' ? 'completed' :
                        s.status === 'Partially Paid' ? 'partial' :
                        s.status === 'Due Today' ? 'due' :
                        s.status === 'Overdue' ? 'overdue' : 'upcoming'
                      }`} style={{ scale: '0.85' }}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="amount">Payment Amount *</label>
            <input
              id="amount"
              type="number"
              className="form-control"
              placeholder="e.g. 30,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                className="form-control"
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

            <div className="form-group">
              <label className="form-label" htmlFor="recordedBy">Recorded By</label>
              <input
                id="recordedBy"
                type="text"
                className="form-control"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes">Payment Notes (Optional)</label>
            <input
              id="notes"
              type="text"
              className="form-control"
              placeholder="e.g. Received via M-Pesa transaction ref QX45..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {appDetails && (
            <div style={{
              background: 'rgba(173, 239, 209, 0.08)',
              border: '1px solid var(--secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              gap: '0.75rem',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              color: 'var(--text-main)',
              marginTop: '1rem',
              marginBottom: '1rem'
            }}>
              <Info size={16} className="text-secondary" style={{ flexShrink: 0, marginTop: '2px', color: 'var(--secondary)' }} />
              <div>{appDetails}</div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Processing Payment...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
