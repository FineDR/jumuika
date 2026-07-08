import React, { useState, useEffect } from 'react';
import { useLocoo } from '../../context/LocooContext';
import { X, User, Phone, AlignLeft, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

interface ContributorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

import { useTranslation } from 'react-i18next';

export const ContributorRegisterModal: React.FC<ContributorRegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addContributor, events, currentEventId } = useLocoo();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedAmount, setExpectedAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const currentEvent = events.find(e => e.id === currentEventId);

  useEffect(() => {
    if (isOpen && currentEvent?.targetAmount) {
      setExpectedAmount(currentEvent.targetAmount.toString());
    } else if (!isOpen) {
      setExpectedAmount('');
    }
  }, [isOpen, currentEvent?.targetAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError(t('profile.name_required'));
      return;
    }
    setError('');
    setSaving(true);
    try {
      const amt = expectedAmount ? Number(expectedAmount) : undefined;
      const newId = await addContributor(fullName.trim(), phone.trim(), notes.trim(), amt);
      setFullName('');
      setPhone('');
      setNotes('');
      setExpectedAmount('');
      toast.success(t('profile.success_register'));
      onSuccess(newId);
      onClose();
    } catch (err: any) {
      setError(err.message || t('profile.failed_register'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[400px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <h3 className="font-heading text-lg font-bold text-foreground">{t('profile.register_contributor')}</h3>
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
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="fullName">{t('profile.full_name')} <span className="text-danger">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <User size={16} />
                </div>
                <input
                  id="fullName"
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="phone">{t('profile.phone_number')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Phone size={16} />
                </div>
                <input
                  id="phone"
                  type="tel"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. +254 712 345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="expectedAmount">{t('profile.expected_contribution')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Target size={16} />
                </div>
                <input
                  id="expectedAmount"
                  type="number"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                  placeholder="e.g. 100,000"
                  value={expectedAmount}
                  onChange={(e) => setExpectedAmount(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="notes">{t('profile.notes')}</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-muted">
                  <AlignLeft size={16} />
                </div>
                <textarea
                  id="notes"
                  className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background resize-y min-h-[80px]"
                  placeholder="e.g. Committee member"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                {t('profile.cancel')}
              </Button>
              <Button 
                variant="primary"
                type="submit" 
                isLoading={saving}
                className="px-5 py-2 text-sm"
              >
                {saving ? t('profile.registering') : t('profile.register_member')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
