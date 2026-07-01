import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

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
      toast.success('Event created successfully!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[450px] bg-surface rounded-2xl shadow-lg border border-border animate-scale-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-heading text-xl font-bold text-foreground">Create New Event</h3>
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted" htmlFor="eventName">Event Name *</label>
              <input
                id="eventName"
                type="text"
                className="w-full p-3 bg-background border border-border rounded-md text-foreground font-sans text-[0.95rem] transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g. Harambee Development 2026"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <Button 
                variant="ghost"
                type="button" 
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                type="submit" 
                isLoading={saving}
              >
                {saving ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
