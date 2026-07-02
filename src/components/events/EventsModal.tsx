import React, { useState } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
import { X, FolderPlus, Target, HandHeart, RefreshCw, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

type EventType = 'harambee' | 'merry-go-round' | 'table-banking';

interface EventTypeOption {
  id: EventType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
}

const EVENT_TYPES: EventTypeOption[] = [
  {
    id: 'harambee',
    label: 'Harambee',
    description: 'Everyone contributes toward a shared one-time fundraising goal.',
    icon: <HandHeart size={22} />,
    color: 'text-emerald-500',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'merry-go-round',
    label: 'Merry-Go-Round',
    description: 'Members pay monthly and the pool is given to one member at a time.',
    icon: <RefreshCw size={22} />,
    color: 'text-violet-500',
    borderColor: 'border-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    id: 'table-banking',
    label: 'Table Banking',
    description: 'Pool savings grow and members can take loans from the shared fund.',
    icon: <Landmark size={22} />,
    color: 'text-sky-500',
    borderColor: 'border-sky-500',
    bgColor: 'bg-sky-500/10',
  },
];

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventsModal: React.FC<EventsModalProps> = ({ isOpen, onClose }) => {
  const { addEvent } = useJumuika();
  const [eventName, setEventName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedType, setSelectedType] = useState<EventType>('harambee');
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
      await addEvent(eventName.trim(), targetAmount ? Number(targetAmount) : undefined, selectedType);
      setEventName('');
      setTargetAmount('');
      setSelectedType('harambee');
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
      <div className="w-full max-w-[480px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <h3 className="font-heading text-lg font-bold text-foreground">Create New Event</h3>
          <button
            className="p-1.5 bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-full transition-all focus:outline-none"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex flex-col gap-5">
          {error && (
            <div className="p-2.5 bg-danger/10 border border-danger/20 text-danger rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Event Type Picker */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Event Type <span className="text-danger">*</span></span>
            <div className="flex flex-col gap-2">
              {EVENT_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? `${type.borderColor} ${type.bgColor}`
                        : 'border-border/50 bg-foreground/[0.02] hover:border-border hover:bg-foreground/5'
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${isSelected ? type.color : 'text-muted'}`}>
                      {type.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? type.color : 'text-foreground'}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-muted mt-0.5 leading-snug">{type.description}</p>
                    </div>
                    <span className={`ml-auto mt-1 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? `${type.borderColor}` : 'border-border'
                    }`}>
                      {isSelected && <span className={`w-2 h-2 rounded-full ${type.bgColor.replace('/10', '')} ${type.color}`} style={{ backgroundColor: 'currentColor' }} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="eventName">
                Event Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <FolderPlus size={16} />
                </div>
                <input
                  id="eventName"
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder={
                    selectedType === 'harambee' ? 'e.g. Wedding Harambee 2026'
                    : selectedType === 'merry-go-round' ? 'e.g. Chama Monthly Round'
                    : 'e.g. Community Table Bank'
                  }
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="targetAmount">
                {selectedType === 'merry-go-round' ? 'Monthly Contribution per Member (Optional)' : 'Target Amount (Optional)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Target size={16} />
                </div>
                <input
                  id="targetAmount"
                  type="number"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. 50,000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-1 pt-4 border-t border-border/50">
              <Button variant="ghost" type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={saving} className="px-5 py-2 text-sm">
                {saving ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
