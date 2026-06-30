import React, { useState } from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { ChevronLeft, ChevronRight, User, X } from 'lucide-react';

interface CalendarViewProps {
  onSelectContributorId: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectContributorId }) => {
  const { schedules, contributors } = useJumuika();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create array of days
  const calendarDays: (number | null)[] = [];
  
  // Padding for blank days before the 1st of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }

  // Actual days in the month
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  // Group schedules by due date for easier lookup
  const getSchedulesForDate = (dateStr: string) => {
    return schedules.filter(s => s.dueDate === dateStr && s.remainingAmount > 0);
  };

  const getContributorName = (contributorId: string) => {
    const c = contributors.find(contrib => contrib.id === contributorId);
    return c ? c.fullName : 'Unknown Contributor';
  };

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];
  const selectedDateTotalDue = selectedDateSchedules.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  return (
    <div className="calendar-view-container">
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="page-title">Calendar View</h2>
          <p className="page-subtitle">Visualize expected collections and payment distributions by date</p>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-nav">
          <span className="calendar-month-year">
            {monthNames[month]} {year}
          </span>
          <div className="calendar-nav-buttons">
            <button className="btn btn-secondary" onClick={handlePrevMonth} style={{ padding: '0.5rem' }}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date())} style={{ fontSize: '0.85rem' }}>
              Today
            </button>
            <button className="btn btn-secondary" onClick={handleNextMonth} style={{ padding: '0.5rem' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {weekdayNames.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {calendarDays.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="calendar-day empty"></div>;
            }

            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dateSchedules = getSchedulesForDate(dayStr);
            const totalDue = dateSchedules.reduce((sum, curr) => sum + curr.remainingAmount, 0);
            
            const isToday = new Date().toLocaleDateString('en-CA') === dayStr;

            return (
              <div 
                key={dayStr} 
                className={`calendar-day ${isToday ? 'today' : ''}`}
                onClick={() => dateSchedules.length > 0 && setSelectedDate(dayStr)}
                style={{
                  cursor: dateSchedules.length > 0 ? 'pointer' : 'default',
                  border: isToday ? '1px solid var(--secondary)' : undefined
                }}
              >
                <span className="day-number">{dayNum}</span>
                {dateSchedules.length > 0 && (
                  <div className="day-data">
                    <span className="day-stats-pill expected">
                      {totalDue.toLocaleString()}
                    </span>
                    <span className="day-stats-pill count">
                      {dateSchedules.length} Due
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Detail Slider / Side Modal */}
      {selectedDate && (
        <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="modal-title">
                  {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Total expected collection: <strong>{selectedDateTotalDue.toLocaleString()} KES</strong>
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedDate(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {selectedDateSchedules.map((schedule) => (
                <div 
                  key={schedule.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'var(--transition)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    onSelectContributorId(schedule.contributorId);
                    setSelectedDate(null);
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--secondary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div>
                    <div className="flex align-center gap-2" style={{ fontWeight: 600 }}>
                      <User size={14} className="text-secondary" style={{ color: 'var(--secondary)' }} />
                      {getContributorName(schedule.contributorId)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {schedule.frequency === 'one-time' ? 'One-time' : `Installment #${schedule.installmentNumber}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                      {schedule.remainingAmount.toLocaleString()} KES
                    </div>
                    <span className={`badge badge-${
                      schedule.status === 'Completed' ? 'completed' :
                      schedule.status === 'Partially Paid' ? 'partial' :
                      schedule.status === 'Due Today' ? 'due' :
                      schedule.status === 'Overdue' ? 'overdue' : 'upcoming'
                    }`} style={{ scale: '0.8', marginRight: '-10px', marginTop: '0.25rem' }}>
                      {schedule.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
