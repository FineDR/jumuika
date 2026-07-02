import type { Schedule } from '../types';

export const calculateStatus = (dueDateStr: string, amount: number, amountPaid: number): Schedule['status'] => {
  if (amountPaid >= amount) {
    return 'Completed';
  }
  if (amountPaid > 0) {
    return 'Partially Paid';
  }
  
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  if (dueDateStr < todayStr) {
    return 'Overdue';
  } else if (dueDateStr === todayStr) {
    return 'Due Today';
  } else {
    return 'Upcoming';
  }
};

export const generateInstallmentDates = (startDateStr: string, count: number, frequency: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    if (frequency === 'Daily') {
      d.setDate(start.getDate() + i);
    } else if (frequency === 'Weekly') {
      d.setDate(start.getDate() + (i * 7));
    } else if (frequency === 'Biweekly') {
      d.setDate(start.getDate() + (i * 14));
    } else if (frequency === 'Monthly') {
      d.setMonth(start.getMonth() + i);
    } else { // Custom - default to 30 days
      d.setDate(start.getDate() + (i * 30));
    }
    dates.push(d.toLocaleDateString('en-CA')); // Safe local YYYY-MM-DD
  }
  return dates;
};
