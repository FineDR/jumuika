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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="font-heading text-3xl font-extrabold text-foreground mb-2">Calendar View</h2>
        <p className="text-sm text-muted">Visualize expected collections and payment distributions by date</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Calendar Nav */}
        <div className="flex justify-between items-center bg-surface p-4 sm:p-5 border border-border rounded-xl shadow-sm">
          <span className="font-heading text-xl sm:text-2xl font-bold text-foreground">
            {monthNames[month]} {year}
          </span>
          <div className="flex gap-2">
            <button 
              className="p-2 sm:p-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50" 
              onClick={handlePrevMonth}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              className="px-4 py-2 sm:py-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground font-semibold rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50" 
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
            <button 
              className="p-2 sm:p-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50" 
              onClick={handleNextMonth}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekdayNames.map((day) => (
            <div key={day} className="text-center py-2 sm:py-3 text-xs sm:text-sm font-bold text-muted uppercase tracking-wider border-b border-border">
              {day}
            </div>
          ))}

          {calendarDays.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="min-h-[100px] bg-transparent rounded-xl"></div>;
            }

            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dateSchedules = getSchedulesForDate(dayStr);
            const totalDue = dateSchedules.reduce((sum, curr) => sum + curr.remainingAmount, 0);
            
            const isToday = new Date().toLocaleDateString('en-CA') === dayStr;
            const hasData = dateSchedules.length > 0;

            return (
              <div 
                key={dayStr} 
                className={`flex flex-col justify-between min-h-[90px] sm:min-h-[110px] p-2 sm:p-3 bg-surface border rounded-xl transition-all duration-fast ${hasData ? 'cursor-pointer hover:bg-foreground/5 hover:border-secondary hover:-translate-y-1 hover:shadow-md' : 'cursor-default border-border'} ${isToday ? 'border-secondary shadow-[0_0_15px_rgba(20,184,166,0.15)] ring-1 ring-secondary/50' : 'border-border'}`}
                onClick={() => hasData && setSelectedDate(dayStr)}
              >
                <span className={`font-bold text-sm sm:text-base ${isToday ? 'text-secondary' : 'text-foreground'}`}>{dayNum}</span>
                {hasData && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded text-center truncate">
                      {totalDue.toLocaleString()}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-warning/10 text-warning border border-warning/20 rounded text-center truncate">
                      {dateSchedules.length} Due
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Detail Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start p-6 border-b border-border/50 bg-foreground/[0.02]">
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-xl font-bold text-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <span className="text-sm text-muted">
                  Total expected collection: <strong className="text-foreground">{selectedDateTotalDue.toLocaleString()} KES</strong>
                </span>
              </div>
              <button 
                className="p-2 -mr-2 -mt-2 text-muted hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors" 
                onClick={() => setSelectedDate(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              {selectedDateSchedules.map((schedule) => {
                const statusColors: Record<string, string> = {
                  'Completed': 'bg-success/10 text-success border-success/20',
                  'Partially Paid': 'bg-info/10 text-info border-info/20',
                  'Due Today': 'bg-warning/10 text-warning border-warning/20',
                  'Overdue': 'bg-danger/10 text-danger border-danger/20',
                  'Upcoming': 'bg-foreground/5 text-muted border-border'
                };

                const badgeStyle = statusColors[schedule.status] || statusColors['Upcoming'];

                return (
                  <div 
                    key={schedule.id}
                    className="flex flex-col sm:flex-row justify-between gap-3 p-4 bg-surface hover:bg-foreground/5 border border-border hover:border-secondary rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => {
                      onSelectContributorId(schedule.contributorId);
                      setSelectedDate(null);
                    }}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <User size={16} className="text-secondary" />
                        {getContributorName(schedule.contributorId)}
                      </div>
                      <div className="text-xs text-muted font-medium bg-foreground/5 self-start px-2 py-0.5 rounded uppercase tracking-wide">
                        {schedule.frequency === 'one-time' ? 'One-time' : `Installment #${schedule.installmentNumber}`}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <div className="font-bold text-secondary text-lg">
                        {schedule.remainingAmount.toLocaleString()} KES
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider shadow-sm ${badgeStyle}`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
