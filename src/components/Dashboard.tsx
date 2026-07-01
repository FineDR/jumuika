import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { Calendar, AlertCircle, Clock, CheckCircle2, User, } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  onSelectContributorId: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectContributorId }) => {
  const { schedules, contributors, payments } = useJumuika();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'overdue' | 'upcoming' | 'completed'>('today');

  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local time

  // Helper to identify if a schedule falls in the next 7 days (inclusive of today)
  const isInNext7Days = (dateStr: string) => {
    const today = new Date(todayStr);
    const dateVal = new Date(dateStr);
    const diffTime = dateVal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays < 7;
  };

  // 1. Group schedules by category
  const dueTodaySchedules = schedules.filter(s => s.dueDate === todayStr && s.remainingAmount > 0);
  const dueThisWeekSchedules = schedules.filter(s => isInNext7Days(s.dueDate) && s.remainingAmount > 0);
  const overdueSchedules = schedules.filter(s => s.dueDate < todayStr && s.remainingAmount > 0);
  const upcomingSchedules = schedules.filter(s => s.dueDate > todayStr && s.remainingAmount > 0);
  const completedSchedules = schedules.filter(s => s.status === 'Completed');

  // Sum calculations
  const dueTodayAmount = dueTodaySchedules.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const dueThisWeekAmount = dueThisWeekSchedules.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const overdueAmount = overdueSchedules.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const upcomingAmount = upcomingSchedules.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  // Total completed payments sum
  const completedAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);

  // Helper to map contributor name
  const getContributorName = (contributorId: string) => {
    const c = contributors.find(contrib => contrib.id === contributorId);
    return c ? c.fullName : 'Unknown Contributor';
  };

  // Get active tab list data
  const getActiveTabList = () => {
    switch (activeTab) {
      case 'today': return dueTodaySchedules;
      case 'week': return dueThisWeekSchedules;
      case 'overdue': return overdueSchedules;
      case 'upcoming': return upcomingSchedules;
      case 'completed': return completedSchedules;
    }
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'today': return 'Payments Due Today';
      case 'week': return 'Payments Due This Week';
      case 'overdue': return 'Overdue Contributions';
      case 'upcoming': return 'Upcoming Contributions';
      case 'completed': return 'Completed Scheduled Installments';
    }
  };

  const listItems = getActiveTabList();

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col">
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">{t('dashboard')}</h2>
        <p className="text-xs sm:text-sm text-muted mt-1">Track, monitor, and record contributor schedules dynamically</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <button className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 bg-surface border border-border border-l-4 border-l-warning rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md hover:bg-foreground/5 hover:-translate-y-0.5 transition-all text-left" onClick={() => setActiveTab('today')}>
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] sm:text-xs uppercase text-muted tracking-widest font-semibold">Due Today</span>
            <Clock size={16} className="text-warning shrink-0" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{dueTodaySchedules.length}</div>
          <div className="text-[11px] sm:text-sm text-muted">
            <strong className="text-foreground">{dueTodayAmount.toLocaleString()}</strong> KES
          </div>
        </button>

        <button className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 bg-surface border border-border border-l-4 border-l-info rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md hover:bg-foreground/5 hover:-translate-y-0.5 transition-all text-left" onClick={() => setActiveTab('week')}>
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] sm:text-xs uppercase text-muted tracking-widest font-semibold">This Week</span>
            <Calendar size={16} className="text-info shrink-0" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{dueThisWeekSchedules.length}</div>
          <div className="text-[11px] sm:text-sm text-muted">
            <strong className="text-foreground">{dueThisWeekAmount.toLocaleString()}</strong> KES
          </div>
        </button>

        <button className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 bg-surface border border-border border-l-4 border-l-danger rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md hover:bg-foreground/5 hover:-translate-y-0.5 transition-all text-left" onClick={() => setActiveTab('overdue')}>
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] sm:text-xs uppercase text-muted tracking-widest font-semibold">Overdue</span>
            <AlertCircle size={16} className="text-danger shrink-0" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{overdueSchedules.length}</div>
          <div className="text-[11px] sm:text-sm text-muted">
            <strong className="text-foreground">{overdueAmount.toLocaleString()}</strong> KES
          </div>
        </button>

        <button className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 bg-surface border border-border border-l-4 border-l-muted rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md hover:bg-foreground/5 hover:-translate-y-0.5 transition-all text-left" onClick={() => setActiveTab('upcoming')}>
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] sm:text-xs uppercase text-muted tracking-widest font-semibold">Upcoming</span>
            <Clock size={16} className="text-muted shrink-0" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{upcomingSchedules.length}</div>
          <div className="text-[11px] sm:text-sm text-muted">
            <strong className="text-foreground">{upcomingAmount.toLocaleString()}</strong> KES
          </div>
        </button>

        <button className="col-span-2 sm:col-span-1 flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 bg-surface border border-border border-l-4 border-l-success rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md hover:bg-foreground/5 hover:-translate-y-0.5 transition-all text-left" onClick={() => setActiveTab('completed')}>
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] sm:text-xs uppercase text-muted tracking-widest font-semibold">Completed</span>
            <CheckCircle2 size={16} className="text-success shrink-0" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{payments.length}</div>
          <div className="text-[11px] sm:text-sm text-muted">
            <strong className="text-foreground">{completedAmount.toLocaleString()}</strong> KES rcvd
          </div>
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex gap-1 border-b border-border mb-4 sm:mb-6 overflow-x-auto pb-0 -mx-1 px-1 scrollbar-hide">
          {[
            { key: 'today', label: 'Due Today', count: dueTodaySchedules.length },
            { key: 'week', label: 'This Week', count: dueThisWeekSchedules.length },
            { key: 'overdue', label: 'Overdue', count: overdueSchedules.length },
            { key: 'upcoming', label: 'Upcoming', count: upcomingSchedules.length },
            { key: 'completed', label: 'Completed', count: completedSchedules.length },
          ].map(tab => (
            <button
              key={tab.key}
              className={`px-3 sm:px-4 py-2.5 border-b-2 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap -mb-px ${activeTab === tab.key ? 'text-secondary border-secondary' : 'text-muted border-transparent hover:text-foreground'}`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <h3 className="font-heading text-lg sm:text-xl font-bold mb-4 sm:mb-6">{getActiveTabTitle()}</h3>

        {listItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-muted text-center gap-3 border-2 border-dashed border-border rounded-xl">
            <CheckCircle2 size={40} className="text-border" />
            <p className="font-medium text-sm">No schedules found in this category.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {listItems.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex flex-col gap-2 p-4 bg-foreground/[0.02] border border-border rounded-xl cursor-pointer hover:bg-foreground/5 transition-all"
                  onClick={() => onSelectContributorId(schedule.contributorId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <User size={14} className="text-muted shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">{getContributorName(schedule.contributorId)}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${schedule.status === 'Completed' ? 'bg-success/10 text-success' :
                        schedule.status === 'Partially Paid' ? 'bg-info/10 text-info' :
                          schedule.status === 'Due Today' ? 'bg-warning/10 text-warning' :
                            schedule.status === 'Overdue' ? 'bg-danger/10 text-danger' : 'bg-muted/10 text-muted'
                      }`}>{schedule.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Due: <strong className="text-foreground">{schedule.dueDate}</strong></span>
                    <span>Remaining: <strong className="text-danger">{schedule.remainingAmount.toLocaleString()} KES</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Contributor</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">Amount</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">Paid</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">Remaining</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Due Date</th>
                    <th className="px-4 py-3 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listItems.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="cursor-pointer hover:bg-foreground/5 transition-colors border-b border-border last:border-b-0"
                      onClick={() => onSelectContributorId(schedule.contributorId)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-muted shrink-0" />
                          <span className="font-semibold text-sm text-foreground">{getContributorName(schedule.contributorId)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-sm text-foreground text-right">{schedule.amount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-success text-right font-medium">{schedule.amountPaid.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-danger text-right font-medium">{schedule.remainingAmount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{schedule.dueDate}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${schedule.status === 'Completed' ? 'bg-success/10 text-success border border-success/20' :
                            schedule.status === 'Partially Paid' ? 'bg-info/10 text-info border border-info/20' :
                              schedule.status === 'Due Today' ? 'bg-warning/10 text-warning border border-warning/20' :
                                schedule.status === 'Overdue' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-muted/10 text-muted border border-muted/20'
                          }`}>
                          {schedule.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
