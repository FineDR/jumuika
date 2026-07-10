import React, { useState, useEffect } from 'react';
import { useLocoo } from '../../context/LocooContext';
import {
  X, FolderPlus, Target, HandHeart, RefreshCw, Landmark,
  ArrowUp, ArrowDown, Users, Trash2, ChevronRight,
  ChevronLeft, Plus, CheckCircle2, Check, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MemberInput {
  fullName: string;
  phone?: string;
  notes?: string;
}

export const EventsModal: React.FC<EventsModalProps> = ({ isOpen, onClose }) => {
  const { setupEventWizard } = useLocoo();
  const { t } = useTranslation();

  // Wizard flow state
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Step 1: Basics
  const [selectedType, setSelectedType] = useState<EventType>('harambee');
  const [eventName, setEventName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  // Step 2: Members
  const [members, setMembers] = useState<MemberInput[]>([]);
  const [addMode, setAddMode] = useState<'bulk' | 'individual'>('bulk');
  const [bulkInput, setBulkInput] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');

  // Step 3: Scheduling & Policies
  // Harambee settings
  const [harambeeMode, setHarambeeMode] = useState<'equal' | 'custom'>('equal');
  const [harambeeCustomAmount, setHarambeeCustomAmount] = useState('');
  const [harambeeFrequency, setHarambeeFrequency] = useState<'one-time' | 'Weekly' | 'Monthly'>('one-time');
  const [harambeeInstallments, setHarambeeInstallments] = useState('4');
  const [harambeeDueDate, setHarambeeDueDate] = useState(() => new Date().toLocaleDateString('en-CA'));

  // Merry-Go-Round settings
  const [mgrContribution, setMgrContribution] = useState('');
  const [mgrFrequency, setMgrFrequency] = useState<'Weekly' | 'Biweekly' | 'Monthly'>('Monthly');
  const [mgrStartDate, setMgrStartDate] = useState(() => new Date().toLocaleDateString('en-CA'));

  // Table Banking settings
  const [tbSavingsAmount, setTbSavingsAmount] = useState('');
  const [tbSavingsFrequency, setTbSavingsFrequency] = useState<'Weekly' | 'Monthly'>('Monthly');
  const [tbStartDate, setTbStartDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [tbInterestRate, setTbInterestRate] = useState('5');

  const EVENT_TYPES: EventTypeOption[] = [
    {
      id: 'harambee',
      label: t('events_modal.harambee'),
      description: t('events_modal.harambee_desc'),
      icon: <HandHeart size={20} />,
      color: 'text-emerald-500',
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      id: 'merry-go-round',
      label: t('events_modal.merry_go_round'),
      description: t('events_modal.merry_go_round_desc'),
      icon: <RefreshCw size={20} />,
      color: 'text-violet-500',
      borderColor: 'border-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      id: 'table-banking',
      label: t('events_modal.table_banking'),
      description: t('events_modal.table_banking_desc'),
      icon: <Landmark size={20} />,
      color: 'text-sky-500',
      borderColor: 'border-sky-500',
      bgColor: 'bg-sky-500/10',
    },
  ];

  // Auto-init Step 3 settings when switching type or target
  useEffect(() => {
    if (selectedType === 'merry-go-round') {
      setMgrContribution(targetAmount);
    } else if (selectedType === 'table-banking') {
      setTbSavingsAmount(targetAmount || '10000');
    }
  }, [selectedType, targetAmount]);

  if (!isOpen) return null;

  // Navigation handlers
  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!eventName.trim()) {
        setError(t('events_modal.name_required', 'Event Name is required'));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Process bulk input if active
      let finalMembers = [...members];
      if (addMode === 'bulk' && bulkInput.trim()) {
        const names = bulkInput
          .split('\n')
          .map(n => n.trim())
          .filter(n => n.length > 0);
        
        const newMembers = names.map(name => ({ fullName: name }));
        finalMembers = [...members, ...newMembers];
        // Remove duplicates based on name
        const uniqueMembers = finalMembers.filter(
          (value, index, self) =>
            self.findIndex(m => m.fullName.toLowerCase() === value.fullName.toLowerCase()) === index
        );
        setMembers(uniqueMembers);
        setBulkInput('');
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBackStep = () => {
    setError('');
    setStep(prev => Math.max(1, prev - 1));
  };

  // Member Handlers
  const addSingleMember = () => {
    setError('');
    if (!singleName.trim()) {
      setError(t('events_modal.member_name_required', 'Member Name is required'));
      return;
    }
    if (members.some(m => m.fullName.toLowerCase() === singleName.trim().toLowerCase())) {
      setError(t('events_modal.member_exists', 'A member with this name is already added'));
      return;
    }
    setMembers(prev => [...prev, { fullName: singleName.trim(), phone: singlePhone.trim() }]);
    setSingleName('');
    setSinglePhone('');
  };

  const removeMember = (index: number) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const moveMemberUp = (index: number) => {
    if (index === 0) return;
    setMembers(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveMemberDown = (index: number) => {
    if (index === members.length - 1) return;
    setMembers(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  // Setup/Submit handler
  const handleSubmit = async () => {
    setError('');
    setSaving(true);

    try {
      const eventInfo = {
        name: eventName.trim(),
        eventType: selectedType,
        targetAmount: targetAmount ? Number(targetAmount) : undefined,
      };

      // Construct scheduling configurations
      let scheduling: any = undefined;

      if (members.length > 0) {
        if (selectedType === 'harambee') {
          const goalAmount = targetAmount ? Number(targetAmount) : 0;
          let calculatedAmount = 0;
          
          if (harambeeMode === 'equal') {
            calculatedAmount = goalAmount > 0 ? Math.floor(goalAmount / members.length) : 0;
          } else {
            calculatedAmount = harambeeCustomAmount ? Number(harambeeCustomAmount) : 0;
          }

          if (calculatedAmount > 0) {
            scheduling = {
              type: harambeeFrequency === 'one-time' ? 'one-time' : 'installment',
              amount: calculatedAmount * (harambeeFrequency === 'one-time' ? 1 : Number(harambeeInstallments)),
              dueDateOrStartDate: harambeeDueDate,
              frequency: harambeeFrequency,
              installmentsCount: harambeeFrequency === 'one-time' ? 1 : Number(harambeeInstallments),
              notes: 'Harambee Setup contribution',
            };
          }
        } else if (selectedType === 'merry-go-round') {
          const mgrAmt = mgrContribution ? Number(mgrContribution) : 0;
          if (mgrAmt > 0) {
            scheduling = {
              type: 'installment',
              // Total scheduled amount = contribution amount * number of members (1 full round)
              amount: mgrAmt * members.length,
              dueDateOrStartDate: mgrStartDate,
              frequency: mgrFrequency,
              installmentsCount: members.length,
              notes: 'Merry-go-round Contribution',
            };
          }
        } else if (selectedType === 'table-banking') {
          const savingsAmt = tbSavingsAmount ? Number(tbSavingsAmount) : 0;
          if (savingsAmt > 0) {
            scheduling = {
              type: 'installment',
              // Seed 12 saving cycle installments (e.g. 12 months/weeks of savings)
              amount: savingsAmt * 12,
              dueDateOrStartDate: tbStartDate,
              frequency: tbSavingsFrequency,
              installmentsCount: 12,
              notes: 'Regular savings cycle',
            };
          }
          // Seed table banking default interest rate:
          // We can use targetAmount property to store the default interest rate in our context
          eventInfo.targetAmount = Number(tbInterestRate);
        }
      }

      await setupEventWizard(eventInfo, members, scheduling);

      // Clean up fields
      setEventName('');
      setTargetAmount('');
      setMembers([]);
      setBulkInput('');
      setStep(1);
      toast.success(t('events_modal.success_create', 'Event created successfully with configurations!'));
      onClose();
    } catch (err: any) {
      setError(err.message || t('events_modal.failed_create', 'Failed to create event'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[540px] bg-surface rounded-2xl shadow-2xl border border-border/50 animate-scale-in flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm shrink-0">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              {t('events_modal.setup_wizard', 'Event Setup Wizard')}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {step === 1 && t('events_modal.step_basics_desc', 'Step 1: Event Details & Goals')}
              {step === 2 && t('events_modal.step_members_desc', 'Step 2: Add Members Roster')}
              {step === 3 && t('events_modal.step_setup_desc', 'Step 3: Contribution Setup & Rules')}
              {step === 4 && t('events_modal.step_summary_desc', 'Step 4: Final Review & Confirmation')}
            </p>
          </div>
          <button
            className="p-1.5 bg-foreground/5 hover:bg-foreground/10 text-muted hover:text-foreground rounded-full transition-all focus:outline-none"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-border/30 flex shrink-0">
          <div
            className="h-full bg-secondary transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {/* Event Type Picker */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {t('events_modal.event_type', 'Event Type')} <span className="text-danger">*</span>
                </span>
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
                          {isSelected && (
                            <span
                              className={`w-2 h-2 rounded-full ${type.bgColor.replace('/10', '')} ${type.color}`}
                              style={{ backgroundColor: 'currentColor' }}
                            />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="eventName">
                  {t('events_modal.event_name', 'Event Name')} <span className="text-danger">*</span>
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
                      selectedType === 'harambee'
                        ? t('events_modal.harambee_placeholder', 'e.g. Wedding Harambee 2026')
                        : selectedType === 'merry-go-round'
                        ? t('events_modal.merry_go_round_placeholder', 'e.g. Chama Monthly Round')
                        : t('events_modal.table_banking_placeholder', 'e.g. Community Table Bank')
                    }
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Financial Goal Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider" htmlFor="targetAmount">
                  {selectedType === 'merry-go-round'
                    ? t('events_modal.monthly_contribution', 'Monthly Contribution per Member')
                    : selectedType === 'table-banking'
                    ? t('events_modal.target_savings', 'Savings Target per Cycle (Optional)')
                    : t('events_modal.target_amount', 'Target Fundraising Goal (Optional)')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Target size={16} />
                  </div>
                  <input
                    id="targetAmount"
                    type="number"
                    className="w-full pl-9 pr-3 py-2.5 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background"
                    placeholder={selectedType === 'merry-go-round' ? 'e.g. 50,000' : 'e.g. 1,000,000'}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MEMBER ROSTER */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} /> {t('events_modal.members_roster', 'Members Roster')}
                </span>
                <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs font-bold rounded-full">
                  {members.length} {t('events_modal.added', 'Added')}
                </span>
              </div>

              {/* Roster Add Tabs */}
              <div className="flex bg-foreground/5 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setAddMode('bulk')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    addMode === 'bulk' ? 'bg-background shadow text-foreground' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {t('events_modal.quick_bulk_add', 'Quick Bulk Add')}
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('individual')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    addMode === 'individual' ? 'bg-background shadow text-foreground' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {t('events_modal.add_individually', 'Add Individually')}
                </button>
              </div>

              {/* Bulk Textarea Input */}
              {addMode === 'bulk' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">
                    {t('events_modal.bulk_desc', 'Enter one member name per line to quickly build your roster.')}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-3 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 focus:bg-background resize-none"
                    placeholder="Jane Doe&#10;John Smith&#10;Amani K. Omari"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                  />
                </div>
              )}

              {/* Individual Form Inputs */}
              {addMode === 'individual' && (
                <div className="flex flex-col gap-3 p-3.5 bg-foreground/[0.02] border border-border/30 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Member Name</span>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-lg text-foreground text-xs focus:outline-none focus:border-secondary"
                      placeholder="e.g. Peter Kamau"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Phone Number (Optional)</span>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted">
                          <Phone size={12} />
                        </div>
                        <input
                          type="text"
                          className="w-full pl-7 pr-2 py-2 bg-foreground/5 border border-border/50 rounded-lg text-foreground text-xs focus:outline-none focus:border-secondary"
                          placeholder="e.g. +254712345678"
                          value={singlePhone}
                          onChange={(e) => setSinglePhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSingleMember}
                        className="h-9 px-3 shrink-0"
                      >
                        <Plus size={14} /> Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Roster List Scroll */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {t('events_modal.member_list', 'Added Members')}
                </span>
                {members.length === 0 ? (
                  <div className="py-6 border-2 border-dashed border-border/50 rounded-xl text-center text-muted text-xs">
                    {t('events_modal.no_members_yet', 'No members added to roster yet.')}
                  </div>
                ) : (
                  <div className="max-h-[160px] overflow-y-auto border border-border/50 rounded-xl bg-foreground/[0.01] divide-y divide-border/30">
                    {members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 hover:bg-foreground/[0.02] transition-all">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{member.fullName}</span>
                          {member.phone && <span className="text-[10px] text-muted">{member.phone}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="p-1 hover:bg-danger/10 text-muted hover:text-danger rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SPECIFIC CONFIGURATIONS */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              {/* HARAMBEE CONFIGURATION */}
              {selectedType === 'harambee' && (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 pb-2">
                    <HandHeart size={14} className="text-emerald-500" /> {t('events_modal.harambee_rules', 'Harambee Allocation & Schedule')}
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted uppercase">Distribution Mode</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setHarambeeMode('equal')}
                        className={`flex-1 p-3 border-2 rounded-xl text-left transition-all ${
                          harambeeMode === 'equal'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-border/50 hover:bg-foreground/5'
                        }`}
                      >
                        <p className="text-xs font-bold">Split Equally</p>
                        <p className="text-[10px] text-muted mt-0.5">Divide total goal equally among all members</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHarambeeMode('custom')}
                        className={`flex-1 p-3 border-2 rounded-xl text-left transition-all ${
                          harambeeMode === 'custom'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-border/50 hover:bg-foreground/5'
                        }`}
                      >
                        <p className="text-xs font-bold">Fixed Contribution</p>
                        <p className="text-[10px] text-muted mt-0.5">Set a flat contribution amount per member</p>
                      </button>
                    </div>
                  </div>

                  {harambeeMode === 'equal' && targetAmount && members.length > 0 && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs flex justify-between items-center text-emerald-400">
                      <span>Goal Split Amount:</span>
                      <span className="font-bold">{(Math.floor(Number(targetAmount) / members.length)).toLocaleString()} TZS per member</span>
                    </div>
                  )}

                  {harambeeMode === 'custom' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted uppercase">Contribution Amount per Member</span>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                        placeholder="e.g. 20,000"
                        value={harambeeCustomAmount}
                        onChange={(e) => setHarambeeCustomAmount(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted uppercase">Frequency</span>
                      <select
                        className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                        value={harambeeFrequency}
                        onChange={(e: any) => setHarambeeFrequency(e.target.value)}
                      >
                        <option value="one-time" className="bg-surface">One-Time Goal</option>
                        <option value="Weekly" className="bg-surface">Weekly Installments</option>
                        <option value="Monthly" className="bg-surface">Monthly Installments</option>
                      </select>
                    </div>

                    {harambeeFrequency !== 'one-time' ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-muted uppercase">Installments</span>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                          value={harambeeInstallments}
                          onChange={(e) => setHarambeeInstallments(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-muted uppercase">Due Date</span>
                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                          value={harambeeDueDate}
                          onChange={(e) => setHarambeeDueDate(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {harambeeFrequency !== 'one-time' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted uppercase">Start Date</span>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                        value={harambeeDueDate}
                        onChange={(e) => setHarambeeDueDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* MERRY-GO-ROUND CONFIGURATION */}
              {selectedType === 'merry-go-round' && (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 pb-2">
                    <RefreshCw size={14} className="text-violet-500" /> {t('events_modal.mgr_rules', 'Merry-Go-Round Settings & Order')}
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted uppercase">Contribution Amount per Member per Cycle</span>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                      placeholder="e.g. 50,000"
                      value={mgrContribution}
                      onChange={(e) => setMgrContribution(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted uppercase">Cycle Frequency</span>
                      <select
                        className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                        value={mgrFrequency}
                        onChange={(e: any) => setMgrFrequency(e.target.value)}
                      >
                        <option value="Weekly" className="bg-surface">Weekly</option>
                        <option value="Biweekly" className="bg-surface">Bi-weekly</option>
                        <option value="Monthly" className="bg-surface">Monthly</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted uppercase">First Rotation Date</span>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                        value={mgrStartDate}
                        onChange={(e) => setMgrStartDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rotation Order Sorting */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted uppercase">Rotation Payout Order</span>
                      <span className="text-[10px] text-muted font-semibold">Rearrange turns below</span>
                    </div>
                    {members.length === 0 ? (
                      <div className="p-4 border border-dashed border-border/50 rounded-xl text-center text-xs text-muted">
                        Add members in Step 2 to set up rotation order.
                      </div>
                    ) : (
                      <div className="max-h-[180px] overflow-y-auto border border-border/50 rounded-xl bg-foreground/[0.01] divide-y divide-border/30">
                        {members.map((member, index) => (
                          <div key={index} className="flex items-center justify-between p-2.5 hover:bg-foreground/[0.02]">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="text-xs font-bold text-foreground">{member.fullName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => moveMemberUp(index)}
                                disabled={index === 0}
                                className="p-1 hover:bg-foreground/5 text-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none rounded transition-all"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveMemberDown(index)}
                                disabled={index === members.length - 1}
                                className="p-1 hover:bg-foreground/5 text-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none rounded transition-all"
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TABLE BANKING CONFIGURATION */}
              {selectedType === 'table-banking' && (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 pb-2">
                    <Landmark size={14} className="text-sky-500" /> {t('events_modal.tb_rules', 'Table Banking Settings & Savings')}
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted uppercase">Recurring Savings Target per Cycle</span>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                      placeholder="e.g. 20,000"
                      value={tbSavingsAmount}
                      onChange={(e) => setTbSavingsAmount(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted uppercase">Savings Frequency</span>
                      <select
                        className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                        value={tbSavingsFrequency}
                        onChange={(e: any) => setTbSavingsFrequency(e.target.value)}
                      >
                        <option value="Weekly" className="bg-surface">Weekly</option>
                        <option value="Monthly" className="bg-surface">Monthly</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted uppercase">Savings Start Date</span>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                        value={tbStartDate}
                        onChange={(e) => setTbStartDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted uppercase">Default Loan Interest Rate (%)</span>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-secondary"
                        placeholder="e.g. 5"
                        value={tbInterestRate}
                        onChange={(e) => setTbInterestRate(e.target.value)}
                      />
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted text-sm font-semibold">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUMMARY & REVIEW */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 pb-2">
                <CheckCircle2 size={16} className="text-secondary" /> {t('events_modal.review', 'Review Configuration')}
              </span>

              <div className="grid grid-cols-2 gap-4 bg-foreground/[0.02] border border-border/50 p-4 rounded-xl text-xs gap-y-3">
                <div className="flex flex-col">
                  <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Event Name</span>
                  <span className="text-sm font-bold text-foreground mt-0.5">{eventName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Event Type</span>
                  <span className="text-sm font-bold text-foreground capitalize mt-0.5">{selectedType.replace(/-/g, ' ')}</span>
                </div>

                {selectedType === 'harambee' && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Fundraising Target Goal</span>
                      <span className="text-sm font-bold text-foreground mt-0.5">
                        {targetAmount ? `${Number(targetAmount).toLocaleString()} TZS` : 'No Target Set'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Allocation Plan</span>
                      <span className="text-sm font-bold text-foreground mt-0.5">
                        {harambeeMode === 'equal'
                          ? `Split Equally among ${members.length} members`
                          : `Fixed contributions of ${harambeeCustomAmount ? Number(harambeeCustomAmount).toLocaleString() : 0} TZS`}
                      </span>
                    </div>
                  </>
                )}

                {selectedType === 'merry-go-round' && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Cycle Contribution</span>
                      <span className="text-sm font-bold text-foreground mt-0.5">
                        {mgrContribution ? `${Number(mgrContribution).toLocaleString()} TZS per member` : 'No contribution amount set'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Rotation Frequency</span>
                      <span className="text-sm font-bold text-foreground mt-0.5">{mgrFrequency}</span>
                    </div>
                  </>
                )}

                {selectedType === 'table-banking' && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Savings target</span>
                      <span className="text-sm font-bold text-foreground mt-0.5">
                        {tbSavingsAmount ? `${Number(tbSavingsAmount).toLocaleString()} TZS / cycle` : 'No savings target set'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Default Interest Rate</span>
                      <span className="text-sm font-bold text-foreground mt-0.5">{tbInterestRate}%</span>
                    </div>
                  </>
                )}

                <div className="flex flex-col col-span-2 border-t border-border/30 pt-3">
                  <span className="text-muted font-medium uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Users size={10} /> Members Roster ({members.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-[100px] overflow-y-auto">
                    {members.length === 0 ? (
                      <span className="text-muted italic text-[11px]">No members added yet</span>
                    ) : (
                      members.map((m, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-foreground/5 border border-border/50 text-[11px] rounded-lg text-foreground font-semibold"
                        >
                          {i + 1}. {m.fullName}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col col-span-2 border-t border-border/30 pt-3 text-secondary bg-secondary/5 p-3 rounded-lg border border-secondary/20">
                  <span className="font-bold text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Seeding Plan Summary
                  </span>
                  <p className="text-[10px] text-muted mt-1 leading-relaxed">
                    {members.length === 0
                      ? 'No members will be created. You can register them later from the Members tab.'
                      : selectedType === 'harambee'
                      ? `We will create ${members.length} member profiles. For each member, we will create ${
                          harambeeFrequency === 'one-time' ? 'a one-time schedule' : `${harambeeInstallments} installment schedules`
                        } starting on ${harambeeDueDate}.`
                      : selectedType === 'merry-go-round'
                      ? `We will create ${members.length} member profiles and set the rotation order. Each member will get ${members.length} rotation contribution schedules of ${Number(mgrContribution).toLocaleString()} TZS starting on ${mgrStartDate}.`
                      : `We will create ${members.length} member profiles. We will seed 12 recurring savings schedules of ${Number(tbSavingsAmount).toLocaleString()} TZS for each member starting on ${tbStartDate}.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm shrink-0">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                type="button"
                onClick={handleBackStep}
                disabled={saving}
                className="px-4 py-2 text-xs flex items-center gap-1"
              >
                <ChevronLeft size={14} /> {t('events_modal.back', 'Back')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs"
            >
              {t('events_modal.cancel', 'Cancel')}
            </Button>
            {step < 4 ? (
              <Button
                variant="primary"
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2 text-xs flex items-center gap-1"
              >
                {t('events_modal.next', 'Next')} <ChevronRight size={14} />
              </Button>
            ) : (
              <Button
                variant="primary"
                type="button"
                onClick={handleSubmit}
                isLoading={saving}
                className="px-5 py-2 text-xs flex items-center gap-1"
              >
                <Check size={14} /> {saving ? t('events_modal.creating', 'Creating...') : t('events_modal.create_btn', 'Create Event')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
