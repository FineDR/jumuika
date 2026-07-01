import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { X, FolderPlus, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventsModal: React.FC<EventsModalProps> = ({ isOpen, onClose }) => {
  const { addEvent } = useJumuika();
  const [eventName, setEventName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
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
      await addEvent(eventName.trim(), targetAmount ? Number(targetAmount) : undefined);
      setEventName('');
      setTargetAmount('');
      toast.success('Event created successfully!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[400px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <h3 className="font-heading text-lg font-bold text-foreground">Create New Event</h3>
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="eventName">Event Name <span className="text-danger">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <FolderPlus size={16} />
                </div>
                <input
                  id="eventName"
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. Harambee Development 2026"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="targetAmount">Target Contribution Amount (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Target size={16} />
                </div>
                <input
                  id="targetAmount"
                  type="number"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. 100,000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
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
                {saving ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
