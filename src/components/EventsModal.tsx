import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { X } from 'lucide-react';

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventsModal: React.FC<EventsModalProps> = ({ isOpen, onClose }) => {
  const { addEvent } = useJumuika();
  const [eventName, setEventName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      setError('Event Name is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await addEvent(eventName.trim());
      setEventName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Event</h3>
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
            <label className="form-label" htmlFor="eventName">Event Name *</label>
            <input
              id="eventName"
              type="text"
              className="form-control"
              placeholder="e.g. Harambee Development 2026"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
