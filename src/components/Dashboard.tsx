import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { Calendar, AlertCircle, Clock, CheckCircle2, User, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onSelectContributorId: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectContributorId }) => {
  const { schedules, contributors, payments } = useJumuika();
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
    <div className="dashboard-view">
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="page-title">Scheduled Contributions</h2>
          <p className="page-subtitle">Track, monitor, and record contributor schedules dynamically</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="metric-card due-today" onClick={() => setActiveTab('today')}>
          <div className="metric-header">
            <span className="metric-title">Due Today</span>
            <div className="metric-icon" style={{ color: 'var(--status-due)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value">{dueTodaySchedules.length}</div>
          <div className="metric-subvalue">
            Expected: <strong>{dueTodayAmount.toLocaleString()} KES</strong>
          </div>
        </div>

        <div className="metric-card due-week" onClick={() => setActiveTab('week')}>
          <div className="metric-header">
            <span className="metric-title">Due This Week</span>
            <div className="metric-icon" style={{ color: 'var(--status-partial)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="metric-value">{dueThisWeekSchedules.length}</div>
          <div className="metric-subvalue">
            Expected: <strong>{dueThisWeekAmount.toLocaleString()} KES</strong>
          </div>
        </div>

        <div className="metric-card overdue" onClick={() => setActiveTab('overdue')}>
          <div className="metric-header">
            <span className="metric-title">Overdue</span>
            <div className="metric-icon" style={{ color: 'var(--status-overdue)' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="metric-value">{overdueSchedules.length}</div>
          <div className="metric-subvalue">
            Outstanding: <strong>{overdueAmount.toLocaleString()} KES</strong>
          </div>
        </div>

        <div className="metric-card upcoming" onClick={() => setActiveTab('upcoming')}>
          <div className="metric-header">
            <span className="metric-title">Upcoming</span>
            <div className="metric-icon" style={{ color: 'var(--status-upcoming)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value">{upcomingSchedules.length}</div>
          <div className="metric-subvalue">
            Scheduled: <strong>{upcomingAmount.toLocaleString()} KES</strong>
          </div>
        </div>

        <div className="metric-card completed" onClick={() => setActiveTab('completed')}>
          <div className="metric-header">
            <span className="metric-title">Completed Payments</span>
            <div className="metric-icon" style={{ color: 'var(--status-completed)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="metric-value">{payments.length}</div>
          <div className="metric-subvalue">
            Total Received: <strong>{completedAmount.toLocaleString()} KES</strong>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            Due Today ({dueTodaySchedules.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'week' ? 'active' : ''}`}
            onClick={() => setActiveTab('week')}
          >
            Due This Week ({dueThisWeekSchedules.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            Overdue ({overdueSchedules.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({upcomingSchedules.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({completedSchedules.length})
          </button>
        </div>

        <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>{getActiveTabTitle()}</h3>

        {listItems.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 className="empty-state-icon" />
            <p>No schedules found in this category.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contributor</th>
                  <th>Amount</th>
                  <th>Amount Paid</th>
                  <th>Remaining</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {listItems.map((schedule) => (
                  <tr 
                    key={schedule.id} 
                    className="clickable-row" 
                    onClick={() => onSelectContributorId(schedule.contributorId)}
                  >
                    <td>
                      <div className="flex align-center gap-2">
                        <User size={16} className="text-muted" />
                        <span style={{ fontWeight: 600 }}>{getContributorName(schedule.contributorId)}</span>
                      </div>
                    </td>
                    <td><strong>{schedule.amount.toLocaleString()} KES</strong></td>
                    <td style={{ color: 'var(--status-completed)' }}>{schedule.amountPaid.toLocaleString()} KES</td>
                    <td style={{ color: 'var(--status-overdue)' }}>{schedule.remainingAmount.toLocaleString()} KES</td>
                    <td>{schedule.dueDate}</td>
                    <td>
                      <span className={`badge badge-${
                        schedule.status === 'Completed' ? 'completed' :
                        schedule.status === 'Partially Paid' ? 'partial' :
                        schedule.status === 'Due Today' ? 'due' :
                        schedule.status === 'Overdue' ? 'overdue' : 'upcoming'
                      }`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center' }}
                      >
                        View Profile
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
