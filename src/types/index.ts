export interface Contributor {
  id: string;
  eventId: string;
  fullName: string;
  phone?: string;
  notes?: string;
  totalScheduled: number;
  totalPaid: number;
  remainingBalance: number;
  createdAt: any;
}

export interface Schedule {
  id: string;
  contributorId: string;
  eventId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  frequency: string; // 'one-time' | 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Custom'
  installmentNumber: number;
  status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Partially Paid' | 'Completed';
  amountPaid: number;
  remainingAmount: number;
  notes?: string;
  createdAt: any;
}

export interface Payment {
  id: string;
  contributorId: string;
  scheduleId?: string | null;
  eventId: string;
  amount: number;
  paymentMethod: string;
  recordedBy: string;
  notes?: string;
  createdAt: any;
}

export interface Event {
  id: string;
  name: string;
  eventType?: 'harambee' | 'merry-go-round' | 'table-banking';
  targetAmount?: number;
  rotationOrder?: string[]; // ordered contributorIds for merry-go-round
  createdAt: any;
}

export interface Payout {
  id: string;
  eventId: string;
  contributorId: string;
  amount: number;
  payoutDate: string;
  notes?: string;
  createdAt?: any;
}
