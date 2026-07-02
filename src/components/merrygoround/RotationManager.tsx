import React, { useState, useCallback } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
import {
  X, ArrowUp, ArrowDown, RefreshCw, CheckCircle2,
  Clock, AlertCircle, Trophy, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

interface RotationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayoutModal: (contributorId: string) => void;
  inlinePage?: boolean; // render as a full page instead of a modal overlay
}

export const RotationManager: React.FC<RotationManagerProps> = ({
  isOpen,
  onClose,
  onOpenPayoutModal,
  inlinePage = false,
}) => {
  const {
    contributors,
    payouts,
    currentEventId,
    events,
    setRotationOrder,
  } = useJumuika();

  const currentEvent = events.find(e => e.id === currentEventId);
  const eventContributors = contributors.filter(c => c.eventId === currentEventId);
  const eventPayouts = payouts.filter(p => p.eventId === currentEventId);

  // Derive local order: use saved rotation or contributor join order
  const savedOrder: string[] = (currentEvent as any)?.rotationOrder ?? [];
  const defaultOrder = eventContributors.map(c => c.id);

  const buildInitialOrder = () => {
    if (savedOrder.length > 0) {
      // Merge: keep saved order but include any new contributors at the end
      const saved = savedOrder.filter(id => eventContributors.some(c => c.id === id));
      const unsaved = defaultOrder.filter(id => !saved.includes(id));
      return [...saved, ...unsaved];
    }
    return defaultOrder;
  };

  const [order, setOrder] = useState<string[]>(buildInitialOrder);
  const [saving, setSaving] = useState(false);

  // Re-initialise local order when modal opens
  React.useEffect(() => {
    if (isOpen) setOrder(buildInitialOrder());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentEventId, eventContributors.length]);

  const getName = (id: string) =>
    eventContributors.find(c => c.id === id)?.fullName ?? 'Unknown';

  // Derived rotation state
  const cycleLength = order.length;
  const totalPayouts = eventPayouts.length;
  const currentCycle = cycleLength > 0 ? Math.floor(totalPayouts / cycleLength) + 1 : 1;
  const currentTurnIndex = cycleLength > 0 ? totalPayouts % cycleLength : 0;
  const nextMemberId = cycleLength > 0 ? order[currentTurnIndex] : null;
  const payoutsThisCycle = totalPayouts % cycleLength;

  // Who has been paid in the current cycle
  const paidThisCycle = new Set(
    eventPayouts
      .slice(0, payoutsThisCycle === 0 && totalPayouts > 0 ? cycleLength : payoutsThisCycle)
      .map(p => p.contributorId)
  );

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setOrder(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    if (index === order.length - 1) return;
    setOrder(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, [order.length]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setRotationOrder(order);
      toast.success('Rotation order saved!');
    } catch {
      toast.error('Failed to save rotation order');
    } finally {
      setSaving(false);
    }
  };

  const handlePayoutNext = () => {
    if (!nextMemberId) return;
    onClose();
    onOpenPayoutModal(nextMemberId);
  };

  if (!isOpen && !inlinePage) return null;

  if (eventContributors.length === 0) {
    const emptyContent = (
      <div className="w-full max-w-[460px] bg-surface rounded-2xl border border-border/50 p-8 text-center flex flex-col items-center justify-center mx-auto">
        <Users size={40} className="text-muted mb-3" />
        <p className="text-foreground font-semibold mb-1">No members yet</p>
        <p className="text-muted text-sm mb-5">Add contributors first, then set up the rotation order.</p>
        {!inlinePage && <Button onClick={onClose} variant="ghost">Close</Button>}
      </div>
    );

    if (inlinePage) {
      return emptyContent;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
        {emptyContent}
      </div>
    );
  }

  const renderContent = () => (
    <div className={`w-full bg-surface rounded-2xl border border-border/50 flex flex-col overflow-hidden ${inlinePage ? '' : 'max-w-[500px] max-h-[92vh] shadow-2xl animate-scale-in'}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <RefreshCw size={18} className="text-violet-400" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">Rotation Manager</h3>
              <p className="text-xs text-muted mt-0.5">
                {currentEvent?.name} · Cycle {currentCycle}
              </p>
            </div>
          </div>
          <button
            className="p-1.5 bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-full transition-all focus:outline-none"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cycle Progress Banner */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-violet-500/8 border border-violet-500/20 rounded-xl">
            <div className="flex flex-col flex-1 gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  Cycle {currentCycle} Progress
                </span>
                <span className="text-xs font-bold text-violet-300">
                  {payoutsThisCycle === 0 && totalPayouts > 0 ? cycleLength : payoutsThisCycle}/{cycleLength} paid out
                </span>
              </div>
              <div className="h-1.5 bg-violet-500/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{
                    width: cycleLength > 0
                      ? `${((payoutsThisCycle === 0 && totalPayouts > 0 ? cycleLength : payoutsThisCycle) / cycleLength) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next Payout CTA */}
        {nextMemberId && (
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-secondary/8 border border-secondary/20 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
                  {getName(nextMemberId).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Next Payout</p>
                  <p className="text-sm font-bold text-foreground">{getName(nextMemberId)}</p>
                </div>
              </div>
              <Button
                variant="primary"
                className="text-xs px-3 py-1.5 gap-1.5 shrink-0"
                onClick={handlePayoutNext}
              >
                Pay Now →
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="px-4 pt-3">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <ArrowUp size={11} className="shrink-0" />
            Drag or use arrows to set who receives the pool each month.
          </p>
        </div>

        {/* Rotation Order List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {order.map((memberId, index) => {
            const isNext = memberId === nextMemberId;
            const hasPaid = paidThisCycle.has(memberId);
            const name = getName(memberId);
            const initial = name.charAt(0).toUpperCase();
            const allPaidInCycle = eventPayouts.filter(p => p.contributorId === memberId);
            const cyclesReceived = allPaidInCycle.length;

            return (
              <div
                key={memberId}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all ${
                  isNext
                    ? 'bg-secondary/10 border-secondary/30 ring-1 ring-secondary/20'
                    : hasPaid
                    ? 'bg-success/5 border-success/15'
                    : 'bg-foreground/[0.02] border-border/40 hover:bg-foreground/5'
                }`}
              >
                {/* Turn number */}
                <span className={`text-[11px] font-bold w-6 text-center shrink-0 ${
                  isNext ? 'text-secondary' : 'text-muted'
                }`}>
                  {index + 1}
                </span>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  isNext ? 'bg-secondary/20 text-secondary'
                  : hasPaid ? 'bg-success/20 text-success'
                  : 'bg-foreground/10 text-muted'
                }`}>
                  {initial}
                </div>

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isNext ? 'text-foreground' : 'text-foreground/80'}`}>
                    {name}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {cyclesReceived === 0
                      ? 'Not yet received'
                      : `Received ${cyclesReceived} time${cyclesReceived > 1 ? 's' : ''}`}
                  </p>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-1 shrink-0">
                  {isNext && (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                      <Clock size={8} /> NEXT
                    </span>
                  )}
                  {hasPaid && !isNext && (
                    <CheckCircle2 size={15} className="text-success" />
                  )}
                  {!hasPaid && !isNext && cyclesReceived === 0 && (
                    <AlertCircle size={15} className="text-muted/40" />
                  )}
                  {cyclesReceived > 1 && (
                    <Trophy size={13} className="text-amber-400" />
                  )}
                </div>

                {/* Move buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-foreground/10 disabled:opacity-20 text-muted transition-all"
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === order.length - 1}
                    className="p-1 rounded hover:bg-foreground/10 disabled:opacity-20 text-muted transition-all"
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 p-4 border-t border-border/50">
          <p className="text-[11px] text-muted">
            Total cycles completed: <span className="font-bold text-foreground">{Math.floor(totalPayouts / (cycleLength || 1))}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="px-4 py-2 text-sm" disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving} className="px-5 py-2 text-sm">
              Save Order
            </Button>
          </div>
        </div>
      </div>
  );

  if (inlinePage) {
    return renderContent();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      {renderContent()}
    </div>
  );
};
