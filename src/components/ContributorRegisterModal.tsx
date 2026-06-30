import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { X } from 'lucide-react';

interface ContributorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export const ContributorRegisterModal: React.FC<ContributorRegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addContributor } = useJumuika();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const newId = await addContributor(fullName.trim(), phone.trim(), notes.trim());
      setFullName('');
      setPhone('');
      setNotes('');
      onSuccess(newId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register contributor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Register Contributor</h3>
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
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              className="form-control"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number (Optional)</label>
            <input
              id="phone"
              type="tel"
              className="form-control"
              placeholder="e.g. +254 712 345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              className="form-control"
              rows={3}
              placeholder="e.g. Committee member, prefers M-Pesa payments"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Registering...' : 'Register Contributor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
