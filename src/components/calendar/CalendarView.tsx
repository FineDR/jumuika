import React, { useState, useMemo } from 'react';
import { useLocoo } from '../../context/LocooContext';
import { ChevronLeft, ChevronRight, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CalendarViewProps {
  onSelectContributorId: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectContributorId }) => {
  const { schedules, contributors } = useLocoo();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { t, i18n } = useTranslation();

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(2000, i, 1);
      return d.toLocaleDateString(i18n.language, { month: 'long' });
    });
  }, [i18n.language]);

  const weekdayNames = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      // 2000-01-02 is a Sunday
      const d = new Date(2000, 0, 2 + i);
      return d.toLocaleDateString(i18n.language, { weekday: 'short' });
    });
  }, [i18n.language]);

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
    return c ? c.fullName : t('calendar_view.unknown_contributor');
  };

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];
  const selectedDateTotalDue = selectedDateSchedules.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl font-extrabold text-foreground mb-2">{t('calendar_view.title')}</h2>
        <p className="text-xs sm:text-sm text-muted">{t('calendar_view.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Calendar Nav */}
        <div className="flex flex-col xs:flex-row justify-between items-center gap-3 bg-surface p-3 xs:p-4 sm:p-5 border border-border rounded-xl shadow-sm">
          <span className="font-heading text-lg xs:text-xl sm:text-2xl font-bold text-foreground text-center xs:text-left truncate w-full xs:w-auto">
            {monthNames[month]} {year}
          </span>
          <div className="flex gap-1.5 xs:gap-2 justify-center w-full xs:w-auto shrink-0">
            <button 
              className="p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/50" 
              onClick={handlePrevMonth}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 text-foreground font-semibold rounded-lg text-xs xs:text-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/50 flex-1 xs:flex-none justify-center text-center" 
              onClick={() => setCurrentDate(new Date())}
            >
              {t('calendar_view.today')}
            </button>
            <button 
              className="p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/50" 
              onClick={handleNextMonth}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 xs:gap-2 sm:gap-3">
          {weekdayNames.map((day) => (
            <div key={day} className="text-center py-1.5 sm:py-3 text-[10px] xs:text-xs sm:text-sm font-bold text-muted uppercase tracking-wider border-b border-border truncate" title={day}>
              <span className="hidden xs:inline">{day}</span>
              <span className="xs:hidden">{(day || '').charAt(0)}</span>
            </div>
          ))}

          {calendarDays.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="min-h-[48px] sm:min-h-[110px] bg-transparent rounded-lg sm:rounded-xl"></div>;
            }

            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dateSchedules = getSchedulesForDate(dayStr);
            const totalDue = dateSchedules.reduce((sum, curr) => sum + curr.remainingAmount, 0);
            
            const isToday = new Date().toLocaleDateString('en-CA') === dayStr;
            const hasData = dateSchedules.length > 0;

            return (
              <div 
                key={dayStr} 
                className={`flex flex-col justify-between sm:justify-between items-center sm:items-stretch min-h-[48px] sm:min-h-[110px] p-1 sm:p-3 bg-surface border rounded-lg sm:rounded-xl transition-all duration-fast ${hasData ? 'cursor-pointer hover:bg-foreground/5 hover:border-secondary hover:-translate-y-1 hover:shadow-md' : 'cursor-default border-border'} ${isToday ? 'border-secondary shadow-[0_0_15px_rgba(20,184,166,0.15)] ring-1 ring-secondary/50' : 'border-border'}`}
                onClick={() => hasData && setSelectedDate(dayStr)}
              >
                <span className={`font-bold text-xs sm:text-base text-center sm:text-left ${isToday ? 'text-secondary' : 'text-foreground'}`}>{dayNum}</span>
                {hasData && (
                  <>
                    <div className="hidden sm:flex flex-col gap-1.5 mt-2">
                      <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded text-center truncate">
                        {totalDue.toLocaleString()}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-warning/10 text-warning border border-warning/20 rounded text-center truncate">
                        {dateSchedules.length} {t('calendar_view.due')}
                      </span>
                    </div>
                    <div className="flex sm:hidden items-center justify-center gap-0.5 mt-0.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" title={`${totalDue.toLocaleString()} TZS`} />
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" title={`${dateSchedules.length} due`} />
                    </div>
                  </>
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
            <div className="flex justify-between items-start p-4 sm:p-6 border-b border-border/50 bg-foreground/[0.02]">
              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground truncate">
                  {new Date(selectedDate).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <span className="text-xs sm:text-sm text-muted truncate">
                  {t('calendar_view.total_expected')} <strong className="text-foreground">{selectedDateTotalDue.toLocaleString()} TZS</strong>
                </span>
              </div>
              <button 
                className="p-2 -mr-2 -mt-2 text-muted hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors cursor-pointer shrink-0" 
                onClick={() => setSelectedDate(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-3 sm:gap-4">
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
                    className="flex flex-col sm:flex-row justify-between gap-3 p-3.5 sm:p-4 bg-surface hover:bg-foreground/5 border border-border hover:border-secondary rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md min-w-0"
                    onClick={() => {
                      onSelectContributorId(schedule.contributorId);
                      setSelectedDate(null);
                    }}
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 font-bold text-foreground text-sm sm:text-base min-w-0">
                        <User size={16} className="text-secondary shrink-0" />
                        <span className="truncate flex-1 text-left">{getContributorName(schedule.contributorId)}</span>
                      </div>
                      <div className="text-[10px] xs:text-xs text-muted font-medium bg-foreground/5 self-start px-2 py-0.5 rounded uppercase tracking-wide">
                        {schedule.frequency === 'one-time' ? t('calendar_view.one_time') : `${t('calendar_view.installment')} #${schedule.installmentNumber}`}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <div className="font-bold text-secondary text-sm sm:text-lg">
                        {schedule.remainingAmount.toLocaleString()} TZS
                      </div>
                      <span className={`text-[9px] xs:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border uppercase tracking-wider shadow-sm ${badgeStyle}`}>
                        {t(`status.${schedule.status.toLowerCase().replace(' ', '_')}`)}
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
