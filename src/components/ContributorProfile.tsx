import React, { useState } from 'react';
import { useJumuika, type Schedule } from '../context/JumuikaContext';
import { 
  ArrowLeft, Plus, DollarSign, Edit2, Trash2, 
  Clock, AlertCircle, X, Phone, FileText 
} from 'lucide-react';

interface ContributorProfileProps {
  contributorId: string;
  onBack: () => void;
  onOpenScheduleModal: (contributorId: string) => void;
  onOpenPaymentModal: (contributorId: string, scheduleId?: string | null) => void;
}

export const ContributorProfile: React.FC<ContributorProfileProps> = ({
  contributorId,
  onBack,
  onOpenScheduleModal,
  onOpenPaymentModal
}) => {
  const { contributors, schedules, deleteSchedule, editSchedule } = useJumuika();
  
  // Edit schedule inline modal state
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDueDate, setEditDueDate] = useState<string>('');

  const contributor = contributors.find(c => c.id === contributorId);

  if (!contributor) {
    return (
      <div className="section-card">
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to list
        </button>
        <div className="empty-state">
          <AlertCircle size={48} className="text-danger" />
          <h3>Contributor Not Found</h3>
          <p>The contributor profile you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  // Filter contributor's schedules
  const contributorSchedules = schedules
    .filter(s => s.contributorId === contributorId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Calculations
  const totalScheduled = contributor.totalScheduled || 0;
  const totalPaid = contributor.totalPaid || 0;
  const remainingBalance = contributor.remainingBalance ?? (totalScheduled - totalPaid);

  // Overdue payments sum
  const overdueSchedules = contributorSchedules.filter(s => s.status === 'Overdue');
  const overdueAmount = overdueSchedules.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  // Find next due payment
  const unpaidSchedules = contributorSchedules.filter(s => s.remainingAmount > 0);
  const nextDueSchedule = unpaidSchedules.length > 0 ? unpaidSchedules[0] : null;

  // Percentage progress
  const progressPercent = totalScheduled > 0 
    ? Math.min(100, Math.round((totalPaid / totalScheduled) * 100)) 
    : 0;

  // Handle schedule deletion
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled installment? This will update the contributor total scheduled amount.')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (err) {
        alert('Failed to delete schedule installment');
      }
    }
  };

  // Open inline edit modal
  const handleOpenEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditAmount(schedule.amount);
    setEditDueDate(schedule.dueDate);
  };

  // Save edited schedule
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    if (editAmount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    try {
      await editSchedule(editingSchedule.id, editAmount, editDueDate);
      setEditingSchedule(null);
    } catch (err) {
      alert('Failed to edit scheduled installment');
    }
  };

  return (
    <div className="contributor-profile-view">
      <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Contributors
      </button>

      <div className="profile-grid">
        {/* Left Side: Summary Card */}
        <div className="profile-card section-card">
          <div className="profile-avatar-sec">
            <div className="profile-avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
              {contributor.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="profile-name-sec">
              <h3>{contributor.fullName}</h3>
              {contributor.phone && (
                <p>
                  <Phone size={14} /> {contributor.phone}
                </p>
              )}
            </div>
          </div>

          {contributor.notes && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.9rem'
            }}>
              <div className="flex align-center gap-2" style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <FileText size={12} /> Notes
              </div>
              <p style={{ fontStyle: 'italic', wordBreak: 'break-word' }}>{contributor.notes}</p>
            </div>
          )}

          <div className="profile-details-list">
            <div className="profile-detail-item">
              <span className="detail-label">Total Scheduled</span>
              <span className="detail-val">{totalScheduled.toLocaleString()} KES</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Total Paid</span>
              <span className="detail-val" style={{ color: 'var(--status-completed)' }}>
                {totalPaid.toLocaleString()} KES
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Remaining Balance</span>
              <span className="detail-val" style={{ color: remainingBalance > 0 ? 'var(--status-overdue)' : 'var(--text-muted)' }}>
                {remainingBalance.toLocaleString()} KES
              </span>
            </div>
            <div className="profile-detail-item" style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <span className="detail-label">Overdue Balance</span>
              <span className="detail-val" style={{ color: 'var(--status-overdue)' }}>
                {overdueAmount.toLocaleString()} KES
              </span>
            </div>
            {nextDueSchedule && (
              <div className="profile-detail-item" style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
                <span className="detail-label">Next Payment Due</span>
                <span className="detail-val" style={{ color: 'var(--status-due)' }}>
                  {nextDueSchedule.remainingAmount.toLocaleString()} KES ({nextDueSchedule.dueDate})
                </span>
              </div>
            )}
          </div>

          <div className="progress-container">
            <div className="progress-bar-label">
              <span>Payment Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={() => onOpenScheduleModal(contributorId)}>
              <Plus size={16} /> Schedule Contribution
            </button>
            <button className="btn btn-secondary" onClick={() => onOpenPaymentModal(contributorId)}>
              <DollarSign size={16} /> Record Payment
            </button>
          </div>
        </div>

        {/* Right Side: Schedule Timeline */}
        <div className="section-card">
          <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Payment Schedule</h3>

          {contributorSchedules.length === 0 ? (
            <div className="empty-state">
              <Clock size={40} className="empty-state-icon" />
              <p>No contributions scheduled for this member yet.</p>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenScheduleModal(contributorId)}
              >
                Schedule First Contribution
              </button>
            </div>
          ) : (
            <div className="timeline-list">
              {contributorSchedules.map((schedule) => {
                const isPaid = schedule.status === 'Completed';
                const isPartiallyPaid = schedule.status === 'Partially Paid';
                const canModify = schedule.amountPaid === 0;

                return (
                  <div key={schedule.id} className={`timeline-item ${
                    isPaid ? 'completed' :
                    isPartiallyPaid ? 'partial' :
                    schedule.status === 'Due Today' ? 'due' :
                    schedule.status === 'Overdue' ? 'overdue' : 'upcoming'
                  }`}>
                    <div className="timeline-node"></div>
                    <div className="timeline-content">
                      <div className="timeline-info">
                        <div className="timeline-date-row">
                          <span className="timeline-date">
                            {new Date(schedule.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span className="timeline-inst-num">
                            {schedule.frequency === 'one-time' ? 'One-time' : `Inst. ${schedule.installmentNumber}`}
                          </span>
                          <span className={`badge badge-${
                            schedule.status === 'Completed' ? 'completed' :
                            schedule.status === 'Partially Paid' ? 'partial' :
                            schedule.status === 'Due Today' ? 'due' :
                            schedule.status === 'Overdue' ? 'overdue' : 'upcoming'
                          }`}>
                            {schedule.status}
                          </span>
                        </div>
                        <div className="timeline-amounts">
                          Amount: <strong>{schedule.amount.toLocaleString()} KES</strong>
                          {(schedule.amountPaid > 0) && (
                            <span> | Paid: <span className="timeline-paid">{schedule.amountPaid.toLocaleString()} KES</span></span>
                          )}
                          {(!isPaid && schedule.amountPaid > 0) && (
                            <span> | Due: <span style={{ color: 'var(--status-overdue)' }}>{schedule.remainingAmount.toLocaleString()} KES</span></span>
                          )}
                        </div>
                        {schedule.notes && <div className="timeline-notes">{schedule.notes}</div>}
                      </div>

                      <div className="timeline-actions">
                        {!isPaid && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenPaymentModal(contributorId, schedule.id)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          >
                            Pay
                          </button>
                        )}
                        {canModify ? (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.4rem' }}
                              onClick={() => handleOpenEditModal(schedule)}
                              title="Edit installment details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.4rem', borderColor: 'rgba(255, 94, 126, 0.2)', color: 'var(--status-overdue)' }}
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              title="Delete scheduled installment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>
                            {isPaid ? 'Locked' : 'Locked (Paid part)'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit schedule modal */}
      {editingSchedule && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Installment</h3>
              <button className="modal-close-btn" onClick={() => setEditingSchedule(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label" htmlFor="editAmount">Installment Amount *</label>
                <input
                  id="editAmount"
                  type="number"
                  className="form-control"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editDueDate">Due Date *</label>
                <input
                  id="editDueDate"
                  type="date"
                  className="form-control"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSchedule(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
